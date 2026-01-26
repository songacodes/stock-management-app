import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  Storage as StorageIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  RemoveCircle as RemoveIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  InputBase,
  Badge,
  alpha,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '../store/store';
import { logout } from '../store/slices/authSlice';
import { generateNotifications } from '../store/slices/notificationSlice';
import NotificationMenu from './NotificationMenu';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { tiles } = useSelector((state: RootState) => state.tiles);
  const { unreadCount } = useSelector((state: RootState) => state.notifications);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg')); // Switch to hamburger on smaller than large screens

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Generate notifications when tiles change
  useEffect(() => {
    if (tiles.length > 0) {
      dispatch(generateNotifications(tiles));
    }
  }, [tiles, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    setAnchorEl(null);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: DashboardIcon, roles: ['grand_admin', 'shop_admin'] },
    { label: 'All Products', path: '/tiles', icon: InventoryIcon, roles: ['grand_admin', 'shop_admin'] }, // Renamed from "Tiles" for clarity
    { label: 'Stock', path: '/stock', icon: StorageIcon, roles: ['grand_admin', 'shop_admin', 'staff'] },
    { label: 'Add Stock', path: '/stock/add', icon: InventoryIcon, roles: ['grand_admin', 'shop_admin', 'staff'] }, // Added direct link
    { label: 'Remove Stock', path: '/stock/remove', icon: RemoveIcon, roles: ['grand_admin', 'shop_admin', 'staff'] },
    { label: 'Reports', path: '/reports', icon: DescriptionIcon, roles: ['grand_admin', 'shop_admin'] },
  ];

  const filteredNavItems = navItems.filter(item =>
    !user || item.roles.includes(user.role || 'staff')
  );

  const isActive = (path: string) => location.pathname === path;

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.95) 0%, rgba(124, 58, 237, 0.95) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        borderRadius: 0,
      }}
    >
      <Toolbar sx={{ px: { xs: 2, md: 4 }, py: 1.5 }}>
        {/* Hamburger Menu Icon */}
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ mr: 2, display: { lg: 'none' }, color: '#ffffff' }}
        >
          <MenuIcon />
        </IconButton>

        {/* Logo/Brand */}
        <Box
          onClick={() => navigate('/dashboard')}
          sx={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            mr: { xs: 2, md: 4 },
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'scale(1.05)',
            },
          }}
        >
          {/* ... Logo content same as before ... */}
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.8) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 1.5,
              boxShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.2)',
            }}
          >
            <InventoryIcon sx={{ color: '#2563eb', fontSize: 24 }} />
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.9) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              display: { xs: 'none', sm: 'block' },
            }}
          >
            TileStock Pro
          </Typography>
        </Box>

        {/* Desktop Navigation Items */}
        <Box sx={{ flexGrow: 1, display: { xs: 'none', lg: 'flex' }, gap: 0.5, ml: 2 }}>
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Box
                key={item.path}
                onClick={() => navigate(item.path)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.3s ease',
                  whiteSpace: 'nowrap', // Prevent text wrapping
                  background: active
                    ? 'rgba(255, 255, 255, 0.2)'
                    : 'transparent',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.15)',
                    transform: 'translateY(-2px)',
                  },
                  '&::before': active
                    ? {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '60%',
                      height: 3,
                      background: 'linear-gradient(90deg, transparent, #ffffff, transparent)',
                      borderRadius: '0 0 2px 2px',
                    }
                    : {},
                }}
              >
                <Icon
                  sx={{
                    fontSize: 20,
                    mr: 1,
                    color: active ? '#ffffff' : 'rgba(255, 255, 255, 0.8)',
                  }}
                />
                <Typography
                  sx={{
                    color: active ? '#ffffff' : 'rgba(255, 255, 255, 0.9)',
                    fontWeight: active ? 600 : 400,
                    fontSize: '0.9375rem',
                  }}
                >
                  {item.label}
                </Typography>
              </Box>
            );
          })}
        </Box>

        {/* Search Bar - Only visible on Tiles, Stock, and Remove pages */}
        {['/tiles', '/stock'].some(path => location.pathname.startsWith(path)) && (
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              position: 'relative',
              borderRadius: 3,
              backgroundColor: alpha('#ffffff', 0.15),
              backdropFilter: 'blur(10px)',
              '&:hover': {
                backgroundColor: alpha('#ffffff', 0.2),
              },
              marginRight: 2,
              width: searchOpen ? 300 : 200,
              transition: 'width 0.3s ease',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <Box
              sx={{
                padding: '8px 12px',
                height: '100%',
                position: 'absolute',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
            </Box>
            <InputBase
              placeholder="Search tiles..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                // Optional: Search as you type
                if (e.target.value.length > 2) {
                  navigate(`/tiles?q=${encodeURIComponent(e.target.value)}`);
                }
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  navigate(`/tiles?q=${encodeURIComponent(searchQuery)}`);
                }
              }}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setSearchOpen(false)}
              sx={{
                color: '#ffffff',
                width: '100%',
                pl: 5,
                pr: 2,
                py: 1,
                '& .MuiInputBase-input': {
                  color: '#ffffff',
                  '&::placeholder': {
                    color: 'rgba(255, 255, 255, 0.6)',
                    opacity: 1,
                  },
                },
              }}
            />
          </Box>
        )}

        {/* Notifications */}
        <IconButton
          onClick={(e) => setNotificationAnchorEl(e.currentTarget)}
          sx={{
            color: '#ffffff',
            mr: 1,
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <NotificationMenu
          anchorEl={notificationAnchorEl}
          open={Boolean(notificationAnchorEl)}
          onClose={() => setNotificationAnchorEl(null)}
        />

        {/* User Menu */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            ml: 2,
            pl: 2,
            borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Typography
              variant="body2"
              sx={{
                color: '#ffffff',
                fontWeight: 500,
                textAlign: 'right',
              }}
            >
              {user?.name || 'Admin'}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '0.75rem',
              }}
            >
              Administrator
            </Typography>
          </Box>
          <IconButton
            onClick={handleMenuOpen}
            sx={{
              p: 0,
              border: '2px solid rgba(255, 255, 255, 0.3)',
              '&:hover': {
                border: '2px solid rgba(255, 255, 255, 0.5)',
                transform: 'scale(1.05)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            <Avatar
              sx={{
                width: 40,
                height: 40,
                background: 'linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.8) 100%)',
                color: '#2563eb',
                fontWeight: 600,
              }}
            >
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </Avatar>
          </IconButton>
        </Box>

        {/* User Dropdown Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              mt: 1.5,
              minWidth: 200,
              borderRadius: 2,
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={handleMenuClose}>
            <PersonIcon sx={{ mr: 2, fontSize: 20 }} />
            Profile
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <SettingsIcon sx={{ mr: 2, fontSize: 20 }} />
            Settings
          </MenuItem>
          <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
            <LogoutIcon sx={{ mr: 2, fontSize: 20 }} />
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
        }}
      >
        <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center', p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 1.5,
              }}
            >
              <InventoryIcon sx={{ color: '#fff', fontSize: 24 }} />
            </Box>
            <Typography variant="h6" sx={{ color: '#1e293b', fontWeight: 700 }}>
              TileStock Pro
            </Typography>
          </Box>
          <List>
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <ListItem key={item.path} disablePadding>
                  <ListItemButton
                    onClick={() => {
                      navigate(item.path);
                      handleDrawerToggle();
                    }}
                    selected={active}
                    sx={{
                      borderRadius: 2,
                      mx: 1,
                      mb: 0.5,
                      '&.Mui-selected': {
                        backgroundColor: alpha('#2563eb', 0.1),
                        '&:hover': {
                          backgroundColor: alpha('#2563eb', 0.2),
                        }
                      }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40, color: active ? '#2563eb' : 'inherit' }}>
                      <Icon />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontWeight: active ? 600 : 400,
                        color: active ? '#2563eb' : 'inherit'
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
};

export default Navbar;
