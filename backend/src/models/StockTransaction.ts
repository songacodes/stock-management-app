import mongoose, { Document, Schema } from 'mongoose';

export interface IStockTransaction extends Document {
  tileId: mongoose.Types.ObjectId;
  shopId?: mongoose.Types.ObjectId;
  transactionType: 'stock_in' | 'stock_out' | 'adjustment' | 'sale' | 'return';
  quantity: number; // Total pieces
  packets?: number;
  pieces?: number;
  unitPrice?: number;
  totalAmount?: number;
  referenceNumber?: string;
  notes?: string;
  performedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const StockTransactionSchema: Schema = new Schema(
  {
    tileId: {
      type: Schema.Types.ObjectId,
      ref: 'Tile',
      required: true
    },
    shopId: {
      type: Schema.Types.ObjectId,
      ref: 'Shop',
      required: false
    },
    transactionType: {
      type: String,
      enum: ['stock_in', 'stock_out', 'adjustment', 'sale', 'return'],
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    packets: {
      type: Number,
      default: 0
    },
    pieces: {
      type: Number,
      default: 0
    },
    unitPrice: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      default: 0
    },
    referenceNumber: {
      type: String,
      trim: true
    },
    notes: {
      type: String,
      trim: true
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes for better query performance
StockTransactionSchema.index({ tileId: 1, createdAt: -1 });
StockTransactionSchema.index({ transactionType: 1 });
StockTransactionSchema.index({ createdAt: -1 });

export default mongoose.model<IStockTransaction>('StockTransaction', StockTransactionSchema);

