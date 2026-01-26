import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Button as MuiButton,
  Grid,
  Box,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  Chip,
  alpha,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  Add as AddIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { RootState, useAppDispatch } from '../store/store';
import { fetchTiles } from '../store/slices/tileSlice';
import { generateNotifications } from '../store/slices/notificationSlice';
import { formatRWF } from '../utils/currency';

// Animated Counter Component
const AnimatedCounter: React.FC<{ value: number; duration?: number }> = ({ value, duration = 800 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * value));
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(value);
      }
    };
    requestAnimationFrame(animate);
  }, [value, duration]);

  return <>{count.toLocaleString()}</>;
};

// Stat Card Component with unique design
const StatCard: React.FC<{
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
}> = ({ title, value, subtitle, icon, color, gradient }) => {
  return (
    <Card
      sx={{
        position: 'relative',
        overflow: 'hidden',
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        border: `2px solid ${color}`,
        color: 'text.primary',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        '&:hover': {
          boxShadow: `0 10px 20px -5px ${color}40`,
          border: `3px solid ${color}`,
          '& .stat-icon': {
            background: `linear-gradient(135deg, ${gradient})`,
            color: '#ffffff',
          },
        },
      }}
    >
      <CardContent sx={{ position: 'relative', p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                textTransform: 'uppercase',
                letterSpacing: 1,
                fontWeight: 600,
                fontSize: '0.75rem',
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                mt: 1,
                mb: 0.5,
                fontSize: { xs: '2rem', md: '2.5rem' },
                color: color,
              }}
            >
              {typeof value === 'number' ? <AnimatedCounter value={value} /> : value}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontSize: '0.875rem',
              }}
            >
              {subtitle}
            </Typography>
          </Box>
          <Box
            className="stat-icon"
            sx={{
              width: 64,
              height: 64,
              borderRadius: 3,
              background: alpha(color, 0.1),
              border: `2px solid ${color}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.4s ease',
              color: color,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { tiles, loading } = useSelector((state: RootState) => state.tiles);

  useEffect(() => {
    dispatch(fetchTiles({}));
  }, [dispatch]);

  // Generate notifications when tiles are loaded
  useEffect(() => {
    if (tiles.length > 0) {
      dispatch(generateNotifications(tiles));
    }
  }, [tiles, dispatch]);

  if (loading && tiles.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  const totalTiles = tiles.length;
  const totalQuantity = tiles.reduce((sum, tile) => sum + (tile.quantity || 0), 0);
  const totalPackets = tiles.reduce((sum, tile) => sum + Math.floor((tile.quantity || 0) / (tile.itemsPerPacket || 1)), 0);
  const lowStockCount = tiles.filter(tile => (tile.quantity || 0) > 0 && (tile.quantity || 0) < 50).length; // Low stock threshold
  const outOfStockCount = tiles.filter(tile => (tile.quantity || 0) <= 0).length;
  const inStockCount = tiles.filter(tile => (tile.quantity || 0) > 0).length;

  const recentTiles = tiles.slice(0, 6);

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 0.5,
              background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Dashboard Overview
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Welcome back! Here's what's happening with your inventory.
          </Typography>
        </Box>
        <IconButton
          onClick={() => navigate('/tiles/create')}
          sx={{
            background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
            color: '#ffffff',
            width: 48,
            height: 48,
            boxShadow: '0 4px 14px 0 rgba(37, 99, 235, 0.4)',
            '&:hover': {
              background: 'linear-gradient(135deg, #1e40af 0%, #6d28d9 100%)',
              boxShadow: '0 6px 20px 0 rgba(37, 99, 235, 0.5)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          <AddIcon />
        </IconButton>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={4}>
          <StatCard
            title="Total Products"
            value={totalTiles}
            subtitle={`${inStockCount} in stock`}
            icon={<InventoryIcon sx={{ fontSize: 32 }} />}
            color="#2563eb"
            gradient="#2563eb 0%, #3b82f6 100%"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={4}>
          <StatCard
            title="Total Quantity"
            value={totalQuantity}
            subtitle={`${totalPackets} packets available`}
            icon={<InventoryIcon sx={{ fontSize: 32 }} />}
            color="#06b6d4"
            gradient="#06b6d4 0%, #22d3ee 100%"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={4}>
          <StatCard
            title="Low Stock"
            value={lowStockCount}
            subtitle={`${outOfStockCount} out of stock`}
            icon={<WarningIcon sx={{ fontSize: 32 }} />}
            color="#ef4444"
            gradient="#ef4444 0%, #f87171 100%"
          />
        </Grid>
      </Grid>

      {/* Inventory Snapshot Section */}
      <Paper
        sx={{
          borderRadius: 4,
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ p: 3, borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Inventory Snapshot
          </Typography>
          <MuiButton
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate('/tiles')}
            sx={{
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': { bgcolor: 'rgba(37, 99, 235, 0.08)' }
            }}
          >
            View Full Inventory
          </MuiButton>
        </Box>

        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Product Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>SKU</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Stock Level</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tiles.slice(0, 8).map((tile) => (
                <TableRow
                  key={tile._id}
                  hover
                  onClick={() => navigate(`/tiles/${tile._id}`)}
                  sx={{ cursor: 'pointer', transition: 'bgcolor 0.2s' }}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight={600} color="text.primary">
                      {tile.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={tile.sku} size="small" variant="outlined" sx={{ borderRadius: 1, fontFamily: 'monospace', height: 24 }} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {tile.quantity} pcs <span style={{ color: '#94a3b8' }}>({Math.floor((tile.quantity || 0) / (tile.itemsPerPacket || 1))} pkts)</span>
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      label={tile.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                      size="small"
                      color={tile.quantity > 0 ? 'success' : 'error'}
                      sx={{ fontWeight: 600, height: 24 }}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {tiles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <InventoryIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.3, mb: 1 }} />
                    <Typography color="text.secondary">No stock items found.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default Dashboard;
