import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Typography,
  Box,
  Button,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Alert,
  CircularProgress,
  IconButton,
  InputBase,
  Menu,
  alpha,
  Card,
  CardContent,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  ViewModule as ViewModuleIcon,
  ViewList as ViewListIcon,
  Sort as SortIcon,
  Inventory as InventoryIcon,
} from '@mui/icons-material';
import { RootState, useAppDispatch } from '../store/store';
import { fetchTiles } from '../store/slices/tileSlice';
import axios from 'axios';
import { getImageUrl } from '../utils/imageUrl';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const StockManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { tiles, loading } = useSelector((state: RootState) => state.tiles);

  // UI State
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [sortBy, setSortBy] = useState<'name' | 'stock'>('stock');

  // Delete Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchTiles({}));
  }, [dispatch]);

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleFilterClose = () => setAnchorEl(null);
  const handleSortChange = (sort: 'name' | 'stock') => {
    setSortBy(sort);
    handleFilterClose();
  };

  // Delete handler
  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/tiles/${itemToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess(`Successfully deleted ${itemToDelete.name}`);
      dispatch(fetchTiles({}));
      setTimeout(() => setSuccess(null), 3000);
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete item');
      setDeleteDialogOpen(false);
    }
  };

  // Filter and Sort
  const filteredTiles = tiles
    .filter((tile) =>
      tile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tile.sku.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'stock':
          return (a.quantity || 0) - (b.quantity || 0);
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

  if (loading && tiles.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            Stock Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track and adjust inventory levels
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            color="success"
            startIcon={<AddIcon />}
            onClick={() => navigate('/stock/add')}
            sx={{ boxShadow: '0 4px 12px rgba(46, 125, 50, 0.2)' }}
          >
            Add Stock
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<RemoveIcon />}
            onClick={() => navigate('/stock/remove')}
            sx={{ boxShadow: '0 4px 12px rgba(211, 47, 47, 0.2)' }}
          >
            Remove Stock
          </Button>
        </Box>

      </Box>

      {/* Alerts */}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>{success}</Alert>}

      {/* Toolbar */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center', flexWrap: 'wrap' }}>
        <Box
          sx={{
            flex: 1,
            minWidth: 300,
            position: 'relative',
            borderRadius: 3,
            backgroundColor: '#fff',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            display: 'flex',
            alignItems: 'center',
            px: 2,
          }}
        >
          <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
          <InputBase
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ flex: 1, py: 1 }}
          />
        </Box>

        <IconButton
          onClick={handleFilterClick}
          sx={{ bgcolor: '#fff', border: '1px solid rgba(0,0,0,0.08)' }}
        >
          <SortIcon />
        </IconButton>

        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleFilterClose}>
          <MenuItem onClick={() => handleSortChange('name')} selected={sortBy === 'name'}>Name</MenuItem>
          <MenuItem onClick={() => handleSortChange('stock')} selected={sortBy === 'stock'}>Stock Level</MenuItem>
        </Menu>

        <Box sx={{ display: 'flex', bgcolor: '#fff', borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)' }}>
          <IconButton onClick={() => setViewMode('list')} color={viewMode === 'list' ? 'primary' : 'default'}>
            <ViewListIcon />
          </IconButton>
          <IconButton onClick={() => setViewMode('grid')} color={viewMode === 'grid' ? 'primary' : 'default'}>
            <ViewModuleIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Main Content */}
      {viewMode === 'list' ? (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell>SKU</TableCell>
                <TableCell>Stock Level</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTiles.map((tile) => (
                <TableRow key={tile._id} hover>
                  <TableCell sx={{ fontWeight: 500 }}>{tile.name}</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>
                    {tile.sku}
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {tile.quantity || 0} pieces
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {Math.floor((tile.quantity || 0) / (tile.itemsPerPacket || 1))} pkts
                        {((tile.quantity || 0) % (tile.itemsPerPacket || 1)) > 0 && ` + ${(tile.quantity || 0) % (tile.itemsPerPacket || 1)} loose`}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Delete Item Forever">
                      <IconButton
                        size="small"
                        sx={{ color: '#94a3b8' }}
                        onClick={() => {
                          setItemToDelete({ id: tile._id, name: tile.name });
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Grid container spacing={2}>
          {filteredTiles.map((tile) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={tile._id}>
              <Card elevation={0} sx={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: 3 }}>
                <Box sx={{ position: 'relative', pt: '75%', bgcolor: '#f1f5f9' }}>
                  {tile.images?.[0] ? (
                    <Box component="img" src={getImageUrl(tile.images[0].url)}
                      sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <InventoryIcon sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', opacity: 0.2 }} />
                  )}
                </Box>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight="bold" noWrap>{tile.name}</Typography>
                  <Typography variant="caption" color="text.secondary" display="block">{tile.sku}</Typography>
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Chip
                        label={`${tile.quantity} pcs`}
                        size="small"
                        color={tile.quantity > 0 ? 'success' : 'error'}
                        sx={{ mb: 0.5 }}
                      />
                      <Typography variant="body2" fontWeight="bold" color="primary">
                        {Math.floor((tile.quantity || 0) / (tile.itemsPerPacket || 1))} pkts
                      </Typography>
                    </Box>
                    <Tooltip title="Delete Item Forever">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => {
                          setItemToDelete({ id: tile._id, name: tile.name });
                          setDeleteDialogOpen(true);
                        }}
                        sx={{
                          bgcolor: alpha('#dc2626', 0.1),
                          '&:hover': { bgcolor: alpha('#dc2626', 0.2) }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }
        }}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
            <Box sx={{
              bgcolor: '#fee2e2',
              p: 1.5,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <DeleteIcon sx={{ fontSize: 32, color: '#dc2626' }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                Delete Item Forever?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This action is permanent and cannot be undone
              </Typography>
            </Box>
          </Box>

          <Box sx={{
            bgcolor: '#fef2f2',
            p: 2.5,
            borderRadius: 2,
            border: '1px solid #fecaca',
            mb: 3
          }}>
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              You are about to delete:
            </Typography>
            <Typography variant="h6" fontWeight={700} color="#dc2626">
              {itemToDelete?.name}
            </Typography>
          </Box>

          <Alert
            severity="warning"
            icon={false}
            sx={{
              bgcolor: '#fffbeb',
              border: '1px solid #fde68a',
              '& .MuiAlert-message': {
                width: '100%'
              }
            }}
          >
            <Typography variant="body2" fontWeight={600} gutterBottom>
              Warning
            </Typography>
            <Typography variant="caption" color="text.secondary">
              All stock data, images, and history for this item will be permanently removed from the system.
            </Typography>
          </Alert>

          <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
            <Button
              onClick={() => {
                setDeleteDialogOpen(false);
                setItemToDelete(null);
              }}
              variant="outlined"
              fullWidth
              sx={{
                py: 1.5,
                borderColor: '#e5e7eb',
                color: 'text.secondary',
                '&:hover': {
                  borderColor: '#d1d5db',
                  bgcolor: '#f9fafb'
                }
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              variant="contained"
              color="error"
              fullWidth
              startIcon={<DeleteIcon />}
              sx={{
                py: 1.5,
                bgcolor: '#dc2626',
                '&:hover': {
                  bgcolor: '#b91c1c'
                }
              }}
            >
              Delete Forever
            </Button>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
};

export default StockManagement;
