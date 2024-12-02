// pages/api/tables.js
import dbConnect from "../../app/lib/dbconnect"; // Ensure your database connection utility is working
import Table from "../../../public/models/Table"; // Adjust the path as per your directory structure

export default async function handler(req, res) {
  await dbConnect(); // Connect to the database

  if (req.method === "POST") {
    const { tableName, seatNumber } = req.body;

    // Validate input
    if (!tableName || !seatNumber) {
      return res.status(400).json({ error: "Table name and seat number are required." });
    }

    try {
      // Create a new table document
      const newTable = await Table.create({ tableName, seatNumber });
      return res.status(201).json({ message: "Table added successfully!", table: newTable });
    } catch (error) {
      console.error("Error saving table:", error);
      return res.status(500).json({ error: "Failed to add table. Please try again." });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
