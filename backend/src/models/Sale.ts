import mongoose, { Document, Schema } from 'mongoose';

export interface ISale extends Document {
  saleNumber: string;
  shopId: mongoose.Types.ObjectId;
  customer: {
    name: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  items: Array<{
    tileId: mongoose.Types.ObjectId;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'credit';
  paymentStatus: 'pending' | 'partial' | 'paid';
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  soldBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  deliveredAt?: Date;
}

const SaleSchema: Schema = new Schema(
  {
    saleNumber: {
      type: String,
      required: true,
      uppercase: true,
      trim: true
    },
    shopId: {
      type: Schema.Types.ObjectId,
      ref: 'Shop',
      required: true
    },
    customer: {
      name: {
        type: String,
        required: [true, 'Customer name is required'],
        trim: true
      },
      phone: {
        type: String,
        trim: true
      },
      email: {
        type: String,
        trim: true,
        lowercase: true
      },
      address: {
        type: String,
        trim: true
      }
    },
    items: [{
      tileId: {
        type: Schema.Types.ObjectId,
        ref: 'Tile',
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: 1
      },
      unitPrice: {
        type: Number,
        required: true,
        min: 0
      },
      totalPrice: {
        type: Number,
        required: true,
        min: 0
      }
    }],
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    discount: {
      type: Number,
      default: 0,
      min: 0
    },
    tax: {
      type: Number,
      default: 0,
      min: 0
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'bank_transfer', 'credit'],
      default: 'cash',
      required: true
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'partial', 'paid'],
      default: 'pending',
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'delivered', 'cancelled'],
      default: 'pending',
      required: true
    },
    soldBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    deliveredAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Generate sale number before saving
SaleSchema.pre('save', async function(next) {
  if (!this.saleNumber) {
    const count = await mongoose.model('Sale').countDocuments();
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    this.saleNumber = `SALE-${year}${month}-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Indexes for better query performance
SaleSchema.index({ shopId: 1, createdAt: -1 });
SaleSchema.index({ saleNumber: 1 });
SaleSchema.index({ 'customer.name': 1 });
SaleSchema.index({ status: 1 });
SaleSchema.index({ createdAt: -1 });

export default mongoose.model<ISale>('Sale', SaleSchema);

