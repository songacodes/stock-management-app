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
    Add as AddIcon,
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

interface AdditionItem {
    tileId: string;
    packets: number | ''; // Allow empty
    pieces: number | ''; // Allow empty
    newItemsPerPacket?: number; // Optional: Update configuration if it changed
}

const AddStock: React.FC = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { tiles, loading } = useSelector((state: RootState) => state.tiles);

    const [selectedItems, setSelectedItems] = useState<AdditionItem[]>([]);
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
            setSelectedItems([...selectedItems, { tileId, packets: '', pieces: '' }]);
        }
    };

    const updateAdditionQuantity = (tileId: string, field: 'packets' | 'pieces', value: string) => {
        const parsedValue = value === '' ? '' : parseInt(value);
        if (parsedValue !== '' && isNaN(parsedValue as number)) return;

        setSelectedItems(selectedItems.map(item =>
            item.tileId === tileId ? { ...item, [field]: parsedValue } : item
        ));
    };

    const removeFromCart = (tileId: string) => {
        setSelectedItems(selectedItems.filter(item => item.tileId !== tileId));
    };

    const handleAddStock = async () => {
        const validItems = selectedItems.filter(item => (Number(item.packets) || 0) > 0 || (Number(item.pieces) || 0) > 0);

        if (validItems.length === 0) {
            setError('Please enter quantities for at least one product');
            return;
        }

        try {
            const token = localStorage.getItem('token');

            // Process all additions
            await Promise.all(
                validItems.map(item =>
                    axios.post(
                        `${API_URL}/stock/add`,
                        {
                            tileId: item.tileId,
                            packets: Number(item.packets) || 0,
                            pieces: Number(item.pieces) || 0,
                            newItemsPerPacket: item.newItemsPerPacket, // Send if present
                        },
                        { headers: { Authorization: `Bearer ${token}` } }
                    )
                )
            );

            setSuccess(`Successfully added stock to ${validItems.length} product(s)`);
            setSelectedItems([]);
            dispatch(fetchTiles({}));
            setTimeout(() => setSuccess(null), 4000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to add stock');
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
                <Box sx={{ py: 4, mb: 4, borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>
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

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Box sx={{
                            bgcolor: (theme) => theme.palette.mode === 'dark' ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.success.main, 0.05),
                            p: 2,
                            borderRadius: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? alpha(theme.palette.success.main, 0.3) : alpha(theme.palette.success.main, 0.1)}`
                        }}>
                            <AddIcon sx={{ fontSize: 32, color: 'success.main' }} />
                        </Box>
                        <Box>
                            <Typography
                                variant="h3"
                                sx={{
                                    fontWeight: 900,
                                    letterSpacing: '-0.04em',
                                    background: (theme) => theme.palette.mode === 'dark'
                                        ? `linear-gradient(135deg, ${theme.palette.success.light} 0%, #ffffff 100%)`
                                        : `linear-gradient(135deg, ${theme.palette.success.dark} 0%, ${theme.palette.success.main} 100%)`,
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                }}
                            >
                                Restock Inventory
                            </Typography>
                            <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500, mt: 0.5 }}>
                                Select items from the catalog below to add pieces to your current stock
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>{success}</Alert>}

                <Grid container spacing={3}>
                    {/* Left: Product Selection Grid */}
                    <Grid item xs={12} md={8}>
                        <Box sx={{ mb: 3 }}>
                            <TextField
                                fullWidth
                                placeholder="Filter by name or reference number..."
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
                                        borderRadius: '12px',
                                        border: `1px solid ${theme.palette.divider}`,
                                        '& fieldset': { borderColor: 'transparent' },
                                        '&:hover fieldset': { borderColor: theme.palette.success.main },
                                        '&.Mui-focused fieldset': { borderColor: theme.palette.success.main }
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
                                            onClick={() => toggleSelection(tile._id)}
                                            sx={{
                                                cursor: 'pointer',
                                                border: (theme) => selected
                                                    ? `2px solid ${theme.palette.success.main}`
                                                    : theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.14)' : `1px solid ${theme.palette.divider}`,
                                                borderRadius: 1,
                                                position: 'relative',
                                                bgcolor: theme.palette.mode === 'dark' ? '#111827' : '#fff',
                                                transition: 'all 0.2s ease',
                                                '&:hover': {
                                                    borderColor: theme.palette.success.main,
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
                                                        bgcolor: 'success.main',
                                                        borderRadius: '50%',
                                                        p: 0.5,
                                                    }}
                                                >
                                                    <CheckCircleIcon sx={{ color: 'white', fontSize: 24 }} />
                                                </Box>
                                            )}
                                            <CardMedia
                                                component="img"
                                                height="180"
                                                image={imageUrl || '/placeholder.png'}
                                                alt={tile.name}
                                                sx={{ objectFit: 'cover' }}
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

                    {/* Right: Addition Cart */}
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
                                Addition List
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
                                                                Current: {tile.quantity} pcs
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
                                                                onChange={(e) => updateAdditionQuantity(item.tileId, 'packets', e.target.value)}
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
                                                                onChange={(e) => updateAdditionQuantity(item.tileId, 'pieces', e.target.value)}
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

                                                    {/* Optional: Update Packet Size Configuration */}
                                                    <Box sx={{ mt: 2 }}>
                                                        <TextField
                                                            fullWidth
                                                            size="small"
                                                            type="number"
                                                            label="Update Pieces per Packet (Optional)"
                                                            placeholder={`Current: ${itemsPerPacket} pcs/pkt`}
                                                            value={item.newItemsPerPacket || ''}
                                                            onChange={(e) => {
                                                                const val = e.target.value ? parseInt(e.target.value) : undefined;
                                                                // Only update if value is different from current
                                                                if (val && val !== itemsPerPacket) {
                                                                    setSelectedItems(selectedItems.map(si =>
                                                                        si.tileId === item.tileId ? { ...si, newItemsPerPacket: val } : si
                                                                    ));
                                                                } else {
                                                                    // Clear if empty or same as current
                                                                    setSelectedItems(selectedItems.map(si => {
                                                                        if (si.tileId === item.tileId) {
                                                                            const { newItemsPerPacket, ...rest } = si;
                                                                            return rest;
                                                                        }
                                                                        return si;
                                                                    }));
                                                                }
                                                            }}
                                                            InputProps={{
                                                                startAdornment: (
                                                                    <InputAdornment position="start">
                                                                        <PacketIcon fontSize="small" color="action" />
                                                                    </InputAdornment>
                                                                ),
                                                            }}
                                                            helperText="Only set this if the packet size has changed for this new batch"
                                                            sx={{
                                                                '& .MuiInputBase-root': { bgcolor: 'background.default' },
                                                            }}
                                                        />
                                                    </Box>

                                                    {totalQty > 0 && (
                                                        <Box sx={{ mt: 1.5, p: 1, bgcolor: alpha(theme.palette.success.main, 0.08), borderRadius: 1.5 }}>
                                                            <Typography variant="caption" color="success.main" fontWeight={700} sx={{ display: 'block' }}>
                                                                Total Addition: {totalQty} pieces
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '10px' }}>
                                                                ({Math.floor(totalQty / itemsPerPacket)} pkts {totalQty % itemsPerPacket > 0 ? `+ ${totalQty % itemsPerPacket} pieces` : ''})
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
                                        color="success"
                                        size="large"
                                        startIcon={<AddIcon />}
                                        onClick={handleAddStock}
                                        sx={{
                                            py: 2,
                                            borderRadius: '16px',
                                            fontWeight: 900,
                                            fontSize: '1rem',
                                            boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
                                            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                                            '&:hover': {
                                                boxShadow: `0 16px 32px ${alpha(theme.palette.primary.main, 0.4)}`,
                                                transform: 'translateY(-2px)'
                                            }
                                        }}
                                    >
                                        Update Inventory
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

export default AddStock;
