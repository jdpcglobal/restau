import dbConnect from '../../app/lib/dbconnect'; // Adjust path if necessary
import OrderPayment from '../../../public/models/OrderPayment'; // Adjust path if necessary
import Cart from '../../../public/models/Cart'; // Adjust path if necessary
import Address from '../../../public/models/Address'; // Adjust path if necessary
import Order from '../../../public/models/Order'; // Adjust path if necessary
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { token, paymentMethod, UTR } = req.body;

    // Validate request body
    if (!token || !paymentMethod) {
      return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
    }

    const userId = decoded?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Invalid token. User ID not found or invalid.' });
    }

    // Get cart items for the user
    const cartItems = await Cart.find({ userId }).populate('foodId');
    if (cartItems.length === 0) {
      return res.status(400).json({ success: false, message: 'No items found in cart.' });
    }

    // Calculate total amount
    const calculatedTotalAmount = cartItems.reduce((acc, cartItem) => {
      return acc + (cartItem.foodId.price *(cartItem.foodId.discount / 100)* cartItem.quantity);
    }, 0);

    // Validate total amount
    if (calculatedTotalAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Total amount does not match calculated amount.' });
    }

    // Get the selected address from the user's orders
    const existingOrder = await Order.findOne({ user: userId }).sort({ date: -1 });
    if (!existingOrder || !existingOrder.selectedAddress) {
      return res.status(400).json({ success: false, message: 'No address found for user.' });
    }

    const selectedAddressId = existingOrder.selectedAddress;
    const address = await Address.findById(selectedAddressId);
    if (!address) {
      return res.status(400).json({ success: false, message: 'Selected address not found.' });
    }

    // Validate UTR if payment method is UPI
    if (paymentMethod === 'UPI') {
      if (!UTR || UTR.length !== 12) {
        return res.status(400).json({ success: false, message: 'For UPI payments, a valid 12-digit UTR number is required.' });
      }

      // Check if UTR exists in the database for any user
      const existingUTR = await OrderPayment.findOne({ UTR });
      if (existingUTR) {
        return res.status(400).json({ success: false, message: 'UTR already exists. Please enter a valid UTR.' });
      }
    }

    // Create a new OrderPayment
    const newOrderPayment = new OrderPayment({
      user: userId,
      selectedAddress: selectedAddressId,
      items: cartItems.map(cartItem => ({
        foodId: cartItem.foodId._id,
        quantity: cartItem.quantity,
        price: cartItem.foodId.price,
      })),
      totalAmount: calculatedTotalAmount,
      paymentMethod,
      UTR: paymentMethod === 'CashOnDelivery' ? null : UTR, // UTR is null for CashOnDelivery
      paymentStatus: paymentMethod === 'CashOnDelivery' ? 'Cash on Delivery' : 'Paid',
    });

    // Save the order payment to the database
    await newOrderPayment.save();

    // Clear the cart
    await Cart.deleteMany({ userId });

    return res.status(201).json({
      success: true,
      message: 'Order payment created successfully',
      orderPayment: newOrderPayment,
    });

  } catch (error) {
    console.error('Error in order payment API:', error);
    return res.status(500).json({ success: false, message: 'Failed to create order payment. Please try again later.' });
  }
}
