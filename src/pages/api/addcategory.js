import dbConnect from '../../app/lib/dbconnect';
import Category from '../../../public/models/category';
import multer from 'multer';
import AWS from 'aws-sdk';
import path from 'path';
import fs from 'fs';

// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID, 
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION, // e.g., 'us-east-1'
});

const s3 = new AWS.S3();

// Configure Multer storage for AWS S3
const storage = multer.memoryStorage(); // Store the file in memory before uploading to S3

const fileFilter = (req, file, cb) => {
  // You can add filters here if needed (e.g., check file type)
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

        // Upload the image to S3
        const params = {
          Bucket: process.env.AWS_BUCKET_NAME, // Your S3 Bucket name
          Key: `categories/${Date.now()}-${req.file.originalname}`, // The file's key in the S3 bucket
          Body: req.file.buffer, // The file data
          ContentType: req.file.mimetype, // MIME type of the file
          ACL: 'public-read', // Optional: Set the ACL for the file to be publicly readable
        };

        try {
          // Upload the file to S3
          const uploadResult = await s3.upload(params).promise();

          // Save the category with the image URL returned by S3
          const newCategory = new Category({
            name,
            imageUrl: uploadResult.Location, // S3 URL of the uploaded image
          });

          await newCategory.save();

          res.status(201).json({ message: 'Category added successfully', category: newCategory });
        } catch (uploadError) {
          return res.status(500).json({ message: 'Error uploading to S3', error: uploadError.message });
        }
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
