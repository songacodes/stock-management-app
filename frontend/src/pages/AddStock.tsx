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
import { alpha } from '@mui/material/styles';
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
        <Box sx={{ minHeight: '100vh', bgcolor: '#fafafa', pb: 4 }}>
            <Container maxWidth="xl">
                <Box sx={{ py: 3, borderBottom: '2px solid #16a34a', mb: 3 }}>
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate('/stock')}
                        sx={{ mb: 2, color: 'text.secondary' }}
                    >
                        Back to Stock Overview
                    </Button>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{
                            bgcolor: '#dcfce7',
                            p: 2,
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <AddIcon sx={{ fontSize: 40, color: '#16a34a' }} />
                        </Box>
                        <Box>
                            <Typography variant="h4" fontWeight={700} color="#16a34a">
                                Add Stock to Inventory
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Click product images to select, then enter quantities to add
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
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{ bgcolor: 'white', borderRadius: 2 }}
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
                                                border: selected ? '3px solid #16a34a' : '1px solid #e5e7eb',
                                                transition: 'all 0.2s',
                                                position: 'relative',
                                                '&:hover': {
                                                    boxShadow: 4,
                                                    transform: 'translateY(-4px)',
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
                                                        bgcolor: '#16a34a',
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
                                bgcolor: 'white',
                                borderRadius: 3,
                                p: 3,
                                boxShadow: 3,
                            }}
                        >
                            <Typography variant="h6" fontWeight={700} gutterBottom>
                                Addition Cart ({selectedItems.length})
                            </Typography>
                            <Divider sx={{ mb: 2 }} />

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
                                                <Box key={item.tileId} sx={{ mb: 2, p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
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
                                                                '& .MuiInputBase-root': { bgcolor: 'white' },
                                                                '& .MuiInputLabel-root': { color: '#16a34a' }
                                                            }}
                                                        />
                                                    </Box>

                                                    {totalQty > 0 && (
                                                        <Box sx={{ mt: 1.5, p: 1, bgcolor: alpha('#16a34a', 0.08), borderRadius: 1.5 }}>
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
                                        sx={{ py: 1.5 }}
                                    >
                                        Confirm Add Stock
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
