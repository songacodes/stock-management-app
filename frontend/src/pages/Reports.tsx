
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
    Tab
} from '@mui/material';
import {
    Download as DownloadIcon,
    FilterList as FilterIcon,
    CalendarToday as CalendarIcon,
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    Description as DescriptionIcon
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import axios from 'axios';
import { format } from 'date-fns';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Reports: React.FC = () => {
    const [loading, setLoading] = useState(false);
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

    // Update filter type when tab changes
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

            console.log(response.data);
            setTransactions(response.data.data);
            setStats(response.data.stats);
            setTotalPages(response.data.pages);
        } catch (error) {
            console.error('Error serving reports:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [page, filters]); // Re-fetch when page or filters change

    const handleFilterChange = (field: string, value: string) => {
        setFilters(prev => ({ ...prev, [field]: value }));
        setPage(1); // Reset to first page
    };

    const downloadCSV = () => {
        if (transactions.length === 0) return;

        // Headers
        const headers = ['Date', 'Product', 'Quantity (Total)', 'Packets', 'Pieces', 'User', 'Notes'];

        // Rows
        const rows = transactions.map(t => [
            format(new Date(t.createdAt), 'yyyy-MM-dd HH:mm'),
            `${t.tileId?.name || 'Deleted Product'}${t.tileId?.isDeleted ? ' (Deleted)' : ''}`,
            t.quantity,
            t.packets || 0,
            t.pieces || 0,
            t.performedBy?.username || 'System',
            t.notes || ''
        ]);

        const csvContent = [
            `Report: Stock ${currentTab === 0 ? 'Added' : 'Removed'}`,
            `Period: ${filters.startDate} to ${filters.endDate}`,
            '', // Empty line
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

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', pb: 8 }}>
            <Container maxWidth="xl">
                {/* Header */}
                <Box sx={{ py: 4, mb: 2 }}>
                    <Typography variant="h4" fontWeight={800} color="#1e293b" gutterBottom>
                        Inventory Reports
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Track additions, removals, and movement history
                    </Typography>
                </Box>

                {/* Statistics Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} md={6}>
                        <Card sx={{
                            borderRadius: 3,
                            border: '1px solid #e2e8f0',
                            background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)'
                        }}>
                            <CardContent>
                                <Box display="flex" alignItems="center" gap={2}>
                                    <Box sx={{ p: 1.5, bgcolor: '#dbeafe', borderRadius: 2 }}>
                                        <TrendingUpIcon sx={{ color: '#2563eb', fontSize: 32 }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary" fontWeight={600}>
                                            TOTAL ADDED (Selected Period)
                                        </Typography>
                                        <Typography variant="h4" fontWeight={700} color="#1e293b">
                                            {stats.stock_in.toLocaleString()} pcs
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Card sx={{
                            borderRadius: 3,
                            border: '1px solid #e2e8f0',
                            background: 'linear-gradient(135deg, #fef2f2 0%, #ffffff 100%)'
                        }}>
                            <CardContent>
                                <Box display="flex" alignItems="center" gap={2}>
                                    <Box sx={{ p: 1.5, bgcolor: '#fee2e2', borderRadius: 2 }}>
                                        <TrendingDownIcon sx={{ color: '#dc2626', fontSize: 32 }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary" fontWeight={600}>
                                            TOTAL REMOVED (Selected Period)
                                        </Typography>
                                        <Typography variant="h4" fontWeight={700} color="#1e293b">
                                            {stats.stock_out.toLocaleString()} pcs
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Tabs */}
                <Paper sx={{ borderRadius: 3, mb: 3 }}>
                    <Tabs
                        value={currentTab}
                        onChange={(_, val) => setCurrentTab(val)}
                        variant="fullWidth"
                        sx={{
                            '& .MuiTab-root': { py: 2, fontWeight: 700 },
                            '& .Mui-selected': { color: currentTab === 0 ? '#2563eb' : '#dc2626' },
                            '& .MuiTabs-indicator': { bgcolor: currentTab === 0 ? '#2563eb' : '#dc2626' }
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
                <Paper sx={{ p: 3, borderRadius: 3, mb: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', width: { xs: '100%', md: 'auto' } }}>
                        <TextField
                            label="Start Date"
                            type="date"
                            size="small"
                            value={filters.startDate}
                            onChange={(e) => handleFilterChange('startDate', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            label="End Date"
                            type="date"
                            size="small"
                            value={filters.endDate}
                            onChange={(e) => handleFilterChange('endDate', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Box>

                    <Button
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        onClick={downloadCSV}
                        sx={{ bgcolor: '#0f172a', '&:hover': { bgcolor: '#334155' } }}
                    >
                        Download Report
                    </Button>
                </Paper>

                {/* Data Table */}
                <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                    {loading && <LinearProgress />}
                    <Table>
                        <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>Date & Time</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Product Name</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Quantity</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Performed By</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Notes</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {transactions.length === 0 && !loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                                        <DescriptionIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.3, mb: 1 }} />
                                        <Typography color="text.secondary">No records found for the selected period.</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                transactions.map((t) => (
                                    <TableRow key={t._id} hover>
                                        <TableCell sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                                            {format(new Date(t.createdAt), 'MMM dd, yyyy')}<br />
                                            {format(new Date(t.createdAt), 'HH:mm')}
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Box>
                                                    <Typography variant="body2" fontWeight={600}>
                                                        {t.tileId?.name || 'Deleted Product'}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">SKU: {t.tileId?.sku || 'N/A'}</Typography>
                                                </Box>
                                                {(t.tileId?.isDeleted || !t.tileId) && (
                                                    <Chip
                                                        label="DELETED"
                                                        size="small"
                                                        color="error"
                                                        variant="outlined"
                                                        sx={{ height: 20, fontSize: '0.65rem', fontWeight: 'bold' }}
                                                    />
                                                )}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={700} sx={{ color: currentTab === 0 ? '#16a34a' : '#dc2626' }}>
                                                {currentTab === 0 ? '+' : '-'}{t.quantity} pieces
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                ({t.packets || 0} pkts, {t.pieces || 0} loose)
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip label={t.performedBy?.username || 'Unknown'} size="small" sx={{ bgcolor: '#f1f5f9' }} />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                                {t.notes || '-'}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', borderTop: '1px solid #e2e8f0' }}>
                        <Pagination
                            count={totalPages}
                            page={page}
                            onChange={(_, p) => setPage(p)}
                            color="primary"
                            shape="rounded"
                        />
                    </Box>
                </TableContainer>
            </Container>
        </Box>
    );
};

export default Reports;
