import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import Tile from '../models/Tile';
import { authenticate, AuthRequest } from '../middleware/auth';
import { uploadMultiple, uploadSingle } from '../middleware/upload';
import { processImage, deleteImage } from '../utils/imageProcessing';

const router = express.Router();

// @route   GET /api/tiles
// @desc    Get all tiles
// @access  Private
router.get(
  '/',
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { search, page = '1', limit = '20' } = req.query;

      const query: any = { isDeleted: false }; // Only fetch active tiles


      // Search by name or SKU
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { sku: { $regex: search, $options: 'i' } }
        ];
      }

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      const tiles = await Tile.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

      const total = await Tile.countDocuments(query);

      res.json({
        success: true,
        count: tiles.length,
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        data: tiles
      });
    } catch (error: any) {
      console.error('Get tiles error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching tiles',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// @route   POST /api/tiles/upload-image
// @desc    Upload image for tile
// @access  Private
router.post(
  '/upload-image',
  authenticate,
  uploadSingle,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No image file provided'
        });
        return;
      }

      const processed = await processImage(req.file.path, req.file.filename);

      res.json({
        success: true,
        message: 'Image uploaded successfully',
        data: {
          original: processed.original,
          thumbnail: processed.thumbnail,
          medium: processed.medium
        }
      });
    } catch (error: any) {
      console.error('Upload image error:', error);
      res.status(500).json({
        success: false,
        message: 'Error uploading image',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// @route   GET /api/tiles/:id
// @desc    Get single tile
// @access  Private
router.get('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tile = await Tile.findById(req.params.id);

    if (!tile) {
      res.status(404).json({
        success: false,
        message: 'Tile not found'
      });
      return;
    }

    res.json({
      success: true,
      data: tile
    });
  } catch (error: any) {
    console.error('Get tile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/tiles
// @desc    Create new tile
// @access  Private
router.post(
  '/',
  authenticate,
  // Only use multer if it's a multipart request, otherwise skip it
  (req: any, res: any, next: any) => {
    if (req.headers['content-type']?.includes('multipart/form-data')) {
      uploadMultiple(req, res, next);
    } else {
      next();
    }
  },
  [
    body('name').notEmpty().trim(),
    body('price').isFloat({ min: 0 }),
    body('quantity').isInt({ min: 0 }),
    body('itemsPerPacket').optional().isInt({ min: 1 })
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          errors: errors.array()
        });
        return;
      }

      // Process uploaded images from Cloudinary
      const images: any[] = [];
      const files = req.files as { [fieldname: string]: any[] };

      // Handle file uploads (multer-storage-cloudinary puts the URL in 'path')
      if (files && files['images']) {
        for (const file of files['images']) {
          images.push({
            url: file.path, // This is the Cloudinary URL
            uploadedAt: new Date()
          });
        }
      }

      // Handle custom images if provided in body (fallback)
      if (images.length === 0 && req.body.images && Array.isArray(req.body.images)) {
        images.push(...req.body.images.map((img: any) => ({
          url: img.url || img,
          uploadedAt: new Date()
        })));
      }

      const tileData = {
        name: req.body.name,
        price: parseFloat(req.body.price),
        quantity: Math.floor(parseFloat(req.body.quantity)) || 0,
        itemsPerPacket: parseInt(req.body.itemsPerPacket) || 1,
        images,
        shopId: req.user?.shopId // Associate with user's shop
      };

      const tile = new Tile(tileData);
      await tile.save();

      res.status(201).json({
        success: true,
        message: 'Tile created successfully',
        data: tile
      });
    } catch (error: any) {
      console.error('Create tile error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating tile',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// @route   PUT /api/tiles/:id
// @desc    Update tile
// @access  Private
router.put('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };

    // Explicitly handle itemsPerPacket if present
    if (req.body.itemsPerPacket) {
      updateData.itemsPerPacket = parseInt(req.body.itemsPerPacket);
    }

    const tile = await Tile.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!tile) {
      res.status(404).json({
        success: false,
        message: 'Tile not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Tile updated successfully',
      data: tile
    });
  } catch (error: any) {
    console.error('Update tile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating tile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   DELETE /api/tiles/:id
// @desc    Delete tile
// @access  Private
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tile = await Tile.findById(req.params.id);

    if (!tile) {
      res.status(404).json({
        success: false,
        message: 'Tile not found'
      });
      return;
    }

    // Delete associated images
    if (tile.images && tile.images.length > 0) {
      for (const image of tile.images) {
        await deleteImage(image.url);
      }
    }

    // Hard delete logic
    await Tile.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Tile deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete tile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting tile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
