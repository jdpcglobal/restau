import dbConnect from '../../app/lib/dbconnect';
import Order from '../../../public/models/Order'; // Adjust import path
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    await dbConnect();

    try {
      const { addressId } = req.body;

      // Extract token from the Authorization header
      const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

      if (!addressId) {
        return res.status(400).json({ success: false, message: 'Address ID is required.' });
      }

      if (!token) {
        return res.status(400).json({ success: false, message: 'Token is required.' });
      }

      // Verify the token
      let decodedToken;
      try {
        decodedToken = jwt.verify(token, process.env.JWT_SECRET); // Replace with your JWT secret
      } catch (err) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
      }

      const userId = decodedToken.userId; // Assuming your token contains the user ID

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      console.log('User ID:', userId);

      // Update or create order with the selected address ID
      let order = await Order.findOne({ user: userId });
      
      if (!order) {
        order = new Order({ user: userId, selectedAddress: addressId }); // Create new order
      } else {
        order.selectedAddress = addressId; // Update existing order
      }
      
      await order.save();

      return res.status(200).json({ success: true, message: 'Order updated successfully.' });
    } catch (error) {
      console.error('Error during checkout:', error);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
