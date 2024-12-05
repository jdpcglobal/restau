import mongoose from "mongoose";

const TableSchema = new mongoose.Schema(
  {
    tableName: {
      type: String,
      required: true,
      trim: true,
    },
    seatNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      required: true,
      enum: ["occupied", "reserved","available"], // Define allowed values
      default: "available", // Set default value
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Table || mongoose.model("Table", TableSchema);
