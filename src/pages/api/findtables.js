import dbConnect from "../../app/lib/dbconnect";
import Tablesave from "../../../public/models/tablesave";

const handler = async (req, res) => {
  if (req.method === "GET") {
    dbConnect();
    try {
      // Fetch tables without populating related fields
      const tables = await Tablesave.find(); 
      return res.status(200).json(tables); 
    } catch (error) {
      return res.status(500).json({ message: "Error fetching tables", error: error.message });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
};

export default handler;
