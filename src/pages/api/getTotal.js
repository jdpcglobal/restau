// api/gettotal.js
import Order from '../../../public/models/Order'; // Import your Order model
import connectDB from '../../app/lib/dbconnect'; // DB connection utility
import { verifyToken } from '../../app/utils/verifyToken'; // Token verification utility

const handler = async (req, res) => {
  await connectDB();

  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const decodedToken = verifyToken(token); // Verify and decode token to get userId
    const userId = decodedToken.userId;
    console.log("User ID:", userId); // Debugging log

    // Fetch the latest order for the user
    const latestOrder = await Order.findOne({ userId }).sort({ createdAt: -1 });
    console.log("Latest Order:", latestOrder); // Debugging log

    if (!latestOrder) {
      return res.status(404).json({ success: false, message: 'No order found' });
    }

    // Assuming 'totalAmount' is the field storing the total of the order
    const orderTotal = latestOrder.total;

    res.status(200).json({
      success: true,
      orderTotal, // Return the total of the latest order
    });
  } catch (error) {
    console.error('Error fetching order total:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export default handler;
