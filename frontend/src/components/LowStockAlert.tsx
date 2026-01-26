import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Box,
    useTheme,
    useMediaQuery,
    alpha
} from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { useNavigate } from 'react-router-dom';

// Threshold for low stock (total pieces)
// You could make this dynamic later
const LOW_STOCK_THRESHOLD = 50;

const LowStockAlert: React.FC = () => {
    const [open, setOpen] = useState(false);
    const { tiles } = useSelector((state: RootState) => state.tiles);
    const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
    const navigate = useNavigate();
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

    // Check for low stock items
    const lowStockTiles = tiles.filter(tile => tile.quantity < LOW_STOCK_THRESHOLD);

    useEffect(() => {
        // Show alert if authenticated, there are low stock items, and we haven't shown it this session
        // Using session storage to avoid annoying the user on every refresh, 
        // BUT the user said "first thing he/she sees", so maybe every time they load the app is good.
        // Let's stick to showing it if it's open.

        if (isAuthenticated && lowStockTiles.length > 0) {
            // Check if we already dismissed it this session?
            // User requested "First thing shoudl be a big alert", implies importance. 
            // I will default to showing it every time the app loads (state reset) or maybe just use local state `open` which defaults to true if condition met.

            // To prevent it appearing constantly during navigation, we can use a session flag.
            const hasSeenAlert = sessionStorage.getItem('hasSeenLowStockAlert');
            if (!hasSeenAlert) {
                setOpen(true);
            }
        }
    }, [isAuthenticated, tiles.length]); // meaningful dependencies

    const handleClose = () => {
        setOpen(false);
        sessionStorage.setItem('hasSeenLowStockAlert', 'true');
    };

    const handleNavigateToStock = () => {
        handleClose();
        // If staff, go to add stock? or just stock list.
        navigate('/stock/add');
    };

    if (lowStockTiles.length === 0) return null;

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullScreen={fullScreen}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderTop: `6px solid ${theme.palette.error.main}`,
                    borderRadius: 2
                }
            }}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2, bgcolor: alpha(theme.palette.error.light, 0.1) }}>
                <WarningIcon color="error" sx={{ fontSize: 40 }} />
                <Box>
                    <Typography variant="h5" component="div" fontWeight="bold" color="error">
                        CRITICAL STOCK ALERT
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary">
                        The following items are running low on stock
                    </Typography>
                </Box>
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
                <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                <TableCell sx={{ fontWeight: 'bold' }}>Product Name</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>SKU</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Remaining (Pcs)</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Packets (Approx)</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {lowStockTiles.map((tile) => (
                                <TableRow key={tile._id} hover>
                                    <TableCell component="th" scope="row">
                                        <Typography fontWeight="500">{tile.name}</Typography>
                                    </TableCell>
                                    <TableCell align="right">{tile.sku}</TableCell>
                                    <TableCell align="right" sx={{ color: 'error.main', fontWeight: 'bold' }}>
                                        {tile.quantity}
                                    </TableCell>
                                    <TableCell align="right">
                                        {Math.floor(tile.quantity / (tile.itemsPerPacket || 1))}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </DialogContent>
            <DialogActions sx={{ p: 3, bgcolor: '#f9fafb' }}>
                <Button onClick={handleClose} color="inherit" size="large">
                    Dismiss
                </Button>
                <Button
                    onClick={handleNavigateToStock}
                    variant="contained"
                    color="error"
                    autoFocus
                    size="large"
                    startIcon={<WarningIcon />}
                >
                    Review & Restock
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default LowStockAlert;
