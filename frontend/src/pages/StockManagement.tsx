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
import { useTheme } from '@mui/material/styles';
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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StockManagement: React.FC = () => {
  const theme = useTheme();
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
          <Typography
            variant="h3"
            sx={{
              fontWeight: 900,
              letterSpacing: '-0.04em',
              background: (theme) => theme.palette.mode === 'dark'
                ? `linear-gradient(135deg, #fff 0%, ${alpha(theme.palette.primary.light, 0.8)} 100%)`
                : `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1
            }}
          >
            Inventory Control
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            Manage and track your products across all warehouses
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/stock/add')}
            sx={{
              borderRadius: '12px',
              px: 3,
              py: 1.2,
              fontWeight: 700,
              boxShadow: (theme) => `0 8px 16px ${alpha(theme.palette.primary.main, 0.2)}`,
              background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              '&:hover': {
                boxShadow: (theme) => `0 12px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
                transform: 'translateY(-2px)'
              }
            }}
          >
            Restock
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<RemoveIcon />}
            onClick={() => navigate('/stock/remove')}
            sx={{
              borderRadius: '12px',
              px: 3,
              py: 1.2,
              fontWeight: 700,
              borderWidth: '2px',
              '&:hover': {
                borderWidth: '2px',
                bgcolor: (theme) => alpha(theme.palette.error.main, 0.05),
                transform: 'translateY(-2px)'
              }
            }}
          >
            Reduce
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
            borderRadius: '14px',
            backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.03) : alpha(theme.palette.common.black, 0.03),
            border: `1px solid ${theme.palette.divider}`,
            display: 'flex',
            alignItems: 'center',
            px: 2.5,
            transition: 'all 0.3s ease',
            '&:focus-within': {
              borderColor: theme.palette.primary.main,
              bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.05) : alpha(theme.palette.common.black, 0.01),
              boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.1)}`
            }
          }}
        >
          <SearchIcon sx={{ color: 'text.secondary', mr: 1.5, fontSize: 22 }} />
          <InputBase
            placeholder="Search by name or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ flex: 1, py: 1.2, fontWeight: 500 }}
          />
        </Box>

        <IconButton
          onClick={handleFilterClick}
          sx={{ bgcolor: 'background.paper', border: (theme) => `1px solid ${theme.palette.divider}` }}
        >
          <SortIcon />
        </IconButton>

        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleFilterClose}>
          <MenuItem onClick={() => handleSortChange('name')} selected={sortBy === 'name'}>Name</MenuItem>
          <MenuItem onClick={() => handleSortChange('stock')} selected={sortBy === 'stock'}>Stock Level</MenuItem>
        </Menu>

        <Box sx={{ display: 'flex', bgcolor: 'background.paper', borderRadius: 2, border: (theme) => `1px solid ${theme.palette.divider}` }}>
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
        <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 5, overflow: 'hidden' }}>
          <Table>
            <TableHead sx={{ bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.02) : alpha(theme.palette.common.black, 0.02) }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, py: 2.5 }}>Product</TableCell>
                <TableCell sx={{ fontWeight: 700, py: 2.5 }}>SKU</TableCell>
                <TableCell sx={{ fontWeight: 700, py: 2.5 }}>Stock Details</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, py: 2.5 }}>Actions</TableCell>
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
                    <Tooltip title="Delete Permanently">
                      <IconButton
                        size="small"
                        sx={{
                          color: theme.palette.text.secondary,
                          '&:hover': { color: theme.palette.error.main, bgcolor: alpha(theme.palette.error.main, 0.08) }
                        }}
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
              <Card
                elevation={0}
                sx={{
                  borderRadius: 5,
                  border: `1px solid ${theme.palette.divider}`,
                  background: theme.palette.mode === 'dark' ? alpha(theme.palette.background.paper, 0.4) : '#fff',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    borderColor: theme.palette.primary.main,
                    boxShadow: `0 12px 24px ${alpha(theme.palette.common.black, theme.palette.mode === 'dark' ? 0.5 : 0.05)}`
                  }
                }}
              >
                <Box sx={{ position: 'relative', pt: '75%', bgcolor: theme.palette.mode === 'dark' ? '#04070a' : '#f8fafc' }}>
                  {tile.images?.[0] ? (
                    <Box component="img" src={getImageUrl(tile.images[0].url)}
                      sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <InventoryIcon sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', opacity: 0.1, fontSize: 48 }} />
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
            borderRadius: '28px',
            overflow: 'hidden',
            border: theme.palette.mode === 'dark' ? `1px solid ${alpha(theme.palette.error.main, 0.2)}` : 'none',
            boxShadow: theme.palette.mode === 'dark' ? '0 50px 100px -20px rgba(0, 0, 0, 0.8)' : '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
          }
        }}
      >
        <Box sx={{ p: 5 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', mb: 4 }}>
            <Box sx={{
              width: 80,
              height: 80,
              borderRadius: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: alpha(theme.palette.error.main, 0.1),
              color: theme.palette.error.main,
              mb: 3,
              boxShadow: `0 12px 24px ${alpha(theme.palette.error.main, 0.15)}`
            }}>
              <DeleteIcon sx={{ fontSize: 40 }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.03em', color: theme.palette.text.primary, mb: 1.5 }}>
              Confirm Deletion
            </Typography>
            <Typography variant="body1" sx={{ color: theme.palette.text.secondary, fontWeight: 500, maxWidth: '80%' }}>
              You are about to permanently remove <Box component="span" sx={{ color: theme.palette.error.main, fontWeight: 700 }}>{itemToDelete?.name}</Box> from the database.
            </Typography>
          </Box>

          <Alert
            severity="warning"
            sx={{
              borderRadius: '16px',
              border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
              bgcolor: alpha(theme.palette.warning.main, 0.05),
              py: 1.5,
              mb: 4,
              '& .MuiAlert-icon': { color: theme.palette.warning.main }
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.warning.main, mb: 0.5 }}>
              Irreversible Action
            </Typography>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block' }}>
              All transaction history and product images will be lost forever.
            </Typography>
          </Alert>

          <Box sx={{ display: 'flex', gap: 2.5 }}>
            <Button
              onClick={() => {
                setDeleteDialogOpen(false);
                setItemToDelete(null);
              }}
              variant="text"
              sx={{
                flex: 1,
                py: 2,
                borderRadius: '16px',
                fontWeight: 700,
                color: theme.palette.text.secondary,
                '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.05) }
              }}
            >
              Keep Product
            </Button>
            <Button
              onClick={handleDelete}
              variant="contained"
              color="error"
              sx={{
                flex: 1.5,
                py: 2,
                borderRadius: '16px',
                fontWeight: 900,
                boxShadow: `0 8px 24px ${alpha(theme.palette.error.main, 0.3)}`,
                '&:hover': {
                  bgcolor: theme.palette.error.dark,
                  boxShadow: `0 12px 32px ${alpha(theme.palette.error.main, 0.4)}`,
                }
              }}
            >
              Delete Permanently
            </Button>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
};

export default StockManagement;
