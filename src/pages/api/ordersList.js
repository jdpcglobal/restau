import dbConnect from '../../app/lib/dbconnect'; 
import OrderPayment from '../../../public/models/OrderPayment'; 
import User from '../../../public/models/user'; 
import Address from '../../../public/models/Address'

export default async function handler(req, res) {
  await dbConnect();

  try {
    const orders = await OrderPayment.find()
      .populate({
        path: 'user', // Reference to the User model
        select: 'mobileNumber', // Fields to include from User
      })
      .populate({
        path: 'selectedAddress', // Populate address details
        select: 'flatNo landmark location', // Adjust fields as needed
      })
      .populate({
        path: 'items.foodId', // Populate food item details
      });

    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
