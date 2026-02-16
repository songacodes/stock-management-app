import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Typography,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Alert,
  IconButton,
  InputBase,
  Chip,
  alpha,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  ViewModule as ViewModuleIcon,
  ViewList as ViewListIcon,
  Sort as SortIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { Menu, MenuItem } from '@mui/material';
import { RootState, useAppDispatch } from '../store/store';
import { fetchTiles } from '../store/slices/tileSlice';
import { formatRWF } from '../utils/currency';
import { getImageUrl } from '../utils/imageUrl';

const TilesList: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { tiles, loading, error } = useSelector((state: RootState) => state.tiles);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Initialize search from URL param if present
  const queryParams = new URLSearchParams(location.search);
  const initialSearch = queryParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock'>('name');

  useEffect(() => {
    dispatch(fetchTiles({}));
  }, [dispatch]);

  // Update search query when URL param changes (e.g. from Navbar)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    if (q !== null) {
      setSearchQuery(q);
    }
  }, [location.search]);

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setAnchorEl(null);
  };

  const handleSortChange = (sort: 'name' | 'price' | 'stock') => {
    setSortBy(sort);
    handleFilterClose();
  };

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
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
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
              mb: 0.5
            }}
          >
            Product Catalog
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            Curate and manage your high-quality tile collection ({filteredTiles.length} items)
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/tiles/create')}
          sx={{
            py: 1.5,
            px: 4,
            borderRadius: '14px',
            fontWeight: 700,
            boxShadow: (theme) => `0 8px 16px ${alpha(theme.palette.primary.main, 0.2)}`,
            background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            '&:hover': {
              boxShadow: (theme) => `0 12px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
              transform: 'translateY(-2px)'
            }
          }}
        >
          Add New Product
        </Button>
      </Box>

      {/* Search and Filters */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          mb: 3,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
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
            placeholder="Search catalog by name or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ flex: 1, py: 1.2, fontWeight: 500 }}
          />
        </Box>
        <IconButton
          onClick={handleFilterClick}
          sx={{
            backgroundColor: 'background.paper',
            border: (theme) => `1px solid ${theme.palette.divider}`,
            '&:hover': {
              backgroundColor: 'action.hover',
            },
          }}
        >
          <FilterIcon />
        </IconButton>
        <Box
          sx={{
            display: 'flex',
            gap: 0.5,
            backgroundColor: 'background.paper',
            borderRadius: 2,
            p: 0.5,
            border: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          <IconButton
            size="small"
            onClick={() => setViewMode('grid')}
            sx={{
              color: viewMode === 'grid' ? 'primary.main' : 'text.secondary',
              backgroundColor: viewMode === 'grid' ? alpha('#2563eb', 0.1) : 'transparent',
            }}
          >
            <ViewModuleIcon />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => setViewMode('list')}
            sx={{
              color: viewMode === 'list' ? 'primary.main' : 'text.secondary',
              backgroundColor: viewMode === 'list' ? alpha('#2563eb', 0.1) : 'transparent',
            }}
          >
            <ViewListIcon />
          </IconButton>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleFilterClose}
        >
          <MenuItem onClick={() => handleSortChange('name')} selected={sortBy === 'name'}>Sort by Name</MenuItem>
          <MenuItem onClick={() => handleSortChange('stock')} selected={sortBy === 'stock'}>Sort by Stock</MenuItem>
        </Menu>
      </Box>

      {/* Content Area */}
      {filteredTiles.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            backgroundColor: 'background.paper',
            borderRadius: 4,
            border: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography variant="h6" gutterBottom color="text.secondary">
            {searchQuery ? 'No tiles found matching your search' : 'No tiles found'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {searchQuery ? 'Try a different search term' : 'Create your first tile to get started'}
          </Typography>
          {!searchQuery && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/tiles/create')}
            >
              Create First Tile
            </Button>
          )}
        </Box>
      ) : viewMode === 'list' ? (
        // LIST VIEW IMPLEMENTATION
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)' }}>
          <Table>
            <TableHead sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? alpha(theme.palette.primary.main, 0.1) : '#f8fafc' }}>
              <TableRow>
                <TableCell>Image</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>SKU</TableCell>
                <TableCell>Stock Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTiles.map((tile) => (
                <TableRow key={tile._id} hover onClick={() => navigate(`/tiles/${tile._id}`)} sx={{ cursor: 'pointer' }}>
                  <TableCell>
                    <Box
                      component="img"
                      src={getImageUrl(tile.images?.[0]?.url)}
                      alt={tile.name}
                      sx={{ width: 48, height: 48, borderRadius: 1, objectFit: 'cover', bgcolor: 'action.hover' }}
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48?text=Tile'; }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{tile.name}</TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>{tile.sku}</TableCell>
                  <TableCell>
                    <Chip
                      label={tile.quantity > 0 ? `${tile.quantity} pieces` : 'Out of Stock'}
                      color={tile.quantity > 0 ? 'success' : 'error'}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit Tile">
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); navigate(`/tiles/edit/${tile._id}`); }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="View Details">
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); navigate(`/tiles/${tile._id}`); }}>
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        // GRID VIEW IMPLEMENTATION
        <Grid container spacing={3}>
          {filteredTiles.map((tile) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={tile._id}>
              <Card
                onClick={() => navigate(`/tiles/${tile._id}`)}
                sx={{
                  cursor: 'pointer',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  background: (theme) => theme.palette.mode === 'dark' ? '#111827' : theme.palette.background.paper,
                  border: (theme) => theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.14)' : `1px solid ${theme.palette.divider}`,
                  borderRadius: 1,
                  boxShadow: 'none',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    '& .tile-overlay': {
                      opacity: 1,
                    },
                  },
                }}
              >
                {/* Image Container */}
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    paddingTop: '75%',
                    overflow: 'hidden',
                    backgroundColor: '#f1f5f9',
                  }}
                >
                  {tile.images && tile.images.length > 0 && tile.images[0]?.url ? (
                    <>
                      <CardMedia
                        className="tile-image"
                        component="img"
                        image={getImageUrl(tile.images[0].url)}
                        alt={tile.name || tile.sku}
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <Box
                        className="tile-overlay"
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)',
                          opacity: 0,
                          transition: 'opacity 0.4s ease',
                        }}
                      />
                    </>
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
                      <Typography variant="caption">No Image</Typography>
                    </Box>
                  )}
                  <Chip
                    label={tile.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                    size="small"
                    color={tile.quantity > 0 ? 'success' : 'error'}
                    sx={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      fontWeight: 600,
                      backgroundColor: 'background.paper',
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                    }}
                  />
                </Box>

                <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      mb: 0.5,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {tile.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      mb: 1.5,
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                    }}
                  >
                    {tile.sku}
                  </Typography>
                  <Box sx={{ mt: 'auto', pt: 1.5, borderTop: (theme) => `1px solid ${theme.palette.divider}` }}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                        Qty: {tile.quantity || 0}
                        <Typography component="span" variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                          ({Math.floor((tile.quantity || 0) / (tile.itemsPerPacket || 1))} pkts)
                        </Typography>
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default TilesList;
