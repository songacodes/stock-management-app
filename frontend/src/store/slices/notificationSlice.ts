import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface Notification {
  _id: string;
  type: 'low_stock' | 'stock_added' | 'tile_created' | 'system';
  title: string;
  message: string;
  tileId?: string;
  tileName?: string;
  read: boolean;
  createdAt: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

// Generate notifications based on tiles data
export const generateNotifications = createAsyncThunk(
  'notifications/generate',
  async (tiles: any[], { getState, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const lowStockThreshold = state.shop.currentShop?.settings?.lowStockThreshold || 50;
      const notifications: Notification[] = [];
      const now = new Date();

      // Check for low stock items
      tiles.forEach((tile: any) => {
        if ((tile.quantity || 0) <= 0) {
          notifications.push({
            _id: `low-stock-${tile._id}`,
            type: 'low_stock',
            title: 'Out of Stock',
            message: `${tile.name || tile.sku} is out of stock`,
            tileId: tile._id,
            tileName: tile.name,
            read: false,
            createdAt: now.toISOString(),
          });
        } else if ((tile.quantity || 0) < lowStockThreshold) {
          notifications.push({
            _id: `low-stock-${tile._id}`,
            type: 'low_stock',
            title: 'Low Stock Alert',
            message: `${tile.name || tile.sku} is running low (${tile.quantity} remaining)`,
            tileId: tile._id,
            tileName: tile.name,
            read: false,
            createdAt: now.toISOString(),
          });
        }
      });

      return notifications;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to generate notifications');
    }
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.read) {
        state.unreadCount += 1;
      }
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find((n) => n._id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach((notification) => {
        notification.read = true;
      });
      state.unreadCount = 0;
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      const index = state.notifications.findIndex((n) => n._id === action.payload);
      if (index !== -1) {
        if (!state.notifications[index].read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications.splice(index, 1);
      }
    },
    clearAll: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(generateNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter((n) => !n.read).length;
      })
      .addCase(generateNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { addNotification, markAsRead, markAllAsRead, removeNotification, clearAll } =
  notificationSlice.actions;
export default notificationSlice.reducer;

