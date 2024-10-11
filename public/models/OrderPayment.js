import mongoose from 'mongoose';

const OrderPaymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  selectedAddress: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address',
    required: true,
  },
  items: [
    {
      foodId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
    },
  ],
  totalAmount: { type: Number, required: true },
  paymentMethod: {
    type: String,
    enum: ['UPI', 'CashOnDelivery'],
    required: true,
  },
  UTR: {
    type: String,
   
  },
  paymentStatus: {
    type: String,
    enum: ['Paid', 'Cash on Delivery'],
    required: true,
    default: 'Pending',
  },
  status: {
    type: String,
    enum: ['Accept','Pending', 'Processing', 'Delivered', 'Cancelled'],
    default: 'Accept',
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.OrderPayment || mongoose.model('OrderPayment', OrderPaymentSchema);
