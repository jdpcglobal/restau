import mongoose from "mongoose";

const TablesaveSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true },
    mobileNumber: { type: String, default: 0},
    seatNumber: { type: Number, default: 0 },
    tableNumber: { type: String, required: true },
    maxPax: { type: Number, required: true },
    orderItems: [
      {
        itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Item" },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, default: 1 },
        itemstatus: {
          type: String,
          enum: ["pending", "Preparing", "Ready", "Served", "Cancelled"],
          default: "pending",
        },
        total: { type: Number, required: true },
      },
    ],
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "processing", "completed" ],
      default: "pending",
    },
    createdDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Tablesave || mongoose.model("Tablesave", TablesaveSchema);
