import dbConnect from '../../app/lib/dbconnect';
import Item from '../../../public/models/item';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure Multer storage and file filter
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// File filter to accept only PNG images
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new Error('Only PNG files are allowed'), false);
  }
};

const upload = multer({ storage, fileFilter });

export default async function handler(req, res) {
  if (req.method === 'PUT') {
    try {
      await dbConnect(); // Connect to the database

      // Use multer to parse form data
      upload.single('image')(req, res, async (err) => {
        if (err) {
          return res.status(500).json({ message: 'Error uploading image', error: err.message });
        }

        // Destructure the request body to get item details
        const { id, name, description, price, category, discount, gstRate, vegOrNonVeg } = req.body;

        if (!id) {
          return res.status(400).json({ message: 'Item ID is required' });
        }

        // Find the item by ID
        const item = await Item.findById(id);
        if (!item) {
          return res.status(404).json({ message: 'Item not found' });
        }

        // Update item fields if they are provided
        item.name = name || item.name;
        item.description = description || item.description;
        item.price = price || item.price;
        item.category = category || item.category;
        item.discount = discount || item.discount;
        item.gstRate = gstRate || item.gstRate;
        item.vegOrNonVeg = vegOrNonVeg || item.vegOrNonVeg; // Update Veg or Non-Veg
        if (req.file) item.imageUrl = `/uploads/${req.file.filename}`; // Update image URL if new image is provided

        // Save the updated item
        await item.save();

        res.status(200).json({ message: 'Item updated successfully', item });
      });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

// Disable the default body parser for this route
export const config = {
  api: {
    bodyParser: false,
  },
};
