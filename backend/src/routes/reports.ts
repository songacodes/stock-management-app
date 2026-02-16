
import express, { Response } from 'express';
import StockTransaction from '../models/StockTransaction';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

// @route   GET /api/reports
// @desc    Get stock transaction reports
// @access  Private
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate, type, page = '1', limit = '20' } = req.query;

    const query: any = {};

    // Multi-tenancy filtering
    if (req.user?.role !== 'grand_admin') {
      query.shopId = req.user?.shopId;
    }

    // Date Filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate as string);
      }
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    // Type Filter
    if (type && type !== 'all') {
      query.transactionType = type;
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const transactions = await StockTransaction.find(query)
      .populate('tileId', 'name sku images')
      .populate('performedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await StockTransaction.countDocuments(query);

    const stats = await StockTransaction.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$transactionType',
          totalQuantity: { $sum: '$quantity' },
          count: { $sum: 1 }
        }
      }
    ]);

    const statsMap = {
      stock_in: 0,
      stock_out: 0
    };

    stats.forEach(s => {
      if (s._id === 'stock_in') statsMap.stock_in = s.totalQuantity;
      if (s._id === 'stock_out') statsMap.stock_out = s.totalQuantity;
    });

    return res.json({
      success: true,
      count: transactions.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      stats: statsMap,
      data: transactions
    });
  } catch (error: any) {
    console.error('Get reports error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching reports',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   DELETE /api/reports/:id
// @desc    Delete a stock transaction
// @access  Private
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const query: any = { _id: req.params.id };

    // Security: Users can only delete from their own shop
    if (req.user?.role !== 'grand_admin') {
      query.shopId = req.user?.shopId;
    }

    const transaction = await StockTransaction.findOneAndDelete(query);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found or unauthorized'
      });
    }

    return res.json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete transaction error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting transaction',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/reports/clear-filtered
// @desc    Clear reports based on filters
// @access  Private (Shop Admin or Grand Admin)
router.post('/clear-filtered', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    // Only shop_admin and grand_admin can clear reports
    if (req.user?.role !== 'grand_admin' && req.user?.role !== 'shop_admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to clear reports'
      });
    }

    const { startDate, endDate, type } = req.body;
    const query: any = {};

    // Multi-tenancy filtering
    if (req.user?.role !== 'grand_admin') {
      query.shopId = req.user?.shopId;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    if (type && type !== 'all') {
      query.transactionType = type;
    }

    const result = await StockTransaction.deleteMany(query);

    return res.json({
      success: true,
      message: `Successfully cleared ${result.deletedCount} reports`,
      count: result.deletedCount
    });
  } catch (error: any) {
    console.error('Clear reports error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error clearing reports',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
