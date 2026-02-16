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
        borderRadius: 0,
        backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#04070a' : '#fff',
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
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
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'scale(1.02)',
              '& .logo-box': {
                transform: 'rotate(-5deg) scale(1.1)',
                boxShadow: theme.palette.mode === 'dark'
                  ? `0 0 20px ${alpha(theme.palette.primary.main, 0.4)}`
                  : `0 0 20px ${alpha(theme.palette.primary.main, 0.2)}`,
              }
            },
          }}
        >
          <Box
            className="logo-box"
            sx={{
              width: 38,
              height: 38,
              borderRadius: 1,
              background: theme.palette.mode === 'dark'
                ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`
                : theme.palette.primary.main,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2,
              transition: 'all 0.2s ease',
            }}
          >
            <InventoryIcon sx={{ color: theme.palette.mode === 'dark' ? '#fff' : theme.palette.primary.main, fontSize: 26 }} />
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              letterSpacing: '-0.02em',
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(90deg, #fff 0%, #cbd5e1 100%)'
                : 'linear-gradient(90deg, #1e293b 0%, #64748b 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
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
                  px: 2.5,
                  py: 1,
                  borderRadius: 3,
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  whiteSpace: 'nowrap',
                  background: active
                    ? alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.15 : 0.08)
                    : 'transparent',
                  color: active
                    ? theme.palette.primary.main
                    : theme.palette.text.secondary,
                  '&:hover': {
                    background: alpha(theme.palette.primary.main, 0.05),
                    color: theme.palette.primary.main,
                    transform: 'translateY(-1px)',
                  },
                }}
              >
                <Icon
                  sx={{
                    fontSize: 20,
                    mr: 1.2,
                    transition: 'transform 0.3s ease',
                    transform: active ? 'scale(1.1)' : 'scale(1)',
                  }}
                />
                <Typography
                  sx={{
                    fontWeight: active ? 700 : 500,
                    fontSize: '0.9rem',
                    letterSpacing: '0.01em',
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
              borderRadius: 1,
              backgroundColor: theme.palette.mode === 'dark'
                ? '#111827'
                : alpha(theme.palette.common.black, 0.03),
              border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.14)' : theme.palette.divider}`,
              transition: 'all 0.3s ease',
              marginRight: 2,
              width: searchOpen ? 320 : 240,
              '&:hover, &.Mui-focused': {
                backgroundColor: theme.palette.mode === 'dark'
                  ? alpha(theme.palette.common.white, 0.05)
                  : alpha(theme.palette.common.black, 0.05),
                borderColor: alpha(theme.palette.primary.main, 0.3),
              },
            }}
          >
            <Box
              sx={{
                padding: '0 14px',
                height: '100%',
                position: 'absolute',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SearchIcon sx={{ color: theme.palette.text.secondary, fontSize: 20 }} />
            </Box>
            <InputBase
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value.length > 2) {
                  navigate(`/tiles?q=${encodeURIComponent(e.target.value)}`);
                }
              }}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setSearchOpen(false)}
              sx={{
                color: theme.palette.text.primary,
                width: '100%',
                pl: 5,
                pr: 2,
                py: 0.8,
                fontSize: '0.9rem',
                '& .MuiInputBase-input': {
                  '&::placeholder': {
                    color: theme.palette.text.secondary,
                    opacity: 0.8,
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
            color: theme.palette.text.primary,
            mr: 1,
            '&:hover': {
              background: alpha(theme.palette.primary.main, 0.08),
            },
          }}
        >
          <Badge
            badgeContent={unreadCount}
            color="error"
            sx={{
              '& .MuiBadge-badge': {
                fontWeight: 700,
                boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
              }
            }}
          >
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
            borderLeft: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.primary,
                fontWeight: 700,
                textAlign: 'right',
                lineHeight: 1.2,
              }}
            >
              {user?.name || 'Admin'}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.text.secondary,
                fontSize: '0.7rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Administrator
            </Typography>
          </Box>
          <IconButton
            onClick={handleMenuOpen}
            sx={{
              p: 0.5,
              border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              '&:hover': {
                border: `2px solid ${theme.palette.primary.main}`,
                transform: 'scale(1.05)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                background: theme.palette.mode === 'dark'
                  ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`
                  : `linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)`,
                color: '#ffffff',
                fontSize: '0.9rem',
                fontWeight: 700,
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
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
              bgcolor: 'background.paper',
              border: (theme) => `1px solid ${theme.palette.divider}`,
              backgroundImage: 'none',
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={() => { navigate('/settings'); handleMenuClose(); }}>
            <PersonIcon sx={{ mr: 2, fontSize: 20 }} />
            Profile
          </MenuItem>
          <MenuItem onClick={() => { navigate('/settings'); handleMenuClose(); }}>
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
