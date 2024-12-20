import mongoose from 'mongoose';
import User from '../../../public/models/user'; // Assuming you have a User model
import Otp from '../../../public/models/Otp';
import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { mobileNumber, verifyOtp, otpToVerify } = req.body;

    if (!mobileNumber) {
      return res.status(400).json({ error: 'Mobile number is required' });
    }

    try {
      await mongoose.connect(process.env.MONGODB_URI);

      // Check if verification is requested
      if (verifyOtp && otpToVerify) {
        const existingOtp = await Otp.findOne({ mobileNumber });

        if (
          existingOtp &&
          existingOtp.otp === otpToVerify &&
          existingOtp.lastSent &&
          existingOtp.resendCount == 0 || new Date() < new Date(existingOtp.lastSent.getTime() + 10 * 60 * 1000) // OTP valid for 10 minutes
        ) {
          await Otp.findOneAndUpdate(
            { mobileNumber },
            {
              $set: {
                resendCount: 0,
                
                lastSent: new Date() // Set to the current date to clear the OTP
              }
            },
            { new: true } // Return the updated document
          );
          return res.status(200).json({ message: 'OTP verified successfully' });
        } else {
          return res.status(400).json({ error: 'Invalid or expired OTP' });
        }
      }

      // Generate OTP logic
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      let otpRecord = await Otp.findOne({ mobileNumber });

      const now = new Date();

      if (!otpRecord) {
        // Create a new OTP record if it doesn't exist
        otpRecord = new Otp({
          mobileNumber,
          otp,
          resendCount: 1,
          lastSent: now + 1 * 60 * 1000,
        });
        await otpRecord.save();
      } else {
        // Handle resend logic
        const resendDelay = otpRecord.resendCount < 3 ? 1 * 60 * 1000 : 15 * 60 * 1000; // 1 minute or 15 minutes
        const nextAllowedTime = new Date(otpRecord.lastSent.getTime() + resendDelay);

        if (now < nextAllowedTime) {
          const remainingTime = Math.ceil((nextAllowedTime - now) / 1000); // Remaining time in seconds
          const minutes = Math.floor(remainingTime / 60);
          const seconds = remainingTime % 60;
          return res.status(429).json({
            error: 'OTP already sent. Please wait.',
            timeRemaining: `${minutes}:${seconds.toString().padStart(2, '0')}`,
          });
        }

        if (otpRecord.resendCount < 3) {
          otpRecord.lastSent = new Date(now.getTime() + 1 * 60 * 1000); // Add 1 minute
        } else {
          otpRecord.lastSent = new Date(now.getTime() + 15 * 60 * 1000); // Add 15 minutes
        }

        otpRecord.resendCount += 1;
        otpRecord.otp = otp;
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
      console.error('Error sending OTP:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
