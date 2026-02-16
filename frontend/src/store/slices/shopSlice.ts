import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

interface ShopSettings {
  lowStockThreshold: number;
}

interface Shop {
  _id: string;
  name: string;
  address?: {
    city?: string;
    country?: string;
  };
  contact?: {
    phone?: string;
    email?: string;
  };
  administratorName?: string;
  settings: ShopSettings;
}

interface ShopState {
  currentShop: Shop | null;
  loading: boolean;
  error: string | null;
}

const initialState: ShopState = {
  currentShop: null,
  loading: false,
  error: null,
};

export const fetchShopDetails = createAsyncThunk(
  'shop/fetchDetails',
  async (shopId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const token = state.auth.token;
      const response = await axios.get(`${API_URL}/shops/${shopId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch shop details');
    }
  }
);

export const updateShopSettings = createAsyncThunk(
  'shop/updateSettings',
  async ({ shopId, settings }: { shopId: string; settings: any }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const token = state.auth.token;
      const response = await axios.put(`${API_URL}/shops/${shopId}`, settings, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update shop settings');
    }
  }
);

const shopSlice = createSlice({
  name: 'shop',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchShopDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchShopDetails.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.currentShop = action.payload;
      })
      .addCase(fetchShopDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateShopSettings.fulfilled, (state, action) => {
        state.currentShop = action.payload;
      });
  },
});

export default shopSlice.reducer;
