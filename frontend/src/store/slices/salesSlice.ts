import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface SaleItem {
  tileId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  tileId_data?: any;
}

interface Sale {
  _id: string;
  saleNumber: string;
  shopId: any;
  customer: {
    name: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  soldBy: any;
  createdAt: string;
  deliveredAt?: string;
}

interface SalesState {
  sales: Sale[];
  currentSale: Sale | null;
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  pages: number;
}

const initialState: SalesState = {
  sales: [],
  currentSale: null,
  loading: false,
  error: null,
  total: 0,
  page: 1,
  pages: 1,
};

// Async thunks
export const fetchSales = createAsyncThunk(
  'sales/fetchSales',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/sales`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch sales');
    }
  }
);

export const fetchSaleById = createAsyncThunk(
  'sales/fetchSaleById',
  async (id: string, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/sales/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch sale');
    }
  }
);

export const createSale = createAsyncThunk(
  'sales/createSale',
  async (saleData: any, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/sales`, saleData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create sale');
    }
  }
);

export const updateSale = createAsyncThunk(
  'sales/updateSale',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/sales/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update sale');
    }
  }
);

export const cancelSale = createAsyncThunk(
  'sales/cancelSale',
  async (id: string, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/sales/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel sale');
    }
  }
);

export const deliverSale = createAsyncThunk(
  'sales/deliverSale',
  async (id: string, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/sales/${id}/deliver`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to deliver sale');
    }
  }
);

const salesSlice = createSlice({
  name: 'sales',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentSale: (state) => {
      state.currentSale = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch sales
      .addCase(fetchSales.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSales.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.sales = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
      })
      .addCase(fetchSales.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch sale by ID
      .addCase(fetchSaleById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSaleById.fulfilled, (state, action: PayloadAction<Sale>) => {
        state.loading = false;
        state.currentSale = action.payload;
      })
      .addCase(fetchSaleById.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create sale
      .addCase(createSale.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSale.fulfilled, (state, action: PayloadAction<Sale>) => {
        state.loading = false;
        state.sales.unshift(action.payload);
      })
      .addCase(createSale.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update sale
      .addCase(updateSale.fulfilled, (state, action: PayloadAction<Sale>) => {
        const index = state.sales.findIndex(sale => sale._id === action.payload._id);
        if (index !== -1) {
          state.sales[index] = action.payload;
        }
        if (state.currentSale && state.currentSale._id === action.payload._id) {
          state.currentSale = action.payload;
        }
      })
      // Cancel sale
      .addCase(cancelSale.fulfilled, (state, action: PayloadAction<string>) => {
        const index = state.sales.findIndex(sale => sale._id === action.payload);
        if (index !== -1) {
          state.sales[index].status = 'cancelled';
        }
      })
      // Deliver sale
      .addCase(deliverSale.fulfilled, (state, action: PayloadAction<Sale>) => {
        const index = state.sales.findIndex(sale => sale._id === action.payload._id);
        if (index !== -1) {
          state.sales[index] = action.payload;
        }
      });
  },
});

export const { clearError, clearCurrentSale } = salesSlice.actions;
export default salesSlice.reducer;

