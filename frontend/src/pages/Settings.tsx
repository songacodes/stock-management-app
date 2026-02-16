import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Tabs,
    Tab,
    TextField,
    Button,
    Grid,
    Avatar,
    Divider,
    Alert,
    CircularProgress,
    Card,
    CardContent,
    Slider,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    alpha,
    useTheme,
    Switch,
    FormControlLabel,
    Chip,
} from '@mui/material';
import {
    Person as PersonIcon,
    Lock as LockIcon,
    Store as StoreIcon,
    Save as SaveIcon,
    Security as SecurityIcon,
    Inventory as InventoryIcon,
    ChevronRight as ChevronRightIcon,
    Phone as PhoneIcon,
    Email as EmailIcon,
    Business as BusinessIcon,
    DarkMode as DarkModeIcon,
    LightMode as LightModeIcon,
    Palette as PaletteIcon,
    GroupAdd as GroupAddIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '../store/store';
import { fetchShopDetails, updateShopSettings } from '../store/slices/shopSlice';
import { updateProfile } from '../store/slices/authSlice';
import { toggleTheme } from '../store/slices/themeSlice';
import axios from 'axios';

const Settings: React.FC = () => {
    const theme = useTheme();
    const dispatch = useAppDispatch();
    const { user, token } = useSelector((state: RootState) => state.auth);
    const { currentShop, loading: shopLoading } = useSelector((state: RootState) => state.shop);
    const { mode } = useSelector((state: RootState) => state.theme);

    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: 'success' as 'success' | 'error', text: '' });

    // Profile State
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        email: user?.email || ''
    });

    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                phone: user.phone || '',
                email: user.email || ''
            });
        }
    }, [user]);

    // Password State
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [shopData, setShopData] = useState({
        name: '',
        administratorName: '',
        address: { city: '', country: '' },
        contact: { phone: '', email: '' },
        settings: { lowStockThreshold: 50 }
    });

    // Staff Management State
    const [staffList, setStaffList] = useState<any[]>([]);
    const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});
    const [newStaffData, setNewStaffData] = useState({
        name: '',
        email: '',
        phone: '',
        password: 'password123' // Default
    });

    useEffect(() => {
        const fetchCurrentShop = async () => {
            if (user?.shopId) {
                dispatch(fetchShopDetails(user.shopId));
            } else if (user?.role === 'grand_admin') {
                // Fallback for grand_admin: Fetch first available shop if no shopId associated
                try {
                    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
                    const token = localStorage.getItem('token');
                    const response = await axios.get(`${API_URL}/shops`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (response.data.success && response.data.data.length > 0) {
                        dispatch(fetchShopDetails(response.data.data[0]._id));
                    }
                } catch (err) {
                    console.error('Error fetching shops for fallback:', err);
                }
            }
        };
        fetchCurrentShop();
    }, [user, dispatch]);

    useEffect(() => {
        if (currentShop) {
            setShopData({
                name: currentShop.name || '',
                address: {
                    city: currentShop.address?.city || '',
                    country: currentShop.address?.country || ''
                },
                contact: {
                    phone: currentShop.contact?.phone || '',
                    email: currentShop.contact?.email || ''
                },
                administratorName: currentShop.administratorName || '',
                settings: currentShop.settings || { lowStockThreshold: 50 }
            });
        }
    }, [currentShop]);

    const fetchStaff = async () => {
        if (user?.role !== 'grand_admin') return;
        try {
            const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
            const res = await axios.get(`${API_URL}/auth/staff`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStaffList(res.data.data);
        } catch (err) {
            console.error('Failed to fetch staff:', err);
        }
    };

    useEffect(() => {
        if (user?.role === 'grand_admin') {
            fetchStaff();
        }
    }, [user]);

    const handleCreateStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newStaffData.email.endsWith('@staff.tilestock.app')) {
            setMessage({ type: 'error', text: 'Email must use @staff.tilestock.app domain' });
            return;
        }
        setLoading(true);
        try {
            const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
            const targetShopId = (user?.shopId || (user?.role === 'grand_admin' ? currentShop?._id : null)) as string;

            if (!targetShopId) {
                setMessage({ type: 'error', text: 'Cannot create staff: No shop associated with your account.' });
                setLoading(false);
                return;
            }

            await axios.post(`${API_URL}/auth/register`, {
                ...newStaffData,
                role: 'staff',
                shopId: targetShopId
            });
            setMessage({ type: 'success', text: 'Staff member created successfully' });
            setNewStaffData({ name: '', email: '', phone: '', password: 'password123' });
            fetchStaff();
        } catch (err: any) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Creation failed' });
        } finally {
            setLoading(false);
        }
    };

    const handleApprovePassword = async (staffId: string) => {
        setLoading(true);
        try {
            const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
            await axios.post(`${API_URL}/auth/staff/approve/${staffId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage({ type: 'success', text: 'Password change approved' });
            fetchStaff();
        } catch (err: any) {
            setMessage({ type: 'error', text: 'Approval failed' });
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await dispatch(updateProfile(profileData)).unwrap();
            setMessage({ type: 'success', text: 'Profile updated successfully' });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err: any) {
            setMessage({ type: 'error', text: err || 'Update failed' });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }
        setLoading(true);
        try {
            // Fix: Use consistent API_URL logic
            const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
            await axios.put(`${API_URL}/auth/password`, {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage({ type: 'success', text: 'Password changed successfully' });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err: any) {
            console.error('Password update error:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Update failed';
            setMessage({ type: 'error', text: errorMessage });
        } finally {
            setLoading(false);
        }
    };

    const handleShopUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        // Grand admins can update even if their own shopId isn't set (manages default shop)
        const targetShopId = (user?.shopId || (user?.role === 'grand_admin' ? currentShop?._id : null)) as string;

        if (!targetShopId) {
            setMessage({ type: 'error', text: 'No shop associated with your account. Cannot update settings.' });
            return;
        }
        setLoading(true);
        try {
            await dispatch(updateShopSettings({ shopId: targetShopId, settings: shopData }));
            setMessage({ type: 'success', text: 'Settings updated successfully' });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err: any) {
            setMessage({ type: 'error', text: 'Failed to update settings' });
        } finally {
            setLoading(false);
        }
    };

    const renderSection = () => {
        switch (tabValue) {
            case 0: // Personal Information
                return (
                    <form onSubmit={handleProfileUpdate}>
                        <Grid container spacing={4}>
                            <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
                                <Avatar
                                    sx={{
                                        width: 120,
                                        height: 120,
                                        mx: 'auto',
                                        mb: 2,
                                        fontSize: '3rem',
                                        background: 'primary.main',
                                        boxShadow: 'none'
                                    }}
                                >
                                    {user?.name?.charAt(0).toUpperCase()}
                                </Avatar>
                                <Typography variant="h6" fontWeight="bold">{user?.name}</Typography>
                                <Typography variant="body2" color="text.secondary">{user?.role?.replace('_', ' ').toUpperCase()}</Typography>
                            </Grid>
                            <Grid item xs={12} md={8}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                    <TextField
                                        fullWidth
                                        label="Full Name"
                                        value={profileData.name}
                                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                        variant="outlined"
                                    />
                                    <TextField
                                        fullWidth
                                        label="Email Address"
                                        value={profileData.email}
                                        disabled
                                        variant="outlined"
                                    />
                                    <TextField
                                        fullWidth
                                        label="Phone Number"
                                        value={profileData.phone}
                                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                        variant="outlined"
                                    />
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        disabled={loading}
                                        sx={{ mt: 1, py: 1.5, borderRadius: 1, fontWeight: 600 }}
                                    >
                                        {loading ? <CircularProgress size={24} /> : 'Save Profile Changes'}
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </form>
                );

            case 1: // System Config
                return (
                    <form onSubmit={handleShopUpdate}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <Box>
                                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <InventoryIcon color="primary" /> Inventory Behavior
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                                    Configure how the system identifies and alerts you about low stock.
                                </Typography>

                                <Card variant="outlined" sx={{ borderRadius: 1, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                                    <CardContent sx={{ p: 4 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                            <Typography variant="subtitle1" fontWeight="600">Low Stock Alert Threshold</Typography>
                                            <Typography variant="h6" color="primary" fontWeight="bold">{shopData.settings.lowStockThreshold} Pcs</Typography>
                                        </Box>
                                        <Slider
                                            value={shopData.settings.lowStockThreshold}
                                            onChange={(_, value) => setShopData({
                                                ...shopData,
                                                settings: { ...shopData.settings, lowStockThreshold: value as number }
                                            })}
                                            min={10}
                                            max={200}
                                            step={5}
                                            marks={[
                                                { value: 10, label: '10' },
                                                { value: 50, label: '50' },
                                                { value: 100, label: '100' },
                                                { value: 200, label: '200' },
                                            ]}
                                            valueLabelDisplay="auto"
                                        />
                                        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                                            Products with a quantity lower than this value will appear in the "Low Stock" list on your dashboard and trigger system alerts.
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Box>

                            <Box>
                                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <BusinessIcon color="primary" /> Shop Profile
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                    These details appear on your sales invoices and reports.
                                </Typography>

                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            label="Shop Name"
                                            value={shopData.name}
                                            onChange={(e) => setShopData({ ...shopData, name: e.target.value })}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            label="Administrator Name"
                                            value={shopData.administratorName}
                                            onChange={(e) => setShopData({ ...shopData, administratorName: e.target.value })}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            label="Contact Email"
                                            value={shopData.contact.email}
                                            onChange={(e) => setShopData({ ...shopData, contact: { ...shopData.contact, email: e.target.value } })}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            label="Contact Phone"
                                            value={shopData.contact.phone}
                                            onChange={(e) => setShopData({ ...shopData, contact: { ...shopData.contact, phone: e.target.value } })}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            label="City"
                                            value={shopData.address.city}
                                            onChange={(e) => setShopData({ ...shopData, address: { ...shopData.address, city: e.target.value } })}
                                        />
                                    </Grid>
                                </Grid>
                            </Box>

                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                disabled={loading}
                                sx={{ py: 1.5, borderRadius: 1, fontWeight: 700 }}
                            >
                                {loading ? <CircularProgress size={24} /> : 'Save System Settings'}
                            </Button>
                        </Box>
                    </form>
                );

            case 2: // Security
                return (
                    <form onSubmit={handlePasswordUpdate}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 500 }}>
                            <Box sx={{ mb: 1 }}>
                                <Typography variant="h6" fontWeight="bold" gutterBottom>Change Password</Typography>
                                <Typography variant="body2" color="text.secondary">Ensure your account is using a long, random password to stay secure.</Typography>
                            </Box>

                            <TextField
                                fullWidth
                                type="password"
                                label="Current Password"
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            />
                            <TextField
                                fullWidth
                                type="password"
                                label="New Password"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            />
                            <TextField
                                fullWidth
                                type="password"
                                label="Confirm New Password"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            />

                            <Button
                                type="submit"
                                variant="contained"
                                color="secondary"
                                disabled={loading}
                                sx={{ py: 1.5, mt: 1, borderRadius: 1, fontWeight: 600 }}
                                startIcon={<LockIcon />}
                            >
                                {loading ? <CircularProgress size={24} /> : 'Update Password'}
                            </Button>
                        </Box>
                    </form>
                );

            case 3: // Staff Management (Grand Admin Only)
                if (user?.role !== 'grand_admin') return null;
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                        <Box>
                            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <GroupAddIcon color="primary" /> Add New Staff
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                Staff emails are restricted to the <b>@staff.tilestock.app</b> domain.
                            </Typography>
                            <Paper variant="outlined" sx={{ p: 4, borderRadius: 1, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                                <form onSubmit={handleCreateStaff}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                fullWidth
                                                label="Staff Name"
                                                required
                                                value={newStaffData.name}
                                                onChange={(e) => setNewStaffData({ ...newStaffData, name: e.target.value })}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                fullWidth
                                                label="Staff Email (@staff.tilestock.app)"
                                                required
                                                placeholder="username@staff.tilestock.app"
                                                value={newStaffData.email}
                                                onChange={(e) => setNewStaffData({ ...newStaffData, email: e.target.value })}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                fullWidth
                                                label="Phone / Tel"
                                                value={newStaffData.phone}
                                                onChange={(e) => setNewStaffData({ ...newStaffData, phone: e.target.value })}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                fullWidth
                                                label="Initial Password"
                                                defaultValue="password123"
                                                disabled
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Button type="submit" variant="contained" disabled={loading} sx={{ py: 1.5, px: 6, borderRadius: 1, fontWeight: 700 }}>
                                                {loading ? <CircularProgress size={24} /> : 'Register Staff Member'}
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </form>
                            </Paper>
                        </Box>

                        <Box>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>Staff Directory & Approvals</Typography>
                            <List sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {staffList.map((staff) => (
                                    <Paper key={staff._id} variant="outlined" sx={{ p: 3, borderRadius: 1 }}>
                                        <Grid container alignItems="center" spacing={2}>
                                            <Grid item xs={12} md={4}>
                                                <Typography variant="subtitle1" fontWeight={700}>{staff.name}</Typography>
                                                <Typography variant="body2" color="text.secondary">{staff.email}</Typography>
                                                <Typography variant="caption" color="primary">{staff.phone || 'No phone set'}</Typography>
                                            </Grid>
                                            <Grid item xs={12} md={3}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography variant="body2" fontWeight={600}>
                                                        Pass: {showPasswords[staff._id] ? (staff.visiblePassword || '******') : '******'}
                                                    </Typography>
                                                    <IconButton size="small" onClick={() => setShowPasswords({ ...showPasswords, [staff._id]: !showPasswords[staff._id] })}>
                                                        {showPasswords[staff._id] ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                                                    </IconButton>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={12} md={5} sx={{ textAlign: 'right' }}>
                                                {staff.passwordStatus === 'pending_approval' ? (
                                                    <Button
                                                        variant="contained"
                                                        color="warning"
                                                        size="small"
                                                        startIcon={<SecurityIcon />}
                                                        onClick={() => handleApprovePassword(staff._id)}
                                                        sx={{ borderRadius: 1, fontWeight: 700 }}
                                                    >
                                                        Approve New Password
                                                    </Button>
                                                ) : (
                                                    <Chip label="Account Active" size="small" color="success" variant="outlined" sx={{ borderRadius: 1 }} />
                                                )}
                                            </Grid>
                                        </Grid>
                                    </Paper>
                                ))}
                            </List>
                        </Box>
                    </Box>
                );

            case 4: // Appearance
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 600 }}>
                        <Box sx={{ mb: 1 }}>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>Appearance</Typography>
                            <Typography variant="body2" color="text.secondary">Customize the look and feel of the application.</Typography>
                        </Box>

                        <Card variant="outlined" sx={{ borderRadius: 1 }}>
                            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, borderRadius: 1 }}>
                                        {mode === 'dark' ? <DarkModeIcon /> : <LightModeIcon />}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight="600">Dark Mode</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Switch
                                    checked={mode === 'dark'}
                                    onChange={() => dispatch(toggleTheme())}
                                />
                            </CardContent>
                        </Card>
                    </Box>
                );

            default:
                return null;
        }
    };

    return (
        <Box sx={{ py: 4, maxWidth: 1200, mx: 'auto' }}>
            <Box sx={{ mb: 5 }}>
                <Typography variant="h4" fontWeight="800" sx={{ mb: 1 }}>Settings</Typography>
                <Typography variant="body1" color="text.secondary">Manage your system behavior, shop profile, and account security.</Typography>
            </Box>

            {message.text && (
                <Alert
                    severity={message.type}
                    onClose={() => setMessage({ ...message, text: '' })}
                    sx={{ mb: 4, borderRadius: 3, border: (theme) => `1px solid ${alpha(theme.palette[message.type].main, 0.3)}` }}
                >
                    {message.text}
                </Alert>
            )}

            <Grid container spacing={4}>
                <Grid item xs={12} md={3}>
                    <Paper sx={{ borderRadius: 1, overflow: 'hidden', border: (theme) => `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
                        <List component="nav" sx={{ p: 1 }}>
                            <ListItemButton
                                selected={tabValue === 0}
                                onClick={() => setTabValue(0)}
                                sx={{ borderRadius: 1, mb: 1, py: 1.5 }}
                            >
                                <ListItemIcon sx={{ minWidth: 40 }}><PersonIcon color={tabValue === 0 ? 'primary' : 'inherit'} /></ListItemIcon>
                                <ListItemText primary="Personal Information" primaryTypographyProps={{ fontWeight: tabValue === 0 ? 700 : 500 }} />
                                <ChevronRightIcon fontSize="small" sx={{ opacity: 0.3 }} />
                            </ListItemButton>
                            {user?.role === 'grand_admin' && (
                                <ListItemButton
                                    selected={tabValue === 1}
                                    onClick={() => setTabValue(1)}
                                    sx={{ borderRadius: 1, mb: 1, py: 1.5 }}
                                >
                                    <ListItemIcon sx={{ minWidth: 40 }}><StoreIcon color={tabValue === 1 ? 'primary' : 'inherit'} /></ListItemIcon>
                                    <ListItemText primary="System Configuration" primaryTypographyProps={{ fontWeight: tabValue === 1 ? 700 : 500 }} />
                                    <ChevronRightIcon fontSize="small" sx={{ opacity: 0.3 }} />
                                </ListItemButton>
                            )}
                            <ListItemButton
                                selected={tabValue === 2}
                                onClick={() => setTabValue(2)}
                                sx={{ borderRadius: 1, mb: 1, py: 1.5 }}
                            >
                                <ListItemIcon sx={{ minWidth: 40 }}><SecurityIcon color={tabValue === 2 ? 'primary' : 'inherit'} /></ListItemIcon>
                                <ListItemText primary="Account Security" primaryTypographyProps={{ fontWeight: tabValue === 2 ? 700 : 500 }} />
                                {user?.passwordStatus === 'pending_approval' && (
                                    <Chip label="Awaiting Approval" size="small" color="warning" sx={{ ml: 1, height: 20, fontSize: '0.65rem' }} />
                                )}
                                <ChevronRightIcon fontSize="small" sx={{ opacity: 0.3 }} />
                            </ListItemButton>
                            {user?.role === 'grand_admin' && (
                                <ListItemButton
                                    selected={tabValue === 3}
                                    onClick={() => setTabValue(3)}
                                    sx={{ borderRadius: 1, mb: 1, py: 1.5 }}
                                >
                                    <ListItemIcon sx={{ minWidth: 40 }}><GroupAddIcon color={tabValue === 3 ? 'primary' : 'inherit'} /></ListItemIcon>
                                    <ListItemText primary="Staff Management" primaryTypographyProps={{ fontWeight: tabValue === 3 ? 700 : 500 }} />
                                    <ChevronRightIcon fontSize="small" sx={{ opacity: 0.3 }} />
                                </ListItemButton>
                            )}
                            <ListItemButton
                                selected={tabValue === 4}
                                onClick={() => setTabValue(4)}
                                sx={{ borderRadius: 1, py: 1.5 }}
                            >
                                <ListItemIcon sx={{ minWidth: 40 }}><PaletteIcon color={tabValue === 4 ? 'primary' : 'inherit'} /></ListItemIcon>
                                <ListItemText primary="Appearance" primaryTypographyProps={{ fontWeight: tabValue === 4 ? 700 : 500 }} />
                                <ChevronRightIcon fontSize="small" sx={{ opacity: 0.3 }} />
                            </ListItemButton>
                        </List>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={9}>
                    <Paper sx={{ p: { xs: 3, md: 5 }, borderRadius: 1, minHeight: 500, border: (theme) => `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
                        {renderSection()}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

// Helper component for ListItemButton since it's missing in some MUI versions as direct import
const ListItemButton = (props: any) => {
    const theme = useTheme();
    return (
        <ListItem
            disablePadding
            sx={{
                '& .MuiButtonBase-root': {
                    width: '100%',
                    textAlign: 'left',
                    ...props.sx
                }
            }}
        >
            <Button
                color="inherit"
                onClick={props.onClick}
                sx={{
                    justifyContent: 'flex-start',
                    bgcolor: props.selected ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                    color: props.selected ? 'primary.main' : 'inherit',
                    '&:hover': {
                        bgcolor: props.selected ? alpha(theme.palette.primary.main, 0.15) : 'action.hover',
                    },
                    px: 2,
                    textTransform: 'none'
                }}
            >
                {props.children}
            </Button>
        </ListItem>
    );
};

export default Settings;
