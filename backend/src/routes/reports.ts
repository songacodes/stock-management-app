
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

    // Date Filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate as string);
      }
      if (endDate) {
        // Set end date to end of day
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
      .populate('performedBy', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await StockTransaction.countDocuments(query);

    // Calculate simple stats for the filtered period
    // Note: This aggregation might be heavy for large datasets, consider optimizing later
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

    res.json({
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
    res.status(500).json({
      success: false,
      message: 'Error fetching reports',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
