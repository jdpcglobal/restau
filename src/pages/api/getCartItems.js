import dbConnect from '../../app/lib/dbconnect';
import Cart from '../../../public/models/Cart';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  await dbConnect();

  // Ensure the request is a GET request
  if (req.method === 'GET') {
    // Get token from Authorization header
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, message: 'Token is required' });
    }

    try {
      // Verify the token and check for expiration
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const { userId, exp } = decoded;

      // Check if the token is expired
      if (Date.now() >= exp * 1000) {
        return res.status(401).json({ success: false, message: 'Token has expired, please log in again' });
      }

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
      }

      // Find the cart items for the user and populate food details
      const cartItems = await Cart.find({ userId })
        .populate('foodId', 'name price discount imageUrl gstRate');

      // Return the cart items in the response
      return res.status(200).json({ success: true, cartItems });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Token has expired, please log in again' });
      } else if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ success: false, message: 'Invalid token' });
      } else {
        console.error('Error fetching cart items:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch cart items' });
      }
    }
  } else {
    // Handle unsupported HTTP methods
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}
