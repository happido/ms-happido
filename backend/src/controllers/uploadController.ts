import { Request, Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';

// Configuration will be applied at runtime to ensure dotenv has loaded


export const uploadImage = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }

    // Cloudinary expects credentials to be set
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      res.status(500).json({ success: false, message: 'Cloudinary configuration is missing in the .env file' });
      return;
    }

    // Apply config dynamically here so that process.env is definitely populated
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // Upload buffer directly to Cloudinary using upload_stream
    const uploadToCloudinary = () => {
      return new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'happido_assets' },
          (error, result) => {
            if (result) {
              resolve(result);
            } else {
              reject(error);
            }
          }
        );
        stream.end(req.file!.buffer);
      });
    };

    const result = await uploadToCloudinary();

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      url: result.secure_url,
    });
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    res.status(500).json({ success: false, message: 'Failed to upload image to Cloudinary' });
  }
};
