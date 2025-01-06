import { sign } from 'jsonwebtoken';
import { serialize } from 'cookie';
import logintable from '../../../public/models/logintable'; // Updated model import
import dbConnect from '../../app/lib/dbconnect'; // Ensure your DB connection file exists

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { username, password } = req.body;

  try {
    await dbConnect();
    const user = await logintable.findOne({ username, password }); // Use the logintable model

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token and set as cookie
    const token = sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.setHeader(
      'Set-Cookie',
      serialize('userId', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3600,
        path: '/',
      })
    );

    res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
}
