import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

interface Shop {
  _id: string;
  name: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  contact?: {
    phone?: string;
    email?: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ShopStatistics {
  totalTiles: number;
  totalStock: number;
  totalSales: number;
  totalRevenue: number;
  lowStockCount: number;
  recentSales: any[];
}

interface ShopState {
  shops: Shop[];
  currentShop: Shop | null;
  shopStatistics: ShopStatistics | null;
  shopsOverview: any[];
  loading: boolean;
  error: string | null;
}

const initialState: ShopState = {
  shops: [],
  currentShop: null,
  shopStatistics: null,
  shopsOverview: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchShops = createAsyncThunk(
  'shops/fetchShops',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/shops`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch shops');
    }
  }
);

export const fetchShopById = createAsyncThunk(
  'shops/fetchShopById',
  async (id: string, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/shops/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch shop');
    }
  }
);

export const createShop = createAsyncThunk(
  'shops/createShop',
  async (shopData: any, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/shops`, shopData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create shop');
    }
  }
);

export const updateShop = createAsyncThunk(
  'shops/updateShop',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/shops/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update shop');
    }
  }
);

export const deleteShop = createAsyncThunk(
  'shops/deleteShop',
  async (id: string, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/shops/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete shop');
    }
  }
);

export const fetchShopStatistics = createAsyncThunk(
  'shops/fetchShopStatistics',
  async (id: string, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/shops/${id}/statistics`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch shop statistics');
    }
  }
);

export const fetchShopsOverview = createAsyncThunk(
  'shops/fetchShopsOverview',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/shops/overview`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch shops overview');
    }
  }
);

const shopSlice = createSlice({
  name: 'shops',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentShop: (state) => {
      state.currentShop = null;
      state.shopStatistics = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch shops
      .addCase(fetchShops.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchShops.fulfilled, (state, action: PayloadAction<Shop[]>) => {
        state.loading = false;
        state.shops = action.payload;
      })
      .addCase(fetchShops.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch shop by ID
      .addCase(fetchShopById.fulfilled, (state, action: PayloadAction<Shop>) => {
        state.currentShop = action.payload;
      })
      // Create shop
      .addCase(createShop.fulfilled, (state, action: PayloadAction<Shop>) => {
        state.shops.push(action.payload);
      })
      // Update shop
      .addCase(updateShop.fulfilled, (state, action: PayloadAction<Shop>) => {
        const index = state.shops.findIndex(shop => shop._id === action.payload._id);
        if (index !== -1) {
          state.shops[index] = action.payload;
        }
        if (state.currentShop && state.currentShop._id === action.payload._id) {
          state.currentShop = action.payload;
        }
      })
      // Delete shop
      .addCase(deleteShop.fulfilled, (state, action: PayloadAction<string>) => {
        state.shops = state.shops.filter(shop => shop._id !== action.payload);
      })
      // Fetch shop statistics
      .addCase(fetchShopStatistics.fulfilled, (state, action: PayloadAction<ShopStatistics>) => {
        state.shopStatistics = action.payload;
      })
      // Fetch shops overview
      .addCase(fetchShopsOverview.fulfilled, (state, action: PayloadAction<any[]>) => {
        state.shopsOverview = action.payload;
      });
  },
});

export const { clearError, clearCurrentShop } = shopSlice.actions;
export default shopSlice.reducer;

