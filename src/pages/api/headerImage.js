import HeaderImage from '../../../public/models/headerImageModel'; // Adjust the import as necessary
import dbConnect from '../../app/lib/dbconnect'; // Adjust the path if necessary
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), 'public/uploads/header');
    // Ensure the upload directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// File filter for allowed file types
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif/; // Allowed file types
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Error: File upload only supports the following filetypes - ' + filetypes));
  }
};

const upload = multer({ storage, fileFilter });

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'POST') {
    upload.single('image')(req, res, async (err) => {
      if (err) {
        return res.status(500).json({ message: 'Error uploading image', error: err.message });
      }

      const { title, description, url } = req.body;

      if (!title || !description || !url || !req.file) {
        return res.status(400).json({ message: 'All fields and an image are required' });
      }

      try {
        const newHeaderImage = new HeaderImage({
          title,
          description,
          url,
          imagePath: `/uploads/header/${req.file.filename}`,
        });

        await newHeaderImage.save();
        res.status(201).json({ message: 'Header Image added successfully', headerImage: newHeaderImage });
      } catch (saveError) {
        // Cleanup the uploaded file if saving fails
        fs.unlink(req.file.path, () => {});
        res.status(500).json({ message: 'Error saving image information', error: saveError.message });
      }
    });
  } else if (req.method === 'GET') {
    try {
      const headerImages = await HeaderImage.find();
      res.status(200).json(headerImages);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else if (req.method === 'PUT') {
    const { id } = req.query;

    upload.single('image')(req, res, async (err) => {
      if (err) {
        return res.status(500).json({ message: 'Error uploading image', error: err.message });
      }

      try {
        const updatedData = {
          ...(req.body.title && { title: req.body.title }),
          ...(req.body.description && { description: req.body.description }),
          ...(req.body.url && { url: req.body.url }),
        };

        if (req.file) {
          // If a new file is uploaded, update the image path
          updatedData.imagePath = `/uploads/header/${req.file.filename}`;
        }

        const updatedHeaderImage = await HeaderImage.findByIdAndUpdate(id, updatedData, { new: true });

        if (!updatedHeaderImage) {
          return res.status(404).json({ message: 'Header Image not found' });
        }

        res.status(200).json({ message: 'Header Image updated successfully', headerImage: updatedHeaderImage });
      } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
      }
    });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

export const config = {
  api: {
    bodyParser: false, // Disables the default body parser to allow multer to handle file uploads
  },
};
