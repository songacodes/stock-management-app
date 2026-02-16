import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    Typography,
    Box,
    Button,
    Grid,
    TextField,
    Alert,
    CircularProgress,
    Container,
    Card,
    CardMedia,
    CardContent,
    IconButton,
    Divider,
    InputAdornment,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import {
    RemoveCircle as RemoveIcon,
    ArrowBack as ArrowBackIcon,
    CheckCircle as CheckCircleIcon,
    Inventory2 as PacketIcon,
    Category as PieceIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
} from '@mui/icons-material';
import { RootState, useAppDispatch } from '../store/store';
import { fetchTiles } from '../store/slices/tileSlice';
import axios from 'axios';
import { getImageUrl } from '../utils/imageUrl';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

interface RemovalItem {
    tileId: string;
    packets: number | ''; // Allow empty string for UI
    pieces: number | ''; // Allow empty string for UI
}

const RemoveStock: React.FC = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { tiles, loading } = useSelector((state: RootState) => state.tiles);

    const [selectedItems, setSelectedItems] = useState<RemovalItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        dispatch(fetchTiles({}));
    }, [dispatch]);

    const isSelected = (tileId: string) => selectedItems.some(item => item.tileId === tileId);

    const toggleSelection = (tileId: string) => {
        if (isSelected(tileId)) {
            setSelectedItems(selectedItems.filter(item => item.tileId !== tileId));
        } else {
            setSelectedItems([...selectedItems, { tileId, packets: '', pieces: '' }]); // Initialize as empty strings
        }
    };

    const updateRemovalQuantity = (tileId: string, field: 'packets' | 'pieces', value: string) => {
        // Allow empty string or parse number
        const parsedValue = value === '' ? '' : parseInt(value);
        if (parsedValue !== '' && isNaN(parsedValue as number)) return; // Invalid input

        setSelectedItems(selectedItems.map(item =>
            item.tileId === tileId ? { ...item, [field]: parsedValue } : item
        ));
    };

    const removeFromCart = (tileId: string) => {
        setSelectedItems(selectedItems.filter(item => item.tileId !== tileId));
    };

    const handleRemoveStock = async () => {
        const validItems = selectedItems.filter(item => (Number(item.packets) || 0) > 0 || (Number(item.pieces) || 0) > 0);

        if (validItems.length === 0) {
            setError('Please enter quantities for at least one product');
            return;
        }

        try {
            const token = localStorage.getItem('token');

            // Process all removals
            await Promise.all(
                validItems.map(item =>
                    axios.post(
                        `${API_URL}/stock/remove`,
                        {
                            tileId: item.tileId,
                            packets: Number(item.packets) || 0,
                            pieces: Number(item.pieces) || 0,
                        },
                        { headers: { Authorization: `Bearer ${token}` } }
                    )
                )
            );

            setSuccess(`Successfully removed stock from ${validItems.length} product(s)`);
            setSelectedItems([]);
            dispatch(fetchTiles({}));
            setTimeout(() => setSuccess(null), 4000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to remove stock');
        }
    };

    const filteredTiles = tiles.filter(tile =>
        tile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tile.sku.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const calculateTotal = () => {
        return 0; // Pricing removed
    };

    if (loading && tiles.length === 0) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 4 }}>
            <Container maxWidth="xl">
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/stock')}
                    sx={{
                        mb: 3,
                        color: 'text.secondary',
                        fontWeight: 700,
                        '&:hover': { color: 'primary.main', bgcolor: 'transparent' }
                    }}
                >
                    Return to Inventory
                </Button>

                <Box
                    sx={{
                        bgcolor: (theme) => theme.palette.mode === 'dark' ? alpha(theme.palette.error.main, 0.05) : alpha(theme.palette.error.main, 0.02),
                        p: 3,
                        borderRadius: 1,
                        mb: 4,
                        border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? alpha(theme.palette.error.main, 0.3) : alpha(theme.palette.error.main, 0.1)}`,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                        <RemoveIcon sx={{ fontSize: 44, color: 'error.main' }} />
                        <Typography
                            variant="h3"
                            sx={{
                                fontWeight: 900,
                                letterSpacing: '-0.04em',
                                color: theme.palette.error.main
                            }}
                        >
                            Stock Reduction
                        </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500, ml: 8 }}>
                        Record stock removals, sales, or damaged items from your persistent inventory
                    </Typography>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>{success}</Alert>}

                <Grid container spacing={3}>
                    {/* Left: Product Selection Grid */}
                    <Grid item xs={12} md={8}>
                        <Box sx={{ mb: 3 }}>
                            <TextField
                                fullWidth
                                placeholder="Search by name or reference number..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{ color: 'text.secondary' }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.03) : alpha(theme.palette.common.black, 0.03),
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '16px',
                                        border: `1px solid ${theme.palette.divider}`,
                                        '& fieldset': { borderColor: 'transparent' },
                                        '&:hover fieldset': { borderColor: theme.palette.error.main },
                                        '&.Mui-focused fieldset': { borderColor: theme.palette.error.main }
                                    }
                                }}
                            />
                        </Box>

                        <Grid container spacing={2}>
                            {filteredTiles.map((tile) => {
                                const selected = isSelected(tile._id);
                                const imageUrl = tile.images?.[0]?.url ? getImageUrl(tile.images[0].url) : '';

                                return (
                                    <Grid item xs={6} sm={4} md={3} key={tile._id}>
                                        <Card
                                            onClick={() => tile.quantity > 0 && toggleSelection(tile._id)}
                                            sx={{
                                                cursor: tile.quantity > 0 ? 'pointer' : 'default',
                                                border: (theme) => selected
                                                    ? `2px solid ${theme.palette.error.main}`
                                                    : (theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.14)' : `1px solid ${theme.palette.divider}`),
                                                borderRadius: 1,
                                                position: 'relative',
                                                bgcolor: theme.palette.mode === 'dark' ? '#111827' : '#fff',
                                                opacity: tile.quantity > 0 ? 1 : 0.6,
                                                transition: 'all 0.2s ease',
                                                '&:hover': {
                                                    borderColor: tile.quantity > 0 ? theme.palette.error.main : theme.palette.divider,
                                                },
                                            }}
                                        >
                                            {selected && (
                                                <Box
                                                    sx={{
                                                        position: 'absolute',
                                                        top: 8,
                                                        right: 8,
                                                        zIndex: 1,
                                                        bgcolor: 'error.main',
                                                        borderRadius: '50%',
                                                        p: 0.5,
                                                    }}
                                                >
                                                    <CheckCircleIcon sx={{ color: 'white', fontSize: 24 }} />
                                                </Box>
                                            )}
                                            {tile.quantity === 0 && (
                                                <Box
                                                    sx={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        right: 0,
                                                        bottom: 0,
                                                        bgcolor: (theme) => alpha(theme.palette.background.paper, 0.8),
                                                        zIndex: 2,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                    }}
                                                >
                                                    <Box sx={{ bgcolor: 'error.main', color: 'white', px: 2, py: 0.5, borderRadius: 1, fontWeight: 'bold', fontSize: '0.875rem' }}>
                                                        Out of Stock
                                                    </Box>
                                                </Box>
                                            )}
                                            <CardMedia
                                                component="img"
                                                height="180"
                                                image={imageUrl || '/placeholder.png'}
                                                alt={tile.name}
                                                sx={{ objectFit: 'cover', filter: tile.quantity === 0 ? 'grayscale(1)' : 'none' }}
                                            />
                                            <CardContent sx={{ p: 1.5 }}>
                                                <Typography variant="body2" fontWeight={600} noWrap>
                                                    {tile.name}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" display="block">
                                                    {Math.floor(tile.quantity / (tile.itemsPerPacket || 1))} pkts + {tile.quantity % (tile.itemsPerPacket || 1)} pcs
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    </Grid>

                    {/* Right: Removal Cart */}
                    <Grid item xs={12} md={4}>
                        <Box
                            sx={{
                                position: 'sticky',
                                top: 20,
                                bgcolor: 'background.paper',
                                borderRadius: 3,
                                p: 3,
                                border: (theme) => `1px solid ${theme.palette.divider}`,
                            }}
                        >
                            <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.02em' }}>
                                Removal List
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                                    {selectedItems.length} products selected
                                </Typography>
                                {selectedItems.length > 0 && (
                                    <Button size="small" variant="text" color="error" onClick={() => setSelectedItems([])} sx={{ fontWeight: 700 }}>
                                        Clear All
                                    </Button>
                                )}
                            </Box>

                            {selectedItems.length === 0 ? (
                                <Typography color="text.secondary" textAlign="center" py={4}>
                                    Select products from the grid
                                </Typography>
                            ) : (
                                <>
                                    <Box sx={{ maxHeight: 400, overflowY: 'auto', mb: 2 }}>
                                        {selectedItems.map((item) => {
                                            const tile = tiles.find(t => t._id === item.tileId);
                                            if (!tile) return null;

                                            const imageUrl = tile.images?.[0]?.url ? getImageUrl(tile.images[0].url) : '';
                                            const itemsPerPacket = tile.itemsPerPacket || 1;
                                            const totalQty = ((Number(item.packets) || 0) * itemsPerPacket) + (Number(item.pieces) || 0);

                                            return (
                                                <Box key={item.tileId} sx={{ mb: 2, p: 2, bgcolor: (theme) => alpha(theme.palette.background.default, 0.5), borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                        <Box
                                                            component="img"
                                                            src={imageUrl || '/placeholder.png'}
                                                            sx={{ width: 50, height: 50, borderRadius: 1, objectFit: 'cover', mr: 1.5 }}
                                                        />
                                                        <Box sx={{ flex: 1 }}>
                                                            <Typography variant="body2" fontWeight={600}>
                                                                {tile.name}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                Available: {tile.quantity} pcs
                                                            </Typography>
                                                        </Box>
                                                        <IconButton size="small" onClick={() => removeFromCart(item.tileId)}>
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Box>

                                                    <Grid container spacing={1}>
                                                        <Grid item xs={6}>
                                                            <TextField
                                                                fullWidth
                                                                size="small"
                                                                type="number"
                                                                label="Packets"
                                                                value={item.packets}
                                                                onChange={(e) => updateRemovalQuantity(item.tileId, 'packets', e.target.value)}
                                                                InputProps={{
                                                                    startAdornment: (
                                                                        <InputAdornment position="start">
                                                                            <PacketIcon fontSize="small" />
                                                                        </InputAdornment>
                                                                    ),
                                                                }}
                                                                inputProps={{ min: 0 }}
                                                                helperText={`1 pkt = ${itemsPerPacket} pcs`}
                                                            />
                                                        </Grid>
                                                        <Grid item xs={6}>
                                                            <TextField
                                                                fullWidth
                                                                size="small"
                                                                type="number"
                                                                label="Single Pieces" // Renamed
                                                                value={item.pieces}
                                                                onChange={(e) => updateRemovalQuantity(item.tileId, 'pieces', e.target.value)}
                                                                InputProps={{
                                                                    startAdornment: (
                                                                        <InputAdornment position="start">
                                                                            <PieceIcon fontSize="small" />
                                                                        </InputAdornment>
                                                                    ),
                                                                }}
                                                                inputProps={{ min: 0 }}
                                                                helperText="Extra pieces (not in full packets)"
                                                            />
                                                        </Grid>
                                                    </Grid>

                                                    {totalQty > 0 && (
                                                        <Box sx={{ mt: 1.5, p: 1, bgcolor: (theme) => alpha(theme.palette.error.main, 0.08), borderRadius: 1.5 }}>
                                                            <Typography variant="caption" color="error.main" fontWeight={700} sx={{ display: 'block' }}>
                                                                Total Removal: {totalQty} pieces
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '10px' }}>
                                                                ({Math.floor(totalQty / itemsPerPacket)} pkts {totalQty % itemsPerPacket > 0 ? `+ ${totalQty % itemsPerPacket} pieces` : ''})
                                                            </Typography>
                                                            {tile.quantity - totalQty < 0 && (
                                                                <Typography variant="caption" color="error" fontWeight="bold" sx={{ display: 'block', mt: 0.5 }}>
                                                                    Warning: Exceeds available stock!
                                                                </Typography>
                                                            )}
                                                            <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: tile.quantity - totalQty < 0 ? 'error.main' : 'text.secondary' }}>
                                                                Remaining: {Math.max(0, tile.quantity - totalQty)} pcs ({Math.floor(Math.max(0, tile.quantity - totalQty) / itemsPerPacket)} pkts)
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                </Box>
                                            );
                                        })}
                                    </Box>

                                    <Divider sx={{ my: 2 }} />

                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Items Selected: {selectedItems.length}
                                        </Typography>
                                    </Box>

                                    <Button
                                        fullWidth
                                        variant="contained"
                                        color="error"
                                        size="large"
                                        startIcon={<RemoveIcon />}
                                        onClick={handleRemoveStock}
                                        sx={{
                                            py: 2,
                                            borderRadius: '16px',
                                            fontWeight: 900,
                                            fontSize: '1rem',
                                            boxShadow: `0 12px 24px ${alpha(theme.palette.error.main, 0.3)}`,
                                            background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`,
                                            '&:hover': {
                                                boxShadow: `0 16px 32px ${alpha(theme.palette.error.main, 0.4)}`,
                                                transform: 'translateY(-2px)'
                                            }
                                        }}
                                    >
                                        Record Stock Removal
                                    </Button>
                                </>
                            )}
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default RemoveStock;
