import express, { Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import Sale from '../models/Sale';
import Tile from '../models/Tile';
import StockTransaction from '../models/StockTransaction';
import { authenticate, AuthRequest } from '../middleware/auth';

// Import sync service (will be injected)
let syncService: any = null;
export const setSyncService = (service: any) => {
  syncService = service;
};

const router = express.Router();

// @route   GET /api/sales
// @desc    Get all sales with filters
// @access  Private
router.get(
  '/',
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const {
        shopId,
        status,
        paymentStatus,
        startDate,
        endDate,
        customerName,
        page = '1',
        limit = '20'
      } = req.query;

      const query: any = {};

      // Filter by shop (unless grand admin)
      if (req.user!.role !== 'grand_admin') {
        query.shopId = req.user!.shopId;
      } else if (shopId) {
        query.shopId = shopId;
      }

      // Filter by status
      if (status) {
        query.status = status;
      }

      // Filter by payment status
      if (paymentStatus) {
        query.paymentStatus = paymentStatus;
      }

      // Filter by customer name
      if (customerName) {
        query['customer.name'] = { $regex: customerName, $options: 'i' };
      }

      // Filter by date range
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) {
          query.createdAt.$gte = new Date(startDate as string);
        }
        if (endDate) {
          query.createdAt.$lte = new Date(endDate as string);
        }
      }

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      const sales = await Sale.find(query)
        .populate('shopId', 'name')
        .populate('soldBy', 'name')
        .populate('items.tileId', 'name sku images')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

      const total = await Sale.countDocuments(query);

      res.json({
        success: true,
        count: sales.length,
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        data: sales
      });
    } catch (error: any) {
      console.error('Get sales error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching sales',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// @route   GET /api/sales/:id
// @desc    Get single sale
// @access  Private
router.get('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const query: any = { _id: req.params.id };

    if (req.user!.role !== 'grand_admin') {
      query.shopId = req.user!.shopId;
    }

    const sale = await Sale.findOne(query)
      .populate('shopId', 'name')
      .populate('soldBy', 'name')
      .populate('items.tileId', 'name sku images price stock');

    if (!sale) {
      res.status(404).json({
        success: false,
        message: 'Sale not found'
      });
      return;
    }

    res.json({
      success: true,
      data: sale
    });
  } catch (error: any) {
    console.error('Get sale error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sale',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/sales
// @desc    Create new sale
// @access  Private
router.post(
  '/',
  authenticate,
  [
    body('customer.name').notEmpty().withMessage('Customer name is required'),
    body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
    body('items.*.tileId').notEmpty().withMessage('Tile ID is required for each item'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('items.*.unitPrice').isFloat({ min: 0 }).withMessage('Unit price must be positive'),
    body('paymentMethod').optional().isIn(['cash', 'card', 'bank_transfer', 'credit']),
    body('paymentStatus').optional().isIn(['pending', 'partial', 'paid'])
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

      const shopId = req.user!.role === 'grand_admin' 
        ? req.body.shopId 
        : req.user!.shopId;

      if (!shopId) {
        res.status(400).json({
          success: false,
          message: 'Shop ID is required'
        });
        return;
      }

      const { customer, items, discount = 0, tax = 0, paymentMethod = 'cash', paymentStatus = 'pending' } = req.body;

      // Validate items and check stock availability
      const validatedItems = [];
      let subtotal = 0;

      for (const item of items) {
        const tile = await Tile.findOne({
          _id: item.tileId,
          shopId: shopId,
          isActive: true
        });

        if (!tile) {
          res.status(404).json({
            success: false,
            message: `Tile with ID ${item.tileId} not found`
          });
          return;
        }

        if (tile.stock.availableQuantity < item.quantity) {
          res.status(400).json({
            success: false,
            message: `Insufficient stock for ${tile.name || tile.sku}. Available: ${tile.stock.availableQuantity}, Requested: ${item.quantity}`
          });
          return;
        }

        const totalPrice = item.quantity * item.unitPrice;
        subtotal += totalPrice;

        validatedItems.push({
          tileId: tile._id,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: totalPrice
        });
      }

      const totalAmount = subtotal - discount + tax;

      // Create sale
      const sale = new Sale({
        shopId,
        customer,
        items: validatedItems,
        subtotal,
        discount,
        tax,
        totalAmount,
        paymentMethod,
        paymentStatus,
        status: 'confirmed',
        soldBy: req.user!._id
      });

      await sale.save();

      // Update stock for each item
      for (const item of validatedItems) {
        const tile = await Tile.findById(item.tileId);
        if (tile) {
          tile.stock.availableQuantity -= item.quantity;
          tile.stock.reservedQuantity += item.quantity;
          await tile.save();

          // Create stock transaction for sale
          const transaction = new StockTransaction({
            tileId: item.tileId,
            shopId: shopId,
            transactionType: 'sale',
            quantity: -item.quantity, // Negative for sale
            unitPrice: item.unitPrice,
            totalAmount: item.totalPrice,
            referenceNumber: sale.saleNumber,
            notes: `Sale: ${sale.saleNumber}`,
            performedBy: req.user!._id
          });

          await transaction.save();
        }
      }

      const populatedSale = await Sale.findById(sale._id)
        .populate('shopId', 'name')
        .populate('soldBy', 'name')
        .populate('items.tileId', 'name sku images');

      // Sync event
      if (syncService) {
        await syncService.syncSaleChange('created', populatedSale, req.user!._id.toString());
      }

      res.status(201).json({
        success: true,
        message: 'Sale created successfully',
        data: populatedSale
      });
    } catch (error: any) {
      console.error('Create sale error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating sale',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// @route   PUT /api/sales/:id
// @desc    Update sale
// @access  Private
router.put('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const query: any = { _id: req.params.id };

    if (req.user!.role !== 'grand_admin') {
      query.shopId = req.user!.shopId;
    }

    // Only allow updating certain fields
    const allowedUpdates = ['paymentStatus', 'status', 'customer', 'discount', 'tax', 'paymentMethod'];
    const updates: any = {};

    for (const field of allowedUpdates) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    // If status is being updated to delivered, set deliveredAt
    if (updates.status === 'delivered') {
      updates.deliveredAt = new Date();
    }

    const sale = await Sale.findOneAndUpdate(
      query,
      updates,
      { new: true, runValidators: true }
    )
      .populate('shopId', 'name')
      .populate('soldBy', 'name')
      .populate('items.tileId', 'name sku images');

    if (!sale) {
      res.status(404).json({
        success: false,
        message: 'Sale not found'
      });
      return;
    }

    // Sync event
    if (syncService) {
      await syncService.syncSaleChange('updated', sale, req.user!._id.toString());
    }

    res.json({
      success: true,
      message: 'Sale updated successfully',
      data: sale
    });
  } catch (error: any) {
    console.error('Update sale error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating sale',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   DELETE /api/sales/:id
// @desc    Cancel sale (restore stock)
// @access  Private
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const query: any = { _id: req.params.id };

    if (req.user!.role !== 'grand_admin') {
      query.shopId = req.user!.shopId;
    }

    const sale = await Sale.findOne(query).populate('items.tileId');

    if (!sale) {
      res.status(404).json({
        success: false,
        message: 'Sale not found'
      });
      return;
    }

    // Only allow cancellation if not already delivered
    if (sale.status === 'delivered') {
      res.status(400).json({
        success: false,
        message: 'Cannot cancel a delivered sale'
      });
      return;
    }

    // Restore stock for each item
    for (const item of sale.items) {
      const tile = await Tile.findById(item.tileId);
      if (tile) {
        tile.stock.availableQuantity += item.quantity;
        tile.stock.reservedQuantity = Math.max(0, tile.stock.reservedQuantity - item.quantity);
        await tile.save();

        // Create stock transaction for cancellation
        const transaction = new StockTransaction({
          tileId: item.tileId,
          shopId: sale.shopId,
          transactionType: 'return',
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalAmount: item.totalPrice,
          referenceNumber: sale.saleNumber,
          notes: `Sale cancelled: ${sale.saleNumber}`,
          performedBy: req.user!._id
        });

        await transaction.save();
      }
    }

    // Update sale status
    sale.status = 'cancelled';
    await sale.save();

    // Sync event
    if (syncService) {
      await syncService.syncSaleChange('cancelled', sale, req.user!._id.toString());
    }

    res.json({
      success: true,
      message: 'Sale cancelled successfully'
    });
  } catch (error: any) {
    console.error('Cancel sale error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling sale',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/sales/:id/deliver
// @desc    Mark sale as delivered
// @access  Private
router.post('/:id/deliver', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const query: any = { _id: req.params.id };

    if (req.user!.role !== 'grand_admin') {
      query.shopId = req.user!.shopId;
    }

    const sale = await Sale.findOneAndUpdate(
      query,
      {
        status: 'delivered',
        deliveredAt: new Date()
      },
      { new: true }
    )
      .populate('shopId', 'name')
      .populate('soldBy', 'name')
      .populate('items.tileId', 'name sku images');

    if (!sale) {
      res.status(404).json({
        success: false,
        message: 'Sale not found'
      });
      return;
    }

    // Update reserved quantity to actual sold quantity
    for (const item of sale.items) {
      const tile = await Tile.findById(item.tileId);
      if (tile) {
        tile.stock.reservedQuantity = Math.max(0, tile.stock.reservedQuantity - item.quantity);
        await tile.save();
      }
    }

    res.json({
      success: true,
      message: 'Sale marked as delivered',
      data: sale
    });
  } catch (error: any) {
    console.error('Deliver sale error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking sale as delivered',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;

