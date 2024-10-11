// pages/api/send-otp.js
import mongoose from 'mongoose';
import User from '../../../public/models/user'; // Assuming you have a User model
import Otp from '../../../public/models/Otp';
// import { sendOtpToMobile } from '../../app/utils/otpUtils'; // Utility function for sending OTP

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { mobileNumber } = req.body;

    if (!mobileNumber) {
      return res.status(400).json({ error: 'Mobile number is required' });
    }

    try {
      await mongoose.connect(process.env.MONGODB_URI);

      // Check if the user exists
      let user = await User.findOne({ mobileNumber});
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      if (!user) {
        // If user doesn't exist, create a new user
        user = new User({ mobileNumber,userName : `user${otp}`  });
        await user.save();
      }

      // Generate OTP
     
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

      // Save OTP in the database
      await Otp.findOneAndUpdate(
        { mobileNumber },
        { otp, expiresAt },
        { upsert: true, new: true }
      );

      // await sendOtpToMobile(mobileNumber, otp); // Uncomment this line to actually send the OTP

      res.status(200).json({ message: 'OTP sent successfully', otp });
    } catch (error) {
      console.error('Error sending OTP:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
