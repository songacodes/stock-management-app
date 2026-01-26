import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

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

