import dbConnect from "../../app/lib/dbconnect"; // Adjust the path based on your project structure
import Table from "../../../public/models/Table"; // Adjust the model path

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "GET") {
    try {
      const tables = await Table.find(); // Fetch all tables
      return res.status(200).json({ tables });
    } catch (error) {
      console.error("Error fetching tables:", error);
      return res.status(500).json({ error: "Failed to fetch tables." });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
