import { Server, Socket } from 'socket.io';
import Tile from '../models/Tile';
import Sale from '../models/Sale';
import StockTransaction from '../models/StockTransaction';

interface SyncEvent {
  type: 'tile_created' | 'tile_updated' | 'tile_deleted' |
        'stock_added' | 'stock_adjusted' |
        'sale_created' | 'sale_updated' | 'sale_cancelled';
  shopId: string;
  data: any;
  timestamp: Date;
  userId: string;
}

class SyncService {
  private io: Server;
  private connectedShops: Map<string, Set<string>> = new Map(); // shopId -> Set of socketIds

  constructor(io: Server) {
    this.io = io;
  }

  /**
   * Handle client connection
   */
  handleConnection(socket: Socket, _userId: string, shopId: string | undefined) {
    if (!shopId) {
      // Grand admin - can listen to all shops
      socket.join('grand_admin');
      console.log(`Grand admin connected: ${socket.id}`);
      return;
    }

    // Shop-specific room
    const shopRoom = `shop_${shopId}`;
    socket.join(shopRoom);

    // Track connected shops
    if (!this.connectedShops.has(shopId)) {
      this.connectedShops.set(shopId, new Set());
    }
    this.connectedShops.get(shopId)!.add(socket.id);

    console.log(`Shop ${shopId} connected: ${socket.id}`);

    // Send current sync status
    socket.emit('sync-status', {
      shopId,
      connected: true,
      timestamp: new Date()
    });
  }

  /**
   * Handle client disconnection
   */
  handleDisconnection(socket: Socket, shopId: string | undefined) {
    if (shopId && this.connectedShops.has(shopId)) {
      this.connectedShops.get(shopId)!.delete(socket.id);
      if (this.connectedShops.get(shopId)!.size === 0) {
        this.connectedShops.delete(shopId);
      }
    }
    console.log(`Client disconnected: ${socket.id}`);
  }

  /**
   * Broadcast sync event to relevant shops
   */
  async broadcastSyncEvent(event: SyncEvent) {
    const { type, shopId, data, timestamp, userId } = event;

    // Broadcast to the specific shop
    this.io.to(`shop_${shopId}`).emit('sync-event', {
      type,
      shopId,
      data,
      timestamp,
      userId
    });

    // Also broadcast to grand admin
    this.io.to('grand_admin').emit('sync-event', {
      type,
      shopId,
      data,
      timestamp,
      userId
    });

    console.log(`Sync event broadcasted: ${type} for shop ${shopId}`);
  }

  /**
   * Sync tile changes
   */
  async syncTileChange(
    type: 'created' | 'updated' | 'deleted',
    tile: any,
    userId: string
  ) {
    const event: SyncEvent = {
      type: `tile_${type}` as any,
      shopId: tile.shopId.toString(),
      data: {
        tileId: tile._id.toString(),
        tile: type !== 'deleted' ? tile : null
      },
      timestamp: new Date(),
      userId
    };

    await this.broadcastSyncEvent(event);
  }

  /**
   * Sync stock changes
   */
  async syncStockChange(
    type: 'added' | 'adjusted',
    transaction: any,
    userId: string
  ) {
    const event: SyncEvent = {
      type: `stock_${type}` as any,
      shopId: transaction.shopId.toString(),
      data: {
        transactionId: transaction._id.toString(),
        tileId: transaction.tileId.toString(),
        quantity: transaction.quantity,
        transaction
      },
      timestamp: new Date(),
      userId
    };

    await this.broadcastSyncEvent(event);
  }

  /**
   * Sync sale changes
   */
  async syncSaleChange(
    type: 'created' | 'updated' | 'cancelled',
    sale: any,
    userId: string
  ) {
    const event: SyncEvent = {
      type: `sale_${type}` as any,
      shopId: sale.shopId.toString(),
      data: {
        saleId: sale._id.toString(),
        saleNumber: sale.saleNumber,
        sale: type !== 'cancelled' ? sale : null
      },
      timestamp: new Date(),
      userId
    };

    await this.broadcastSyncEvent(event);
  }

  /**
   * Get sync status for a shop
   */
  getSyncStatus(shopId: string) {
    const connected = this.connectedShops.has(shopId) && 
                      this.connectedShops.get(shopId)!.size > 0;
    
    return {
      shopId,
      connected,
      connectedClients: connected ? this.connectedShops.get(shopId)!.size : 0,
      timestamp: new Date()
    };
  }

  /**
   * Request sync for a shop
   */
  async requestSync(shopId: string, socketId: string) {
    // Get latest data for the shop
    const [tiles, recentSales, recentTransactions] = await Promise.all([
      Tile.find({ shopId, isActive: true }).limit(100).sort({ updatedAt: -1 }),
      Sale.find({ shopId }).limit(50).sort({ createdAt: -1 }),
      StockTransaction.find({ shopId }).limit(50).sort({ createdAt: -1 })
    ]);

    // Send sync data to requesting client
    this.io.to(socketId).emit('sync-data', {
      shopId,
      tiles,
      sales: recentSales,
      transactions: recentTransactions,
      timestamp: new Date()
    });

    console.log(`Sync data sent to ${socketId} for shop ${shopId}`);
  }
}

export default SyncService;

