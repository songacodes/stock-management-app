import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

interface StockTransaction {
  _id: string;
  tileId: any;
  shopId: any;
  transactionType: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  referenceNumber?: string;
  notes?: string;
  performedBy: any;
  createdAt: string;
}

interface StockState {
  stock: any[];
  transactions: StockTransaction[];
  lowStockItems: any[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  pages: number;
}

const initialState: StockState = {
  stock: [],
  transactions: [],
  lowStockItems: [],
  loading: false,
  error: null,
  total: 0,
  page: 1,
  pages: 1,
};

// Async thunks
export const fetchStock = createAsyncThunk(
  'stock/fetchStock',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/stock`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stock');
    }
  }
);

export const addStock = createAsyncThunk(
  'stock/addStock',
  async (stockData: any, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/stock/purchase`, stockData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add stock');
    }
  }
);

export const adjustStock = createAsyncThunk(
  'stock/adjustStock',
  async (adjustmentData: any, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/stock/adjustment`, adjustmentData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to adjust stock');
    }
  }
);

export const fetchTransactions = createAsyncThunk(
  'stock/fetchTransactions',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/stock/transactions`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch transactions');
    }
  }
);

export const fetchLowStock = createAsyncThunk(
  'stock/fetchLowStock',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/stock/low-stock`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch low stock items');
    }
  }
);

const stockSlice = createSlice({
  name: 'stock',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch stock
      .addCase(fetchStock.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStock.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.stock = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
      })
      .addCase(fetchStock.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add stock
      .addCase(addStock.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addStock.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addStock.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Adjust stock
      .addCase(adjustStock.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adjustStock.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(adjustStock.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch transactions
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.transactions = action.payload.data;
      })
      .addCase(fetchTransactions.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch low stock
      .addCase(fetchLowStock.fulfilled, (state, action: PayloadAction<any>) => {
        state.lowStockItems = action.payload.data;
      });
  },
});

export const { clearError } = stockSlice.actions;
export default stockSlice.reducer;

