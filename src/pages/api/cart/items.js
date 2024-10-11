import dbConnect from '../../../app/lib/dbconnect';
import Cart from '../../../../public/models/Cart';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    await dbConnect();

    const { userId } = req.query;

    try {
      const cartItems = await Cart.find({ userId });
      res.json({ success: true, cartItems });
    } catch (error) {
      console.error('Error fetching cart items:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch cart items' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
