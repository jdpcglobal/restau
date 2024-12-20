import mongoose from 'mongoose';
import Otp from '../../../public/models/Otp';
import User from '../../../public/models/user'; // Assuming you have a User model
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { mobileNumber, otp } = req.body;

    if (!mobileNumber || !otp) {
      return res.status(400).json({ error: 'Mobile number and OTP are required' });
    }

    try {
      await mongoose.connect(process.env.MONGODB_URI);

      // Find the OTP record for the mobile number
      const otpRecord = await Otp.findOne({ mobileNumber });

      if (!otpRecord) {
        return res.status(400).json({ error: 'No valid OTP found' });
      }

      // Verify OTP
      if (otpRecord.otp !== otp) {
        return res.status(400).json({ error: 'Invalid OTP' });
      }

      // Reset resend count and clear OTP after successful verification
      await Otp.findOneAndUpdate(
        { mobileNumber },
        { resendCount: 0, otp: null, lastSent: new Date() }
      );

      // Find the user associated with the mobile number
      const user = await User.findOne({ mobileNumber });

      if (!user) {
        return res.status(400).json({ error: 'User not found' });
      }

      // If the user is not verified, verify them
      if (!user.isVerified) {
        user.isVerified = true;
        await user.save();
      }

      // Generate JWT tokens with the userId
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      const refreshToken = jwt.sign({ userId: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

      res.status(200).json({ message: 'OTP verified successfully', token, refreshToken });
    } catch (error) {
      console.error('Error verifying OTP:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
