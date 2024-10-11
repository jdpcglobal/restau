import dbConnect from '../../app/lib/dbconnect';
import Payment from '../../../public/models/Payment'; // Adjust the path if necessary
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure Multer storage and file filter
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), 'public/uploads/payments');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  cb(null, true); // Accept all file types
};

const upload = multer({ storage, fileFilter });

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      await dbConnect();

      // Use multer to parse form data
      upload.single('image')(req, res, async (err) => {
        if (err) {
          return res.status(500).json({ message: 'Error uploading image', error: err.message });
        }

        const { name, title } = req.body; // Extract title from request body

        if (!name || !title || !req.file) {
          return res.status(400).json({ message: 'All fields and an image are required' });
        }

        // Save the Payment with the image path and title
        const newPayment = new Payment({
          name,
          title, // Include title
          imageUrl: `/uploads/payments/${req.file.filename}`, // Store image path
        });

        await newPayment.save();

        res.status(201).json({ message: 'Payment added successfully', Payment: newPayment });
      });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error });
    }
  } else if (req.method === 'GET') {
    try {
      await dbConnect();
      const payments = await Payment.find();
      res.status(200).json(payments);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error });
    }
  } else if (req.method === 'PUT') {
    try {
      await dbConnect();
      const { id } = req.query;
      const { status } = req.body;
      const updatedPayment = await Payment.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );
      if (!updatedPayment) {
        return res.status(404).json({ message: 'Payment not found' });
      }
      res.status(200).json(updatedPayment);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

export const config = {
  api: {
    bodyParser: false, // Disables the default body parser
  },
};
