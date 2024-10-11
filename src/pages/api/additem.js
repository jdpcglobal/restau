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

const fileFilter = (req, file, cb) => {
  // Optionally add file type filtering if needed
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed.'), false);
  }
};

const upload = multer({ storage, fileFilter });

export const config = {
  api: {
    bodyParser: false, // Disables the default body parser
  },
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      await dbConnect();

      // Use multer to parse form data
      upload.single('image')(req, res, async (err) => {
        if (err) {
          return res.status(500).json({ message: 'Error uploading image', error: err.message });
        }

        const { name, description, price, discount, category, gstRate, vegOrNonVeg } = req.body;

        // Validate that all required fields are provided
        if (!name || !description || !price || !discount || !category || !gstRate || !vegOrNonVeg) {
          return res.status(400).json({ message: 'All fields are required' });
        }

        // // Validate that the type is either "veg" or "non-veg"
        // if (vegOrNonVeg !== 'veg' && vegOrNonVeg !== 'non-veg') {
        //   return res.status(400).json({ message: 'Invalid vegOrNonVeg. Must be "veg" or "non-veg".' });
        // }

        // Create new item with the image path and other details
        const newItem = new Item({
          name,
          description,
          price,
          discount,
          category,
          gstRate,
          vegOrNonVeg,
          imageUrl: req.file ? `/uploads/${req.file.filename}` : undefined, // Store image path if provided
        });

        await newItem.save();

        res.status(201).json({ message: 'Item added successfully', item: newItem });
      });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
