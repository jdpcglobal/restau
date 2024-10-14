// pages/api/delivery/getAddresses.js
import dbConnect from '../../app/lib/dbconnect';
import Address from '../../../public/models/Address';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      await dbConnect();

      // Extract token from authorization header
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      // Verify and decode token to get user ID
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.userId;

      // Fetch deliveries specific to the user
      const deliveries = await Address.find({ userId }).sort({ createdAt: -1 });

      return res.status(200).json({ success: true, deliveries });
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch deliveries.' });
    }
  } else {
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  }
}
