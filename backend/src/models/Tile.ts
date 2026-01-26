import mongoose, { Document, Schema } from 'mongoose';

export interface ITile extends Document {
  name: string;
  sku: string;
  price: number; // Single price in RWF
  quantity: number; // Stock quantity
  itemsPerPacket: number; // Number of items per packet
  images: Array<{
    url: string;
    uploadedAt: Date;
  }>;
  shopId?: mongoose.Types.ObjectId;
  stock: {
    availableQuantity: number;
    reservedQuantity: number;
    minimumThreshold: number;
  };
  isDeleted: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TileSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    sku: {
      type: String,
      required: false, // Auto-generated in pre-save hook
      uppercase: true,
      trim: true,
      unique: true
    },
    price: {
      type: Number,
      required: false,
      default: 0,
      min: 0
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      default: 0,
      min: 0
    },
    itemsPerPacket: {
      type: Number,
      required: [true, 'Items per packet is required'],
      default: 1,
      min: 1
    },
    images: [{
      url: { type: String, required: true },
      uploadedAt: { type: Date, default: Date.now }
    }],
    shopId: {
      type: Schema.Types.ObjectId,
      ref: 'Shop',
      required: false
    },
    stock: {
      availableQuantity: { type: Number, default: 0 },
      reservedQuantity: { type: Number, default: 0 },
      minimumThreshold: { type: Number, default: 5 }
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);


// Generate SKU before saving if not provided
TileSchema.pre('save', async function (next) {
  if (!this.isNew || !this.sku) {
    // Only generate for new documents or if SKU is missing
    if (!this.sku) {
      try {
        const count = await mongoose.model('Tile').countDocuments();
        this.sku = `TILE-${String(count + 1).padStart(6, '0')}`;
      } catch (error) {
        // Fallback if count fails
        this.sku = `TILE-${Date.now()}`;
      }
    }
  }
  next();
});

// Indexes for better query performance
// Note: sku already has an index from unique: true
TileSchema.index({ quantity: 1 });

export default mongoose.model<ITile>('Tile', TileSchema);

