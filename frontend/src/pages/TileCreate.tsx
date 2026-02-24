import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Alert,
  CircularProgress,
  Card,
  InputAdornment,
  Fade,
  Zoom,
  Dialog,
  DialogContent,
  LinearProgress,
  alpha,
} from '@mui/material';
import Stack from '@mui/material/Stack';
import {
  Image as ImageIcon,
  AttachMoney as PriceIcon,
  Inventory as InventoryIcon,
  Category as CategoryIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckIcon,
  AutoAwesome as SparklesIcon,
} from '@mui/icons-material';
import { createTile, fetchTileById } from '../store/slices/tileSlice';
import { useAppDispatch, RootState } from '../store/store';
import { useSelector } from 'react-redux';
import ImageUpload from '../components/ImageUpload';
import axios from 'axios';

const TileCreate: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  const { currentTile, loading: tileLoading } = useSelector((state: RootState) => state.tiles);

  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    packets: '0',
    piecesPerPacket: '1',
    loosePieces: '0',
    sku: '',
  });
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [successModal, setSuccessModal] = useState(false);

  useEffect(() => {
    if (isEditMode && id) {
      dispatch(fetchTileById(id));
    }
  }, [id, isEditMode, dispatch]);

  useEffect(() => {
    if (isEditMode && currentTile) {
      const itemsPerPacket = currentTile.itemsPerPacket || 1;
      const packets = Math.floor(currentTile.quantity / itemsPerPacket);
      const loose = currentTile.quantity % itemsPerPacket;

      setFormData({
        name: currentTile.name,
        packets: packets.toString(),
        piecesPerPacket: itemsPerPacket.toString(),
        loosePieces: loose.toString(),
        sku: currentTile.sku,
      });
      const imageUrls = currentTile.images?.map(img => img.url) || [];
      setImages(imageUrls);
    }
  }, [currentTile, isEditMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!formData.name.trim()) {
      setError('Product name is required');
      setLoading(false);
      return;
    }

    const pkts = parseInt(formData.packets) || 0;
    const perPkt = parseInt(formData.piecesPerPacket) || 1;
    const loose = parseInt(formData.loosePieces) || 0;

    if (perPkt < 1) {
      setError('Pieces per packet must be at least 1');
      setLoading(false);
      return;
    }

    if (images.length === 0) {
      setError('At least one product image is required');
      setLoading(false);
      return;
    }

    const totalQuantity = (pkts * perPkt) + loose;

    const tileData = {
      name: formData.name.trim(),
      price: 0, // Pricing removed
      quantity: Math.max(0, totalQuantity),
      itemsPerPacket: perPkt,
      images: images.map((url) => ({ url })),
    };

    try {
      if (isEditMode && id) {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const token = localStorage.getItem('token');
        await axios.put(`${API_URL}/tiles/${id}`, tileData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await dispatch(createTile(tileData)).unwrap();
      }

      setSuccessModal(true);
      setTimeout(() => {
        navigate('/tiles');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  if (isEditMode && tileLoading) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" sx={{ mt: 3, color: 'text.secondary' }}>
          Loading product details...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      backgroundColor: 'background.default',
      pb: 6,
    }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: 3, pt: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/tiles')}
            sx={{
              mb: 3,
              color: 'text.secondary',
              fontWeight: 600,
              '&:hover': { color: 'primary.main', bgcolor: 'transparent' }
            }}
          >
            Back to Products
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{
              display: 'inline-flex',
              bgcolor: (theme) => theme.palette.mode === 'dark' ? '#111827' : alpha(theme.palette.primary.main, 0.05),
              p: 2,
              borderRadius: 1,
              mb: 2,
              border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.14)' : theme.palette.divider}`
            }}>
              <SparklesIcon sx={{ fontSize: 32, color: 'primary.main' }} />
            </Box>
            <Typography variant="h3" fontWeight={800} sx={{ letterSpacing: '-0.02em', mb: 1 }}>
              {isEditMode ? 'Edit Product' : 'Create Product'}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {isEditMode ? 'Refine your product details with architectural precision.' : 'Add a new monolith to your inventory.'}
            </Typography>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 1 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Left: Images */}
            <Grid item xs={12} md={5}>
              <Card sx={{
                p: 4,
                borderRadius: 1,
                background: (theme) => theme.palette.mode === 'dark' ? '#111827' : '#fff',
                border: (theme) => theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.14)' : `1px solid ${theme.palette.divider}`
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <ImageIcon sx={{ color: 'primary.main', fontSize: 24 }} />
                  <Typography variant="h6" fontWeight={700}>Gallery</Typography>
                </Box>
                <ImageUpload
                  images={images}
                  onImagesChange={setImages}
                  multiple={true}
                  maxFiles={10}
                />
              </Card>
            </Grid>

            {/* Right: Details */}
            <Grid item xs={12} md={7}>
              <Stack spacing={3}>
                <Card sx={{
                  p: 4,
                  borderRadius: 1,
                  background: (theme) => theme.palette.mode === 'dark' ? '#111827' : '#fff',
                  border: (theme) => theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.14)' : `1px solid ${theme.palette.divider}`
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <CategoryIcon sx={{ color: 'primary.main', fontSize: 24 }} />
                    <Typography variant="h6" fontWeight={700}>Specifications</Typography>
                  </Box>
                  <Grid container spacing={2.5}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Product Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        sx={{ '& .MuiOutlinedInput-root': { bgcolor: (theme) => theme.palette.mode === 'dark' ? '#04070a' : 'transparent' } }}
                      />
                    </Grid>
                    {isEditMode && (
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="SKU"
                          value={formData.sku}
                          disabled
                        />
                      </Grid>
                    )}
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Pieces per Packet"
                        name="piecesPerPacket"
                        type="number"
                        value={formData.piecesPerPacket}
                        onChange={handleChange}
                        required
                        inputProps={{ min: 1 }}
                      />
                    </Grid>
                  </Grid>
                </Card>

                <Card sx={{
                  p: 4,
                  borderRadius: 1,
                  background: (theme) => theme.palette.mode === 'dark' ? '#111827' : '#fff',
                  border: (theme) => theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.14)' : `1px solid ${theme.palette.divider}`
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <InventoryIcon sx={{ color: 'warning.main', fontSize: 24 }} />
                    <Typography variant="h6" fontWeight={700}>Inventory</Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Packets"
                        name="packets"
                        type="number"
                        value={formData.packets}
                        onChange={handleChange}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Loose Pieces"
                        name="loosePieces"
                        type="number"
                        value={formData.loosePieces}
                        onChange={handleChange}
                      />
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 3, p: 2, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', borderRadius: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: (theme) => `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>Calculated Total:</Typography>
                    <Typography variant="h6" fontWeight={700} color="primary.main">
                      {(parseInt(formData.packets) || 0) * (parseInt(formData.piecesPerPacket) || 1) + (parseInt(formData.loosePieces) || 0)} pieces
                    </Typography>
                  </Box>
                </Card>
              </Stack>
            </Grid>

            {/* Actions */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/tiles')}
                  size="large"
                  sx={{ px: 6, py: 1.5, borderRadius: 1, fontWeight: 600 }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  size="large"
                  color="success"
                  sx={{ px: 6, py: 1.5, borderRadius: 1, fontWeight: 700 }}
                >
                  {loading ? 'Saving...' : (isEditMode ? 'Update Product' : 'Create Product')}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Box>

      {/* Success Modal */}
      <Dialog open={successModal} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 1, background: (theme) => theme.palette.mode === 'dark' ? '#111827' : '#fff', border: (theme) => `1px solid ${theme.palette.divider}` } }}>
        <DialogContent sx={{ p: 6, textAlign: 'center' }}>
          <Box sx={{
            bgcolor: (theme) => alpha(theme.palette.success.main, 0.1),
            width: 80,
            height: 80,
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 3,
            border: (theme) => `1px solid ${alpha(theme.palette.success.main, 0.2)}`
          }}>
            <CheckIcon sx={{ fontSize: 40, color: 'success.main' }} />
          </Box>
          <Typography variant="h4" fontWeight={800} gutterBottom>Success</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            {isEditMode ? 'Product updated successfully' : 'Product created successfully'}
          </Typography>
          <LinearProgress sx={{ height: 4, borderRadius: 1 }} />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default TileCreate;
