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
import { RootState, useAppDispatch } from '../store/store';
import { useNavigate } from 'react-router-dom';
import { fetchShopDetails } from '../store/slices/shopSlice';

// Multi-line replacement to remove the const

const LowStockAlert: React.FC = () => {
    const dispatch = useAppDispatch();
    const [open, setOpen] = useState(false);
    const { tiles } = useSelector((state: RootState) => state.tiles);
    const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
    const { currentShop } = useSelector((state: RootState) => state.shop);
    const navigate = useNavigate();
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

    useEffect(() => {
        if (user?.shopId && !currentShop) {
            dispatch(fetchShopDetails(user.shopId));
        }
    }, [user, currentShop, dispatch]);

    const lowStockThreshold = currentShop?.settings?.lowStockThreshold || 50;

    // Check for low stock items
    const lowStockTiles = tiles.filter((tile: any) => tile.quantity < lowStockThreshold);

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
                    borderRadius: '24px',
                    overflow: 'hidden',
                    border: (theme) => theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
                    boxShadow: (theme) => theme.palette.mode === 'dark'
                        ? '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
                        : '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
                }
            }}
        >
            <DialogTitle sx={{
                p: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 3,
                background: theme.palette.mode === 'dark'
                    ? `linear-gradient(135deg, ${alpha(theme.palette.error.dark, 0.2)} 0%, ${alpha(theme.palette.background.paper, 0)} 100%)`
                    : `linear-gradient(135deg, ${alpha(theme.palette.error.light, 0.1)} 0%, ${alpha(theme.palette.background.paper, 0)} 100%)`,
                borderBottom: `1px solid ${theme.palette.divider}`
            }}>
                <Box sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: alpha(theme.palette.error.main, 0.1),
                    color: theme.palette.error.main,
                    boxShadow: `0 8px 16px ${alpha(theme.palette.error.main, 0.1)}`
                }}>
                    <WarningIcon sx={{ fontSize: 32 }} />
                </Box>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em', color: theme.palette.error.main }}>
                        Low Stock Alert
                    </Typography>
                    <Typography variant="body1" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
                        The following items require immediate attention
                    </Typography>
                </Box>
            </DialogTitle>
            <DialogContent sx={{ p: 4 }}>
                <TableContainer
                    component={Paper}
                    elevation={0}
                    sx={{
                        borderRadius: '16px',
                        border: `1px solid ${theme.palette.divider}`,
                        overflow: 'hidden',
                        background: theme.palette.mode === 'dark' ? alpha(theme.palette.common.black, 0.2) : alpha(theme.palette.common.white, 0.5)
                    }}
                >
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.02) : alpha(theme.palette.common.black, 0.02) }}>
                                <TableCell sx={{ fontWeight: 700, borderBottom: `2px solid ${theme.palette.divider}` }}>Product</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700, borderBottom: `2px solid ${theme.palette.divider}` }}>SKU</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700, borderBottom: `2px solid ${theme.palette.divider}` }}>Stock</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700, borderBottom: `2px solid ${theme.palette.divider}` }}>Estimate Packets</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {lowStockTiles.map((tile: any) => (
                                <TableRow key={tile._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell component="th" scope="row">
                                        <Typography sx={{ fontWeight: 600 }}>{tile.name}</Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Box component="span" sx={{
                                            px: 1,
                                            py: 0.5,
                                            borderRadius: '6px',
                                            bgcolor: alpha(theme.palette.text.secondary, 0.05),
                                            fontSize: '0.75rem',
                                            fontFamily: 'monospace',
                                            fontWeight: 600
                                        }}>
                                            {tile.sku}
                                        </Box>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Box component="span" sx={{
                                            color: theme.palette.error.main,
                                            fontWeight: 800,
                                            fontSize: '1.1rem'
                                        }}>
                                            {tile.quantity}
                                        </Box>
                                    </TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 500, color: theme.palette.text.secondary }}>
                                        {Math.floor(tile.quantity / (tile.itemsPerPacket || 1))}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </DialogContent>
            <DialogActions sx={{ p: 4, pt: 0, justifyContent: 'space-between' }}>
                <Button
                    onClick={handleClose}
                    sx={{
                        px: 4,
                        fontWeight: 600,
                        color: theme.palette.text.secondary,
                        '&:hover': { color: theme.palette.text.primary, bgcolor: alpha(theme.palette.text.primary, 0.05) }
                    }}
                >
                    Ignore for now
                </Button>
                <Button
                    onClick={handleNavigateToStock}
                    variant="contained"
                    color="error"
                    size="large"
                    sx={{
                        px: 4,
                        py: 1.5,
                        borderRadius: '12px',
                        fontWeight: 700,
                        boxShadow: `0 8px 20px ${alpha(theme.palette.error.main, 0.3)}`,
                        '&:hover': {
                            boxShadow: `0 12px 24px ${alpha(theme.palette.error.main, 0.4)}`,
                        }
                    }}
                    startIcon={<WarningIcon />}
                >
                    Go to Inventory
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default LowStockAlert;
