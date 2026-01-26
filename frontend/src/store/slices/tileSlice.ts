import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

interface Tile {
  _id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  itemsPerPacket: number;
  images: Array<{
    url: string;
    uploadedAt?: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

interface TileState {
  tiles: Tile[];
  currentTile: Tile | null;
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  pages: number;
}

const initialState: TileState = {
  tiles: [],
  currentTile: null,
  loading: false,
  error: null,
  total: 0,
  page: 1,
  pages: 1,
};

// Async thunks
export const fetchTiles = createAsyncThunk(
  'tiles/fetchTiles',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/tiles`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tiles');
    }
  }
);

export const fetchTileById = createAsyncThunk(
  'tiles/fetchTileById',
  async (id: string, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/tiles/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tile');
    }
  }
);

export const createTile = createAsyncThunk(
  'tiles/createTile',
  async (tileData: any, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');

      // Handle images - extract URLs from objects if needed
      let imageUrls: any[] = [];
      if (tileData.images && tileData.images.length > 0) {
        // If images are objects with url property, extract the url
        imageUrls = tileData.images.map((img: any) => {
          if (typeof img === 'string') {
            return { url: img };
          } else if (img.url) {
            return { url: img.url };
          }
          return img;
        });
      } else {
        return rejectWithValue('At least one image is required');
      }

      // Send as JSON with image URLs
      const response = await axios.post(
        `${API_URL}/tiles`,
        {
          name: tileData.name,
          price: tileData.price,
          quantity: tileData.quantity,
          itemsPerPacket: tileData.itemsPerPacket || 1,
          images: imageUrls
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Create tile error:', error);
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to create tile');
    }
  }
);

export const updateTile = createAsyncThunk(
  'tiles/updateTile',
  async ({ id, tileData }: { id: string; tileData: any }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/tiles/${id}`, tileData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update tile');
    }
  }
);

export const deleteTile = createAsyncThunk(
  'tiles/deleteTile',
  async (id: string, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/tiles/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete tile');
    }
  }
);

const tileSlice = createSlice({
  name: 'tiles',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateTileStock: (state, action) => {
      const { tileId, quantity } = action.payload;
      const tile = state.tiles.find(t => t._id === tileId);
      if (tile) {
        tile.quantity = quantity;
      }
      if (state.currentTile && state.currentTile._id === tileId) {
        state.currentTile.quantity = quantity;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTiles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTiles.fulfilled, (state, action) => {
        state.loading = false;
        state.tiles = action.payload.data || [];
        state.total = action.payload.total || 0;
        state.page = action.payload.page || 1;
        state.pages = action.payload.pages || 1;
      })
      .addCase(fetchTiles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchTileById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTileById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTile = action.payload;
      })
      .addCase(fetchTileById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createTile.fulfilled, (state, action) => {
        state.tiles.unshift(action.payload);
        state.total += 1;
      })
      .addCase(updateTile.fulfilled, (state, action) => {
        const index = state.tiles.findIndex((t) => t._id === action.payload._id);
        if (index !== -1) {
          state.tiles[index] = action.payload;
        }
        if (state.currentTile?._id === action.payload._id) {
          state.currentTile = action.payload;
        }
      })
      .addCase(deleteTile.fulfilled, (state, action) => {
        state.tiles = state.tiles.filter((t) => t._id !== action.payload);
        state.total -= 1;
        if (state.currentTile?._id === action.payload) {
          state.currentTile = null;
        }
      });
  },
});

export const { clearError, updateTileStock } = tileSlice.actions;
export default tileSlice.reducer;
