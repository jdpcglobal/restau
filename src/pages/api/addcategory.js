import dbConnect from '../../app/lib/dbconnect';
import Category from '../../../public/models/category';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure Multer storage and file filter
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), 'public/uploads/categories');
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
  
    cb(null, true);
 
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

        const { name } = req.body;

        if (!name || !req.file) {
          return res.status(400).json({ message: 'All fields and an image are required' });
        }

        // Save the category with the image path
        const newCategory = new Category({
          name,
          imageUrl: `/uploads/categories/${req.file.filename}`, // Store image path
        });

        await newCategory.save();

        res.status(201).json({ message: 'Category added successfully', category: newCategory });
      });
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
