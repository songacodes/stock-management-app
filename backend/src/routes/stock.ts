import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import Tile from '../models/Tile';
import StockTransaction from '../models/StockTransaction';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

// @route   GET /api/stock
// @desc    Get stock information for all tiles
// @access  Private
router.get(
  '/',
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { search, page = '1', limit = '20' } = req.query;

      const query: any = {};

      // Search
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
        .select('name sku price quantity images')
        .sort({ quantity: 1 })
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
      console.error('Get stock error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching stock',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// @route   POST /api/stock/add
// @desc    Add stock to a tile
// @access  Private
router.post(
  '/add',
  authenticate,
  [
    body('tileId').notEmpty().withMessage('Tile ID is required'),
    body('packets').optional().isInt({ min: 0 }).withMessage('Packets must be a non-negative integer'),
    body('pieces').optional().isInt({ min: 0 }).withMessage('Pieces must be a non-negative integer'),
    body('newItemsPerPacket').optional().isInt({ min: 1 }).withMessage('New items per packet must be at least 1')
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

      const { tileId, packets = 0, pieces = 0, newItemsPerPacket } = req.body;

      // Validate that at least one value is provided
      if (packets === 0 && pieces === 0) {
        res.status(400).json({
          success: false,
          message: 'At least packets or pieces must be greater than 0'
        });
        return;
      }

      const tile = await Tile.findById(tileId);
      if (!tile) {
        res.status(404).json({
          success: false,
          message: 'Tile not found'
        });
        return;
      }

      // Update itemsPerPacket if provided
      if (newItemsPerPacket) {
        tile.itemsPerPacket = newItemsPerPacket;
      }

      // Calculate total quantity: (packets * itemsPerPacket) + pieces
      const itemsPerPacket = newItemsPerPacket || tile.itemsPerPacket || 1;
      const totalQuantity = (packets * itemsPerPacket) + pieces;

      tile.quantity += totalQuantity;
      await tile.save();

      // Create transaction record
      await StockTransaction.create({
        tileId: tile._id,
        transactionType: 'stock_in',
        quantity: totalQuantity,
        packets,
        pieces,
        performedBy: req.user?._id,
        notes: newItemsPerPacket ? `Updated config to ${newItemsPerPacket} pcs/pkt` : undefined
      });

      // Emit real-time update
      const io = req.app.get('io');
      io.emit('stock_updated', { tileId: tile._id, quantity: tile.quantity });

      res.json({
        success: true,
        message: `Stock added successfully: ${packets} packet(s) + ${pieces} piece(s) = ${totalQuantity} total pieces`,
        data: tile
      });
    } catch (error: any) {
      console.error('Add stock error:', error);
      res.status(500).json({
        success: false,
        message: 'Error adding stock',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// @route   POST /api/stock/remove
// @desc    Remove stock from a tile
// @access  Private
router.post(
  '/remove',
  authenticate,
  [
    body('tileId').notEmpty().withMessage('Tile ID is required'),
    body('packets').optional().isInt({ min: 0 }).withMessage('Packets must be a non-negative integer'),
    body('pieces').optional().isInt({ min: 0 }).withMessage('Pieces must be a non-negative integer')
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

      const { tileId, packets = 0, pieces = 0 } = req.body;

      // Validate that at least one value is provided
      if (packets === 0 && pieces === 0) {
        res.status(400).json({
          success: false,
          message: 'At least packets or pieces must be greater than 0'
        });
        return;
      }

      const tile = await Tile.findById(tileId);
      if (!tile) {
        res.status(404).json({
          success: false,
          message: 'Tile not found'
        });
        return;
      }

      // Calculate total quantity to remove: (packets * itemsPerPacket) + pieces
      const itemsPerPacket = tile.itemsPerPacket || 1;
      const totalQuantity = (packets * itemsPerPacket) + pieces;

      if (tile.quantity < totalQuantity) {
        res.status(400).json({
          success: false,
          message: `Insufficient stock. Available: ${tile.quantity} pieces, Requested: ${totalQuantity} pieces`
        });
        return;
      }

      tile.quantity -= totalQuantity;
      await tile.save();

      // Create transaction record
      await StockTransaction.create({
        tileId: tile._id,
        transactionType: 'stock_out',
        quantity: totalQuantity,
        packets,
        pieces,
        performedBy: req.user?._id
      });

      // Emit real-time update
      const io = req.app.get('io');
      io.emit('stock_updated', { tileId: tile._id, quantity: tile.quantity });

      res.json({
        success: true,
        message: `Stock removed successfully: ${packets} packet(s) + ${pieces} piece(s) = ${totalQuantity} total pieces`,
        data: tile
      });
    } catch (error: any) {
      console.error('Remove stock error:', error);
      res.status(500).json({
        success: false,
        message: 'Error removing stock',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// @route   PUT /api/stock/:id
// @desc    Update stock quantity directly
// @access  Private
router.put('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { quantity } = req.body;

    if (quantity === undefined || quantity < 0) {
      res.status(400).json({
        success: false,
        message: 'Valid quantity is required'
      });
      return;
    }

    const tile = await Tile.findByIdAndUpdate(
      req.params.id,
      { quantity },
      { new: true, runValidators: true }
    );

    if (!tile) {
      res.status(404).json({
        success: false,
        message: 'Tile not found'
      });
      return;
    }

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('stock_updated', { tileId: tile._id, quantity: tile.quantity });

    res.json({
      success: true,
      message: 'Stock updated successfully',
      data: tile
    });
  } catch (error: any) {
    console.error('Update stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating stock',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
