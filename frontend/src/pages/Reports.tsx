import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Container,
    Grid,
    Card,
    CardContent,
    TextField,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Button,
    IconButton,
    LinearProgress,
    Pagination,
    InputAdornment,
    Tabs,
    Tab,
    Snackbar,
    Alert,
    CircularProgress
} from '@mui/material';
import {
    Download as DownloadIcon,
    FilterList as FilterIcon,
    CalendarToday as CalendarIcon,
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    Description as DescriptionIcon,
    Delete as DeleteIcon,
    ClearAll as ClearAllIcon,
    CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';
import axios from 'axios';
import { format } from 'date-fns';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Tooltip
} from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Reports: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [stats, setStats] = useState({ stock_in: 0, stock_out: 0 });
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [currentTab, setCurrentTab] = useState(0); // 0 = Added, 1 = Removed
    const [filters, setFilters] = useState({
        startDate: format(new Date(new Date().setDate(new Date().getDate() - 30)), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd'),
        type: 'stock_in' // Default to added
    });

    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [clearDialogOpen, setClearDialogOpen] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    const { user } = useSelector((state: RootState) => state.auth);
    const theme = useTheme();

    const formatName = (name: string) => {
        if (!name) return 'Unknown';
        const parts = name.trim().split(/\s+/);
        if (parts.length === 1) return name;
        return `${parts[0]} ${parts.slice(1).map(p => p[0] + '.').join(' ')}`;
    };

    useEffect(() => {
        setFilters(prev => ({ ...prev, type: currentTab === 0 ? 'stock_in' : 'stock_out' }));
        setPage(1);
    }, [currentTab]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/reports`, {
                params: {
                    ...filters,
                    page
                },
                headers: { Authorization: `Bearer ${token}` }
            });

            setTransactions(response.data.data);
            setStats(response.data.stats);
            setTotalPages(response.data.pages);
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [page, filters]);

    const handleFilterChange = (field: string, value: string) => {
        setFilters(prev => ({ ...prev, [field]: value }));
        setPage(1);
    };

    const downloadCSV = () => {
        if (transactions.length === 0) return;

        const headers = ['Date', 'Product', 'Quantity (Total)', 'Packets', 'Pieces', 'User', 'Notes'];
        const rows = transactions.map(t => [
            format(new Date(t.createdAt), 'yyyy-MM-dd HH:mm'),
            `${t.tileId?.name || 'Deleted Product'}${t.tileId?.isDeleted ? ' (Deleted)' : ''}`,
            t.quantity,
            t.packets || 0,
            t.pieces || 0,
            t.performedBy?.name || 'System',
            t.notes || ''
        ]);

        const csvContent = [
            `Report: Stock ${currentTab === 0 ? 'Added' : 'Removed'}`,
            `Period: ${filters.startDate} to ${filters.endDate}`,
            '',
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `Stock_report_${currentTab === 0 ? 'In' : 'Out'}_${format(new Date(), 'yyyyMMdd')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDeleteReport = async () => {
        setActionLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/reports/${deleteId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSnackbar({ open: true, message: 'Report entry deleted successfully', severity: 'success' });
            setDeleteId(null);
            fetchReports();
        } catch (error: any) {
            console.error('Error deleting report:', error);
            setSnackbar({
                open: true,
                message: error.response?.data?.message || 'Error deleting report',
                severity: 'error'
            });
        } finally {
            setActionLoading(false);
        }
    };

    const handleClearFiltered = async () => {
        setActionLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_URL}/reports/clear-filtered`, filters, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSnackbar({
                open: true,
                message: `Successfully cleared ${response.data.count} reports`,
                severity: 'success'
            });
            setClearDialogOpen(false);
            fetchReports();
        } catch (error: any) {
            console.error('Error clearing reports:', error);
            setSnackbar({
                open: true,
                message: error.response?.data?.message || 'Error clearing reports',
                severity: 'error'
            });
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 8 }}>
            <Container maxWidth="xl">
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, mt: 4 }}>
                    <Box>
                        <Typography variant="h4" fontWeight={800} color="#1e293b" gutterBottom>
                            Inventory Reports
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Track additions, removals, and movement history
                        </Typography>
                    </Box>
                    {(user?.role === 'grand_admin' || user?.role === 'shop_admin') && (
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<ClearAllIcon />}
                            onClick={() => setClearDialogOpen(true)}
                            sx={{ borderRadius: 2, fontWeight: 700 }}
                        >
                            Clear Reports
                        </Button>
                    )}
                </Box>

                {/* Statistics Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} md={6}>
                        <Card sx={{
                            borderRadius: 3,
                            border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                            boxShadow: 'none'
                        }}>
                            <CardContent>
                                <Box display="flex" alignItems="center" gap={2}>
                                    <Box sx={{ p: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: 2 }}>
                                        <TrendingUpIcon sx={{ color: theme.palette.primary.main, fontSize: 32 }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ letterSpacing: 1 }}>
                                            TOTAL ADDED (Selected Period)
                                        </Typography>
                                        <Typography variant="h4" fontWeight={700} color="#1e293b">
                                            {stats.stock_in.toLocaleString()} pieces
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Card sx={{
                            borderRadius: 3,
                            border: (theme) => `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                            boxShadow: 'none'
                        }}>
                            <CardContent>
                                <Box display="flex" alignItems="center" gap={2}>
                                    <Box sx={{ p: 1.5, bgcolor: alpha(theme.palette.error.main, 0.1), borderRadius: 2 }}>
                                        <TrendingDownIcon sx={{ color: theme.palette.error.main, fontSize: 32 }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ letterSpacing: 1 }}>
                                            TOTAL REMOVED (Selected Period)
                                        </Typography>
                                        <Typography variant="h4" fontWeight={700} color="#1e293b">
                                            {stats.stock_out.toLocaleString()} pieces
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Tabs */}
                <Paper sx={{ borderRadius: 3, mb: 3, boxShadow: 'none', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    <Tabs
                        value={currentTab}
                        onChange={(_, val) => setCurrentTab(val)}
                        variant="fullWidth"
                        sx={{
                            '& .MuiTab-root': { py: 2, fontWeight: 700 },
                            '& .Mui-selected': { color: currentTab === 0 ? 'primary.main' : 'error.main' },
                            '& .MuiTabs-indicator': { bgcolor: currentTab === 0 ? 'primary.main' : 'error.main' }
                        }}
                    >
                        <Tab
                            icon={<TrendingUpIcon />}
                            label="Stock Added"
                            iconPosition="start"
                        />
                        <Tab
                            icon={<TrendingDownIcon />}
                            label="Stock Removed"
                            iconPosition="start"
                        />
                    </Tabs>
                </Paper>

                {/* Controls Bar */}
                <Paper sx={{ p: 3, borderRadius: 3, mb: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: 'center', justifyContent: 'space-between', boxShadow: 'none', border: '1px solid #e2e8f0' }}>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', width: { xs: '100%', md: 'auto' } }}>
                        <TextField
                            label="Start Date"
                            type="date"
                            size="small"
                            value={filters.startDate}
                            onChange={(e) => handleFilterChange('startDate', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            sx={{ minWidth: 200 }}
                        />
                        <TextField
                            label="End Date"
                            type="date"
                            size="small"
                            value={filters.endDate}
                            onChange={(e) => handleFilterChange('endDate', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            sx={{ minWidth: 200 }}
                        />
                    </Box>

                    <Button
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        onClick={downloadCSV}
                        disabled={transactions.length === 0}
                        sx={{ borderRadius: 2, px: 3, fontWeight: 700 }}
                    >
                        Download CSV
                    </Button>
                </Paper>

                {/* Data Table */}
                <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 'none', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    {loading && <LinearProgress sx={{ height: 2 }} />}
                    <Table>
                        <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>DATE & TIME</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>PRODUCT</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>QUANTITY</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>PERFORMED BY</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>NOTES</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', textAlign: 'right' }}>ACTIONS</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {transactions.length === 0 && !loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                                        <DescriptionIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.2, mb: 2 }} />
                                        <Typography variant="h6" color="text.secondary" fontWeight={500}>No records found</Typography>
                                        <Typography variant="body2" color="text.secondary">Try adjusting your filters or date range.</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                transactions.map((t) => (
                                    <TableRow key={t._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                        <TableCell sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                                            <Box sx={{ fontWeight: 600, color: 'text.primary' }}>{format(new Date(t.createdAt), 'MMM dd, yyyy')}</Box>
                                            <Box>{format(new Date(t.createdAt), 'HH:mm')}</Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Box>
                                                    <Typography variant="body2" fontWeight={700}>
                                                        {t.tileId?.name || 'Deleted Product'}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                                                        {t.tileId?.sku || 'N/A'}
                                                    </Typography>
                                                </Box>
                                                {(t.tileId?.isDeleted || !t.tileId) && (
                                                    <Chip
                                                        label="DELETED"
                                                        size="small"
                                                        color="error"
                                                        variant="outlined"
                                                        sx={{ height: 20, fontSize: '0.65rem', fontWeight: 900 }}
                                                    />
                                                )}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={800} sx={{ color: currentTab === 0 ? 'success.main' : 'error.main' }}>
                                                {currentTab === 0 ? '+' : '-'}{t.quantity} pieces
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                ({t.packets || 0} pkts, {t.pieces || 0} loose)
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={formatName(t.performedBy?.name)}
                                                size="small"
                                                sx={{
                                                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                                                    color: theme.palette.primary.main,
                                                    fontWeight: 700,
                                                    fontSize: '0.7rem'
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary" sx={{
                                                fontStyle: 'italic',
                                                maxWidth: 200,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {t.notes || '-'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={{ textAlign: 'right' }}>
                                            <Tooltip title="Delete record">
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => setDeleteId(t._id)}
                                                    sx={{
                                                        bgcolor: alpha(theme.palette.error.main, 0.05),
                                                        '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.1) }
                                                    }}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                            <Pagination
                                count={totalPages}
                                page={page}
                                onChange={(_, p) => setPage(p)}
                                color="primary"
                                shape="rounded"
                                size="large"
                            />
                        </Box>
                    )}
                </TableContainer>

                {/* Single Delete Confirmation */}
                <Dialog
                    open={!!deleteId}
                    onClose={() => !actionLoading && setDeleteId(null)}
                    PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
                >
                    <DialogTitle sx={{ fontWeight: 800 }}>Confirm Deletion</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Are you sure you want to delete this specific report entry? This action cannot be undone.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button
                            disabled={actionLoading}
                            onClick={() => setDeleteId(null)}
                            color="inherit"
                            sx={{ fontWeight: 700 }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDeleteReport}
                            disabled={actionLoading}
                            color="error"
                            variant="contained"
                            startIcon={actionLoading ? <CircularProgress size={16} color="inherit" /> : null}
                            sx={{ borderRadius: 2, fontWeight: 700, minWidth: 100 }}
                        >
                            {actionLoading ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Bulk Clear Confirmation */}
                <Dialog
                    open={clearDialogOpen}
                    onClose={() => !actionLoading && setClearDialogOpen(false)}
                    PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
                >
                    <DialogTitle sx={{ fontWeight: 800, color: 'error.main' }}>Clear Filtered Reports</DialogTitle>
                    <DialogContent>
                        <DialogContentText sx={{ mb: 2 }}>
                            You are about to clear **all** reports matching the current filters:
                        </DialogContentText>
                        <Box sx={{
                            p: 2,
                            bgcolor: alpha(theme.palette.error.main, 0.05),
                            borderRadius: 2,
                            border: `1px dashed ${theme.palette.error.main}`,
                            mb: 2
                        }}>
                            <Typography variant="body2" fontWeight={700}>Type: {currentTab === 0 ? 'Stock Added' : 'Stock Removed'}</Typography>
                            <Typography variant="body2" fontWeight={700}>Period: {filters.startDate} to {filters.endDate}</Typography>
                        </Box>
                        <DialogContentText sx={{ fontWeight: 700, color: 'error.main' }}>
                            This will permanently remove these records from history.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button
                            disabled={actionLoading}
                            onClick={() => setClearDialogOpen(false)}
                            color="inherit"
                            sx={{ fontWeight: 700 }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleClearFiltered}
                            disabled={actionLoading}
                            color="error"
                            variant="contained"
                            startIcon={actionLoading ? <CircularProgress size={16} color="inherit" /> : null}
                            sx={{ borderRadius: 2, fontWeight: 700, minWidth: 150 }}
                        >
                            {actionLoading ? 'Clearing...' : 'Confirm Clear All'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Notifications */}
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={6000}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert
                        onClose={() => setSnackbar({ ...snackbar, open: false })}
                        severity={snackbar.severity}
                        variant="filled"
                        sx={{ borderRadius: 2, fontWeight: 600 }}
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Container>
        </Box>
    );
};

export default Reports;
