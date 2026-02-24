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
import { useTheme } from '@mui/material/styles';
import {
  Inventory as InventoryIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  Add as AddIcon,
  ArrowForward as ArrowForwardIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { RootState, useAppDispatch } from '../store/store';
import { fetchTiles } from '../store/slices/tileSlice';
import { generateNotifications } from '../store/slices/notificationSlice';
import { fetchShopDetails } from '../store/slices/shopSlice';
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
      className="depth-3d"
      sx={{
        position: 'relative',
        overflow: 'hidden',
        background: (theme) => theme.palette.mode === 'dark'
          ? alpha(theme.palette.background.paper, 0.2)
          : theme.palette.background.paper,
        backdropFilter: 'blur(16px)',
        borderRadius: 1,
        border: (theme) => `1px solid ${alpha(color, 0.15)}`,
        cursor: 'pointer',
        '& .stat-icon': {
          transition: 'all 0.5s ease',
        },
        '&:hover .stat-icon': {
          background: color,
          color: '#fff',
          boxShadow: `0 0 20px ${alpha(color, 0.4)}`,
        }
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
              width: 52,
              height: 52,
              borderRadius: 1,
              background: (theme) => theme.palette.mode === 'dark' ? alpha(color, 0.1) : alpha(color, 0.05),
              border: (theme) => `1px solid ${alpha(color, 0.2)}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
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
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { tiles, loading } = useSelector((state: RootState) => state.tiles);
  const { currentShop } = useSelector((state: RootState) => state.shop);
  const { user, token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(fetchTiles({}));
  }, [dispatch]);

  // Fetch shop details if not loaded
  useEffect(() => {
    if (user?.shopId && !currentShop) {
      dispatch(fetchShopDetails(user.shopId));
    }
  }, [user, currentShop, dispatch]);

  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);

  const fetchPendingApprovals = async () => {
    if (user?.role !== 'grand_admin') return;
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await axios.get(`${API_URL}/auth/staff`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const pending = res.data.data.filter((s: any) => s.passwordStatus === 'pending_approval');
      setPendingApprovals(pending);
    } catch (err) {
      console.error('Failed to fetch approvals:', err);
    }
  };

  useEffect(() => {
    if (user?.role === 'grand_admin') {
      fetchPendingApprovals();
    }
  }, [user]);

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

  const lowStockThreshold = currentShop?.settings?.lowStockThreshold || 50;

  const totalTiles = tiles.length;
  const totalQuantity = tiles.reduce((sum: number, tile: any) => sum + (tile.quantity || 0), 0);
  const totalPackets = tiles.reduce((sum: number, tile: any) => sum + Math.floor((tile.quantity || 0) / (tile.itemsPerPacket || 1)), 0);
  const lowStockCount = tiles.filter((tile: any) => (tile.quantity || 0) > 0 && (tile.quantity || 0) < lowStockThreshold).length; // Dynamic threshold
  const outOfStockCount = tiles.filter((tile: any) => (tile.quantity || 0) <= 0).length;
  const inStockCount = tiles.filter((tile: any) => (tile.quantity || 0) > 0).length;

  const recentTiles = tiles.slice(0, 6);

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 900,
              mb: 1,
              letterSpacing: '-0.04em',
              background: (theme) => theme.palette.mode === 'dark'
                ? `linear-gradient(135deg, #fff 0%, ${alpha(theme.palette.primary.light, 0.8)} 100%)`
                : `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
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
            background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            color: '#ffffff',
            width: 54,
            height: 54,
            borderRadius: 1,
            boxShadow: (theme) => `0 8px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
            '&:hover': {
              transform: 'scale(1.05) rotate(90deg)',
              background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.secondary.light} 100%)`,
              boxShadow: (theme) => `0 12px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
            },
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <AddIcon sx={{ fontSize: 28 }} />
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

      {/* Low Stock Section */}
      {lowStockCount > 0 && (
        <Paper
          elevation={0}
          sx={{
            borderRadius: 1,
            mb: 4,
            border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? alpha(theme.palette.error.main, 0.4) : alpha(theme.palette.error.main, 0.2)}`,
            background: (theme) => theme.palette.mode === 'dark'
              ? alpha(theme.palette.error.dark, 0.1)
              : alpha(theme.palette.error.light, 0.05),
            overflow: 'hidden',
          }}
        >
          <Box sx={{ p: 3, borderBottom: '1px solid rgba(239, 68, 68, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <WarningIcon sx={{ color: theme.palette.error.main }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: theme.palette.error.main, letterSpacing: '-0.01em' }}>
                Stock Threshold Alerts
              </Typography>
            </Box>
            <MuiButton
              variant="contained"
              color="error"
              size="small"
              onClick={() => navigate('/stock/add')}
              sx={{ fontWeight: 600, textTransform: 'none', borderRadius: 1 }}
            >
              Add Stock Now
            </MuiButton>
          </Box>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: alpha('#ef4444', 0.05) }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>SKU</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Current Stock</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell align="right"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tiles
                  .filter(tile => (tile.quantity || 0) < lowStockThreshold)
                  .sort((a, b) => (a.quantity || 0) - (b.quantity || 0))
                  .slice(0, 5)
                  .map((tile) => (
                    <TableRow key={tile._id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{tile.name}</TableCell>
                      <TableCell>
                        <Chip label={tile.sku} size="small" variant="outlined" sx={{ borderRadius: 1, fontFamily: 'monospace' }} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: tile.quantity <= 0 ? '#ef4444' : '#f59e0b', fontWeight: 700 }}>
                          {tile.quantity} pcs
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={tile.quantity <= 0 ? 'Out of Stock' : 'Critical'}
                          size="small"
                          sx={{
                            bgcolor: tile.quantity <= 0 ? alpha(theme.palette.error.main, 0.1) : alpha(theme.palette.warning.main, 0.1),
                            color: tile.quantity <= 0 ? theme.palette.error.main : theme.palette.warning.main,
                            fontWeight: 700,
                            borderRadius: '6px',
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => navigate(`/tiles/${tile._id}`)}>
                          <ArrowForwardIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Administrative Alerts */}
      {user?.role === 'grand_admin' && pendingApprovals.length > 0 && (
        <Paper
          elevation={0}
          sx={{
            borderRadius: 1,
            mb: 4,
            border: (theme) => `1px solid ${alpha(theme.palette.warning.main, 0.4)}`,
            background: (theme) => alpha(theme.palette.warning.main, 0.05),
            overflow: 'hidden',
          }}
        >
          <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <SecurityIcon sx={{ color: theme.palette.warning.main }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: theme.palette.warning.main }}>
                {pendingApprovals.length} Pending Password Approvals
              </Typography>
            </Box>
            <MuiButton
              variant="contained"
              color="warning"
              size="small"
              onClick={() => navigate('/settings')}
              sx={{ fontWeight: 700, borderRadius: 1 }}
            >
              Review & Approve
            </MuiButton>
          </Box>
        </Paper>
      )}

      {/* Inventory Snapshot Section */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 1,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          background: (theme) => theme.palette.mode === 'dark' ? alpha(theme.palette.background.paper, 0.3) : '#ffffff',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ p: 4, borderBottom: (theme) => `1px solid ${theme.palette.divider}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
            Inventory Status
          </Typography>
          <MuiButton
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate('/tiles')}
            variant="text"
            sx={{
              fontWeight: 700,
              borderRadius: 1,
              px: 3,
            }}
          >
            See More
          </MuiButton>
        </Box>

        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? '#0d1117' : '#f8fafc' }}>
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
