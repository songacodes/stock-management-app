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
} from '@mui/material';
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
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
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
      backgroundColor: '#fdfbff', // Very soft light background
      pb: 6,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background Blobs for Glassmorphism */}
      <Box sx={{
        position: 'absolute',
        top: '-10%',
        right: '10%',
        width: '50vw',
        height: '50vw',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(99, 102, 241, 0) 70%)',
        filter: 'blur(80px)',
        animation: 'float1 20s infinite alternate ease-in-out',
        '@keyframes float1': {
          '0%': { transform: 'translate(0, 0)' },
          '100%': { transform: 'translate(-10%, 10%)' },
        }
      }} />
      <Box sx={{
        position: 'absolute',
        bottom: '10%',
        left: '-5%',
        width: '40vw',
        height: '40vw',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(244, 114, 182, 0.12) 0%, rgba(244, 114, 182, 0) 70%)',
        filter: 'blur(80px)',
        animation: 'float2 25s infinite alternate-reverse ease-in-out',
        '@keyframes float2': {
          '0%': { transform: 'translate(0, 0)' },
          '100%': { transform: 'translate(15%, -10%)' },
        }
      }} />
      <Box sx={{
        position: 'absolute',
        top: '20%',
        left: '20%',
        width: '30vw',
        height: '30vw',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(56, 189, 248, 0.1) 0%, rgba(56, 189, 248, 0) 70%)',
        filter: 'blur(60px)',
        animation: 'float3 15s infinite alternate ease-in-out',
        '@keyframes float3': {
          '0%': { transform: 'translate(0, 0)' },
          '100%': { transform: 'translate(-5%, -5%)' },
        }
      }} />

      <Fade in timeout={800}>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          {/* Header */}
          <Box sx={{ pt: 4, pb: 3, px: 3 }}>
            <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/tiles')}
                sx={{
                  mb: 3,
                  color: '#475569',
                  '&:hover': {
                    bgcolor: 'rgba(0,0,0,0.05)'
                  }
                }}
              >
                Back to Products
              </Button>

              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Zoom in timeout={600}>
                  <Box sx={{
                    display: 'inline-flex',
                    bgcolor: 'rgba(255,255,255,0.7)',
                    backdropFilter: 'blur(10px)',
                    p: 2,
                    borderRadius: 3,
                    mb: 2,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
                    border: '1px solid rgba(255,255,255,0.3)'
                  }}>
                    <SparklesIcon sx={{ fontSize: 48, color: '#fbbf24' }} />
                  </Box>
                </Zoom>

                <Typography
                  variant="h2"
                  fontWeight={800}
                  sx={{
                    color: '#1e293b',
                    mb: 1,
                    letterSpacing: '-0.02em'
                  }}
                >
                  {isEditMode ? 'Edit Product' : 'Create New Product'}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: '#64748b',
                    fontWeight: 400
                  }}
                >
                  {isEditMode ? 'Update your product details' : 'Add something amazing to your inventory'}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Main Content */}
          <Box sx={{ maxWidth: 1200, mx: 'auto', px: 3 }}>
            {error && (
              <Zoom in>
                <Alert
                  severity="error"
                  sx={{
                    mb: 3,
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.05)'
                  }}
                  onClose={() => setError(null)}
                >
                  {error}
                </Alert>
              </Zoom>
            )}

            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* Images Section */}
                <Grid item xs={12} md={5}>
                  <Zoom in timeout={400}>
                    <Card sx={{
                      p: 4,
                      borderRadius: 4,
                      background: 'rgba(255, 255, 255, 0.45)',
                      backdropFilter: 'blur(40px) saturate(180%)',
                      boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
                      border: '1px solid rgba(255,255,255,0.6)',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 24px 70px rgba(0,0,0,0.12)',
                      }
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                        <Box sx={{
                          background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
                          p: 2,
                          borderRadius: 3,
                          boxShadow: '0 8px 24px rgba(124, 58, 237, 0.3)'
                        }}>
                          <ImageIcon sx={{ color: 'white', fontSize: 32 }} />
                        </Box>
                        <Box>
                          <Typography variant="h5" fontWeight={700} color="#1e293b">
                            Product Images
                          </Typography>
                          <Typography variant="body2" color="#64748b">
                            Upload stunning visuals
                          </Typography>
                        </Box>
                      </Box>
                      <ImageUpload
                        images={images}
                        onImagesChange={setImages}
                        multiple={true}
                        maxFiles={10}
                      />
                    </Card>
                  </Zoom>
                </Grid>

                {/* Details Section */}
                <Grid item xs={12} md={7}>
                  <Grid container spacing={3}>
                    {/* Product Info */}
                    <Grid item xs={12}>
                      <Zoom in timeout={500}>
                        <Card sx={{
                          p: 4,
                          borderRadius: 4,
                          background: 'rgba(255, 255, 255, 0.45)',
                          backdropFilter: 'blur(40px) saturate(180%)',
                          boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
                          border: '1px solid rgba(255,255,255,0.6)',
                          transition: 'transform 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                          }
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                            <Box sx={{
                              background: 'linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)',
                              p: 2,
                              borderRadius: 3,
                              boxShadow: '0 8px 24px rgba(37, 99, 235, 0.3)'
                            }}>
                              <CategoryIcon sx={{ color: 'white', fontSize: 32 }} />
                            </Box>
                            <Box>
                              <Typography variant="h5" fontWeight={700} color="#1e293b">
                                Product Details
                              </Typography>
                              <Typography variant="body2" color="#64748b">
                                Essential information
                              </Typography>
                            </Box>
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
                                placeholder="e.g., Premium Ceramic Tiles"
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: 3,
                                    bgcolor: 'rgba(255,255,255,0.5)',
                                    '&:hover': {
                                      bgcolor: 'rgba(255,255,255,0.8)',
                                    }
                                  }
                                }}
                              />
                            </Grid>

                            {isEditMode && (
                              <Grid item xs={12}>
                                <TextField
                                  fullWidth
                                  label="SKU"
                                  name="sku"
                                  value={formData.sku}
                                  disabled
                                  helperText="Auto-generated and cannot be changed"
                                  sx={{
                                    '& .MuiOutlinedInput-root': {
                                      borderRadius: 3,
                                    }
                                  }}
                                />
                              </Grid>
                            )}

                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                label="Pieces per Packet/Box"
                                name="piecesPerPacket"
                                type="number"
                                value={formData.piecesPerPacket}
                                onChange={handleChange}
                                required
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <Box sx={{
                                        bgcolor: '#dbeafe',
                                        p: 1,
                                        borderRadius: 2,
                                        display: 'flex'
                                      }}>
                                        <CategoryIcon sx={{ color: '#2563eb', fontSize: 20 }} />
                                      </Box>
                                    </InputAdornment>
                                  ),
                                }}
                                inputProps={{ min: 1 }}
                                helperText="How many individual pieces are in one packet?"
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: 3,
                                    bgcolor: 'rgba(255,255,255,0.5)',
                                  }
                                }}
                              />
                            </Grid>
                          </Grid>
                        </Card>
                      </Zoom>
                    </Grid>

                    {/* Stock */}
                    <Grid item xs={12}>
                      <Zoom in timeout={600}>
                        <Card sx={{
                          p: 4,
                          borderRadius: 4,
                          background: 'rgba(255, 255, 255, 0.45)',
                          backdropFilter: 'blur(40px) saturate(180%)',
                          boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
                          border: '1px solid rgba(255,255,255,0.6)',
                          transition: 'transform 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                          }
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                            <Box sx={{
                              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                              p: 2,
                              borderRadius: 3,
                              boxShadow: '0 8px 24px rgba(245, 158, 11, 0.3)'
                            }}>
                              <InventoryIcon sx={{ color: 'white', fontSize: 32 }} />
                            </Box>
                            <Box>
                              <Typography variant="h5" fontWeight={700} color="#1e293b">
                                Initial Stock
                              </Typography>
                              <Typography variant="body2" color="#64748b">
                                Current inventory levels
                              </Typography>
                            </Box>
                          </Box>

                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <TextField
                                fullWidth
                                label="Number of Packets"
                                name="packets"
                                type="number"
                                value={formData.packets}
                                onChange={handleChange}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <Box sx={{
                                        bgcolor: '#fef3c7',
                                        p: 1,
                                        borderRadius: 2,
                                        display: 'flex'
                                      }}>
                                        <InventoryIcon sx={{ color: '#f59e0b', fontSize: 20 }} />
                                      </Box>
                                    </InputAdornment>
                                  ),
                                }}
                                inputProps={{ min: 0 }}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: 3,
                                    bgcolor: 'rgba(255,255,255,0.5)',
                                  }
                                }}
                              />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <TextField
                                fullWidth
                                label="Loose Pieces (Optional)"
                                name="loosePieces"
                                type="number"
                                value={formData.loosePieces}
                                onChange={handleChange}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <Box sx={{
                                        bgcolor: '#fef3c7',
                                        p: 1,
                                        borderRadius: 2,
                                        display: 'flex'
                                      }}>
                                        <CategoryIcon sx={{ color: '#f59e0b', fontSize: 20 }} />
                                      </Box>
                                    </InputAdornment>
                                  ),
                                }}
                                inputProps={{ min: 0 }}
                                helperText="Additional loose pieces"
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: 3,
                                    bgcolor: 'rgba(255,255,255,0.5)',
                                  }
                                }}
                              />
                            </Grid>
                          </Grid>

                          <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" color="text.secondary" fontWeight={500}>
                              Total Calculated Pieces:
                            </Typography>
                            <Typography variant="h6" fontWeight={700} color="primary.main">
                              {(parseInt(formData.packets) || 0) * (parseInt(formData.piecesPerPacket) || 1) + (parseInt(formData.loosePieces) || 0)} pieces
                            </Typography>
                          </Box>
                        </Card>
                      </Zoom>
                    </Grid>
                  </Grid>
                </Grid>

                {/* Actions */}
                <Grid item xs={12}>
                  <Zoom in timeout={700}>
                    <Box sx={{
                      display: 'flex',
                      gap: 2,
                      justifyContent: 'center',
                      mt: 2
                    }}>
                      <Button
                        variant="outlined"
                        onClick={() => navigate('/tiles')}
                        size="large"
                        sx={{
                          px: 6,
                          py: 1.5,
                          borderRadius: 3,
                          borderColor: '#cbd5e1',
                          color: '#64748b',
                          fontWeight: 600,
                          fontSize: '1.1rem',
                          '&:hover': {
                            borderColor: '#94a3b8',
                            bgcolor: 'rgba(0,0,0,0.02)'
                          }
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        size="large"
                        sx={{
                          px: 6,
                          py: 1.5,
                          borderRadius: 3,
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          fontWeight: 700,
                          fontSize: '1.1rem',
                          boxShadow: '0 12px 40px rgba(16, 185, 129, 0.4)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                            boxShadow: '0 16px 50px rgba(16, 185, 129, 0.5)',
                            transform: 'translateY(-2px)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {loading ? 'Saving...' : (isEditMode ? 'Update Product' : 'Create Product')}
                      </Button>
                    </Box>
                  </Zoom>
                </Grid>
              </Grid>
            </form>
          </Box>
        </Box>
      </Fade>

      {/* Success Modal */}
      <Dialog
        open={successModal}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 24px 80px rgba(0,0,0,0.15)',
            border: '1px solid rgba(255,255,255,0.4)'
          }
        }}
      >
        <DialogContent sx={{ p: 6, textAlign: 'center' }}>
          <Zoom in timeout={300}>
            <Box sx={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              width: 100,
              height: 100,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
              boxShadow: '0 12px 32px rgba(16, 185, 129, 0.3)'
            }}>
              <CheckIcon sx={{ fontSize: 60, color: 'white' }} />
            </Box>
          </Zoom>
          <Typography variant="h4" fontWeight={800} color="#1e293b" gutterBottom>
            Success!
          </Typography>
          <Typography variant="body1" color="#64748b" sx={{ mb: 3 }}>
            {isEditMode ? 'Product updated successfully' : 'Product created successfully'}
          </Typography>
          <LinearProgress
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: 'rgba(0,0,0,0.05)',
              '& .MuiLinearProgress-bar': {
                bgcolor: '#10b981',
                borderRadius: 3,
              }
            }}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default TileCreate;
