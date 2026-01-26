import express, { Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import Shop from '../models/Shop';
import Tile from '../models/Tile';
import Sale from '../models/Sale';
import StockTransaction from '../models/StockTransaction';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();

// @route   GET /api/shops
// @desc    Get all shops (grand admin) or own shop
// @access  Private
router.get(
  '/',
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      // Grand admin can see all shops, others see only their shop
      if (req.user!.role === 'grand_admin') {
        const shops = await Shop.find({ isActive: true }).sort({ name: 1 });
        res.json({
          success: true,
          count: shops.length,
          data: shops
        });
      } else {
        const shop = await Shop.findById(req.user!.shopId);
        if (!shop) {
          res.status(404).json({
            success: false,
            message: 'Shop not found'
          });
          return;
        }
        res.json({
          success: true,
          data: [shop]
        });
      }
    } catch (error: any) {
      console.error('Get shops error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching shops',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// @route   GET /api/shops/:id
// @desc    Get single shop
// @access  Private
router.get('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const query: any = { _id: req.params.id, isActive: true };

    // Non-grand admins can only see their own shop
    if (req.user!.role !== 'grand_admin') {
      query._id = req.user!.shopId;
    }

    const shop = await Shop.findOne(query);

    if (!shop) {
      res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
      return;
    }

    res.json({
      success: true,
      data: shop
    });
  } catch (error: any) {
    console.error('Get shop error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching shop',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/shops
// @desc    Create new shop (grand admin only)
// @access  Private (grand_admin)
router.post(
  '/',
  authenticate,
  authorize('grand_admin'),
  [
    body('name').notEmpty().trim().withMessage('Shop name is required'),
    body('address.city').optional().trim(),
    body('address.country').optional().trim(),
    body('contact.phone').optional().trim(),
    body('contact.email').optional().isEmail().normalizeEmail()
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

      const shop = new Shop(req.body);
      await shop.save();

      res.status(201).json({
        success: true,
        message: 'Shop created successfully',
        data: shop
      });
    } catch (error: any) {
      console.error('Create shop error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating shop',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// @route   PUT /api/shops/:id
// @desc    Update shop (grand admin only)
// @access  Private (grand_admin)
router.put(
  '/:id',
  authenticate,
  authorize('grand_admin'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const shop = await Shop.findByIdAndUpdate(
        req.params.id,
        { ...req.body, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (!shop) {
        res.status(404).json({
          success: false,
          message: 'Shop not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Shop updated successfully',
        data: shop
      });
    } catch (error: any) {
      console.error('Update shop error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating shop',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// @route   DELETE /api/shops/:id
// @desc    Delete shop (soft delete, grand admin only)
// @access  Private (grand_admin)
router.delete(
  '/:id',
  authenticate,
  authorize('grand_admin'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const shop = await Shop.findById(req.params.id);

      if (!shop) {
        res.status(404).json({
          success: false,
          message: 'Shop not found'
        });
        return;
      }

      // Check if shop has active users or tiles
      const userCount = await require('../models/User').default.countDocuments({
        shopId: shop._id,
        isActive: true
      });

      const tileCount = await Tile.countDocuments({
        shopId: shop._id,
        isActive: true
      });

      if (userCount > 0 || tileCount > 0) {
        res.status(400).json({
          success: false,
          message: `Cannot delete shop. It has ${userCount} active users and ${tileCount} active tiles. Please deactivate or transfer them first.`
        });
        return;
      }

      shop.isActive = false;
      await shop.save();

      res.json({
        success: true,
        message: 'Shop deleted successfully'
      });
    } catch (error: any) {
      console.error('Delete shop error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting shop',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// @route   GET /api/shops/:id/statistics
// @desc    Get shop statistics
// @access  Private
router.get(
  '/:id/statistics',
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const shopId = req.params.id;

      // Check access
      if (req.user!.role !== 'grand_admin' && req.user!.shopId?.toString() !== shopId) {
        res.status(403).json({
          success: false,
          message: 'Access denied'
        });
        return;
      }

      // Get statistics
      const mongoose = require('mongoose');
      const shopObjectId = new mongoose.Types.ObjectId(shopId);
      
      const [
        totalTiles,
        totalStock,
        totalSales,
        totalRevenue,
        lowStockCount,
        recentSales
      ] = await Promise.all([
        Tile.countDocuments({ shopId: shopObjectId, isActive: true }),
        Tile.aggregate([
          { $match: { shopId: shopObjectId, isActive: true } },
          { $group: { _id: null, total: { $sum: '$stock.availableQuantity' } } }
        ]),
        Sale.countDocuments({
          shopId: shopObjectId,
          status: { $ne: 'cancelled' }
        }),
        Sale.aggregate([
          {
            $match: {
              shopId: shopObjectId,
              status: { $ne: 'cancelled' }
            }
          },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]),
        Tile.countDocuments({
          shopId: shopObjectId,
          isActive: true,
          $expr: {
            $lte: ['$stock.availableQuantity', '$stock.minimumThreshold']
          }
        }),
        Sale.find({ shopId: shopObjectId })
          .sort({ createdAt: -1 })
          .limit(5)
          .populate('soldBy', 'name')
          .select('saleNumber totalAmount createdAt customer.name')
      ]);

      res.json({
        success: true,
        data: {
          totalTiles,
          totalStock: totalStock[0]?.total || 0,
          totalSales,
          totalRevenue: totalRevenue[0]?.total || 0,
          lowStockCount,
          recentSales
        }
      });
    } catch (error: any) {
      console.error('Get shop statistics error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching shop statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// @route   GET /api/shops/overview
// @desc    Get overview of all shops (grand admin only)
// @access  Private (grand_admin)
router.get(
  '/overview',
  authenticate,
  authorize('grand_admin'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const shops = await Shop.find({ isActive: true });

      const overview = await Promise.all(
        shops.map(async (shop) => {
          const [tiles, sales, revenue] = await Promise.all([
            Tile.countDocuments({ shopId: shop._id, isActive: true }),
            Sale.countDocuments({
              shopId: shop._id,
              status: { $ne: 'cancelled' }
            }),
            Sale.aggregate([
              {
                $match: {
                  shopId: shop._id,
                  status: { $ne: 'cancelled' }
                }
              },
              { $group: { _id: null, total: { $sum: '$totalAmount' } } }
            ])
          ]);

          return {
            shop: {
              _id: shop._id,
              name: shop.name,
              address: shop.address
            },
            statistics: {
              tiles,
              sales,
              revenue: revenue[0]?.total || 0
            }
          };
        })
      );

      res.json({
        success: true,
        data: overview
      });
    } catch (error: any) {
      console.error('Get shops overview error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching shops overview',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

export default router;

