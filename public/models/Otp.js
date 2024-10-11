// models/Otp.js
import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  mobileNumber: { type: String, required: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

export default mongoose.models.Otp || mongoose.model('Otp', otpSchema);
