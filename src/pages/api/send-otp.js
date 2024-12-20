import mongoose from 'mongoose';
import User from '../../../public/models/user'; // Assuming you have a User model
import Otp from '../../../public/models/Otp';
import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { mobileNumber, verifyOtp, otpToVerify } = req.body;

  if (!mobileNumber) {
    return res.status(400).json({ error: 'Mobile number is required' });
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const now = new Date();

    // Handle OTP verification
    if (verifyOtp && otpToVerify) {
      const existingOtp = await Otp.findOne({ mobileNumber });

      if (
        existingOtp &&
        existingOtp.otp === otpToVerify &&
        existingOtp.lastSent &&
        now < new Date(existingOtp.lastSent.getTime() + 10 * 60 * 1000) // OTP valid for 10 minutes
      ) {
        await Otp.updateOne(
          { mobileNumber },
          { $set: { otp: null, resendCount: 0, lastSent: now } }
        );
        return res.status(200).json({ message: 'OTP verified successfully' });
      } else {
        return res.status(400).json({ error: 'Invalid or expired OTP' });
      }
    }

    // Generate a new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    let otpRecord = await Otp.findOne({ mobileNumber });

    const resendDelay = otpRecord?.resendCount < 3 ? 1 * 60 * 1000 : 15 * 60 * 1000;
    const nextAllowedTime = otpRecord
      ? new Date(otpRecord.lastSent.getTime() + resendDelay)
      : null;

    if (otpRecord && now < nextAllowedTime) {
      const remainingTime = Math.ceil((nextAllowedTime - now) / 1000);
      const minutes = Math.floor(remainingTime / 60);
      const seconds = remainingTime % 60;
      return res.status(429).json({
        error: `OTP already sent. Please wait ${minutes}:${seconds.toString().padStart(2, '0')} before resending.`,
        timeRemaining: `${minutes}:${seconds.toString().padStart(2, '0')}`,
      });
    }

    if (!otpRecord) {
      otpRecord = new Otp({
        mobileNumber,
        otp,
        resendCount: 1,
        lastSent: now,
      });
      await otpRecord.save();
    } else {
      otpRecord.otp = otp;
      otpRecord.resendCount += 1;
      otpRecord.lastSent = now;
      await otpRecord.save();
    }

    // Format mobile number for the PHP API
    const formattedMobile =
      mobileNumber.length > 10 ? mobileNumber.split(' ')[0] : mobileNumber;
    const fullMobile = formattedMobile.padStart(12, '91');

    const postData = {
      From: 'EFLATB',
      To: fullMobile,
      TemplateName: 'ContentEFBOTP',
      VAR1: otp,
    };

    const phpApiUrl =
      'http://2factor.in/API/V1/51a830db-c684-11e6-afa5-00163ef91450/ADDON_SERVICES/SEND/TSMS';

    const response = await fetch(phpApiUrl, {
      method: 'POST',
      body: new URLSearchParams(postData),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const result = await response.text();

    if (response.ok) {
      return res.status(200).json({ message: 'OTP sent successfully', otp });
    } else {
      throw new Error(result || 'Failed to send OTP');
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
