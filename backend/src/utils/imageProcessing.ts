import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary (re-use the same config as upload middleware)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadDir = path.join(__dirname, '../../uploads');

export interface ProcessedImage {
  original: string;
  thumbnail?: string;
  medium?: string;
}

/**
 * Process and optimize uploaded image
 */
export const processImage = async (
  filePath: string,
  filename: string
): Promise<ProcessedImage> => {
  const baseName = path.parse(filename).name;
  const ext = path.parse(filename).ext;
  const dir = path.dirname(filePath);

  // If filePath is a URL (Cloudinary), return as is
  if (filePath.startsWith('http')) {
    return {
      original: filePath,
      thumbnail: filePath, // Cloudinary handles resizing via URL, but for simplicity returning same URL
      medium: filePath
    };
  }

  const result: ProcessedImage = {
    original: `/uploads/${filename}`
  };

  try {
    // Generate thumbnail (200x200)
    const thumbnailPath = path.join(dir, `${baseName}-thumb${ext}`);
    await sharp(filePath)
      .resize(200, 200, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 80 })
      .toFile(thumbnailPath);

    result.thumbnail = `/uploads/${path.basename(thumbnailPath)}`;

    // Generate medium size (800x800)
    const mediumPath = path.join(dir, `${baseName}-medium${ext}`);
    await sharp(filePath)
      .resize(800, 800, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 85 })
      .toFile(mediumPath);

    result.medium = `/uploads/${path.basename(mediumPath)}`;

    return result;
  } catch (error) {
    console.error('Image processing error:', error);
    // Return original if processing fails
    return result;
  }
};

/**
 * Delete image and its variants
 */
export const deleteImage = async (imageUrl: string): Promise<void> => {
  try {
    // Handle Cloudinary URLs
    if (imageUrl.includes('cloudinary.com')) {
      // Extract public_id from URL
      // Example URL: https://res.cloudinary.com/cloud_name/image/upload/v1234567/folder/public_id.jpg
      const parts = imageUrl.split('/');
      const lastPart = parts[parts.length - 1];
      const folderPart = parts[parts.length - 2];

      // If it's in a folder (like 'tile-management'), we need folder/public_id
      const publicIdWithFolder = `${folderPart}/${path.parse(lastPart).name}`;

      console.log('Deleting from Cloudinary:', publicIdWithFolder);
      await cloudinary.uploader.destroy(publicIdWithFolder);
      return;
    }

    const filename = path.basename(imageUrl);
    const baseName = path.parse(filename).name;
    const ext = path.parse(filename).ext;
    const dir = uploadDir;

    // Delete original
    const originalPath = path.join(dir, filename);
    if (fs.existsSync(originalPath)) {
      fs.unlinkSync(originalPath);
    }

    // Delete thumbnail
    const thumbPath = path.join(dir, `${baseName}-thumb${ext}`);
    if (fs.existsSync(thumbPath)) {
      fs.unlinkSync(thumbPath);
    }

    // Delete medium
    const mediumPath = path.join(dir, `${baseName}-medium${ext}`);
    if (fs.existsSync(mediumPath)) {
      fs.unlinkSync(mediumPath);
    }
  } catch (error) {
    console.error('Error deleting image:', error);
  }
};

