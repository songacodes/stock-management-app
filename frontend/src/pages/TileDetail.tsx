import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Typography,
  Box,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Button,
  Chip,
  IconButton,
  alpha,
  Divider,
  Stack,
  Card,
  CardContent,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Inventory as InventoryIcon,
  AttachMoney as PriceIcon,
  QrCode as SkuIcon,
  LocalShipping as PacketIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import { RootState, useAppDispatch } from '../store/store';
import { fetchTileById } from '../store/slices/tileSlice';
import { formatRWF } from '../utils/currency';
import { getImageUrl } from '../utils/imageUrl';

const DetailItem: React.FC<{ icon: React.ReactNode; label: string; value: string | number | React.ReactNode }> = ({ icon, label, value }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
    <Box
      sx={{
        mr: 2,
        p: 1.5,
        borderRadius: 2,
        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
        color: 'primary.main',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {icon}
    </Box>
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
        {label}
      </Typography>
      <Typography variant="body1" sx={{ fontWeight: 600 }}>
        {value}
      </Typography>
    </Box>
  </Box>
);

const TileDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentTile, loading, error } = useSelector(
    (state: RootState) => state.tiles
  );
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      dispatch(fetchTileById(id));
    }
  }, [id, dispatch]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error || !currentTile) {
    return (
      <Box p={4}>
        <Alert severity="error" variant="filled" sx={{ borderRadius: 2 }}>
          {error || 'Tile not found'}
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/tiles')} sx={{ mt: 2 }}>
          Back to List
        </Button>
      </Box>
    );
  }

  const itemsPerPacket = currentTile.itemsPerPacket || 1;
  const packets = Math.floor((currentTile.quantity || 0) / itemsPerPacket);
  const looseTiles = (currentTile.quantity || 0) % itemsPerPacket;

  return (
    <Box sx={{ pb: 6 }}>
      {/* Navigation Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/tiles')}
          sx={{
            color: 'text.secondary',
            '&:hover': { bgcolor: 'transparent', color: 'primary.main' },
          }}
        >
          Back to Tiles
        </Button>
        <Stack direction="row" spacing={2}>
          {/* Add Edit/Delete actions here in future */}
          {/* <Button variant="outlined" startIcon={<EditIcon />}>Edit</Button> */}
        </Stack>
      </Box>

      <Grid container spacing={4}>
        {/* Left Column: Images */}
        <Grid item xs={12} md={5}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 4,
              overflow: 'hidden',
              border: '1px solid rgba(0,0,0,0.08)',
              bgcolor: 'background.paper',
            }}
          >
            <Box
              sx={{
                width: '100%',
                paddingTop: '100%', // 1:1 Aspect Ratio
                position: 'relative',
                bgcolor: '#f8fafc',
              }}
            >
              {currentTile.images && currentTile.images.length > 0 ? (
                <Box
                  component="img"
                  src={getImageUrl(currentTile.images[selectedImageIndex].url)}
                  alt={currentTile.name}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    p: 2,
                    transition: 'opacity 0.3s ease',
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400?text=No+Image';
                  }}
                />
              ) : (
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: 'text.secondary',
                  }}
                >
                  <InventoryIcon sx={{ fontSize: 64, opacity: 0.2 }} />
                  <Typography variant="body2" align="center" sx={{ opacity: 0.5 }}>
                    No Image Available
                  </Typography>
                </Box>
              )}
            </Box>
          </Card>

          {/* Thumbnail Gallery */}
          {currentTile.images && currentTile.images.length > 1 && (
            <Stack direction="row" spacing={2} sx={{ mt: 2, overflowX: 'auto', pb: 1 }}>
              {currentTile.images.map((img, index) => (
                <Box
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  sx={{
                    width: 80,
                    height: 80,
                    flexShrink: 0,
                    borderRadius: 2,
                    border: '2px solid',
                    borderColor: selectedImageIndex === index ? 'primary.main' : 'transparent',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': { opacity: 0.8 },
                  }}
                >
                  <img
                    src={getImageUrl(img.url)}
                    alt={`Thumbnail ${index + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </Box>
              ))}
            </Stack>
          )}
        </Grid>

        {/* Right Column: Details */}
        <Grid item xs={12} md={7}>
          <Box>
            <Chip
              label={currentTile.quantity > 0 ? 'In Stock' : 'Out of Stock'}
              color={currentTile.quantity > 0 ? 'success' : 'error'}
              size="small"
              sx={{ mb: 2, fontWeight: 600 }}
            />
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                mb: 4,
                background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {currentTile.name}
            </Typography>

            <Divider sx={{ mb: 4 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <DetailItem
                  icon={<SkuIcon />}
                  label="SKU Code"
                  value={currentTile.sku}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DetailItem
                  icon={<PacketIcon />}
                  label="Packaging"
                  value={`${itemsPerPacket} tiles per packet`}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DetailItem
                  icon={<InventoryIcon />}
                  label="Total Stock"
                  value={`${currentTile.quantity || 0} Pieces`}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DetailItem
                  icon={<CategoryIcon />}
                  label="Stock Breakdown"
                  value={
                    <Box component="span">
                      {packets} packets
                      {looseTiles > 0 && <Box component="span" sx={{ color: 'text.secondary', fontWeight: 400 }}> + {looseTiles} loose</Box>}
                    </Box>
                  }
                />
              </Grid>
            </Grid>

            {/* Quick Actions Card */}
            <Paper
              elevation={0}
              sx={{
                mt: 4,
                p: 3,
                bgcolor: alpha('#2563eb', 0.04),
                borderRadius: 4,
                border: '1px dashed',
                borderColor: 'primary.main',
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                Stock Management
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Need to adjust inventory? Go to the Stock page to add or remove items.
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/stock')}
                startIcon={<InventoryIcon />}
                sx={{
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
                }}
              >
                Manage Stock
              </Button>
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TileDetail;
