import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import { alpha, useTheme } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Inventory as InventoryIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { RootState, useAppDispatch } from '../store/store';
import { login, clearError } from '../store/slices/authSlice';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const { loading, error, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(login(formData));
  };


  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        bgcolor: 'background.default',
        color: 'text.primary',
        p: { xs: 2, md: 8, lg: 12 },
        position: 'relative',
        zoom: '0.8',
        '@media (max-width: 600px)': {
          zoom: '1',
        },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 550,
          p: { xs: 4, md: 8 },
          borderRadius: 3, // Softer rounding
          border: `1px solid ${theme.palette.divider}`,
          bgcolor: isDark ? '#111827' : '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          boxShadow: isDark
            ? `0 32px 64px ${alpha('#000', 0.6)}`
            : `0 16px 48px ${alpha(theme.palette.primary.main, 0.08)}`,
        }}
      >
        {/* Header Section */}
        <Box sx={{ textAlign: 'left' }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              borderRadius: 1.5, // Softer rounded look
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 4,
              color: '#ffffff',
              boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
            }}
          >
            <InventoryIcon sx={{ fontSize: 32 }} />
          </Box>
          <Typography
            variant="h4"
            fontWeight={900}
            sx={{ letterSpacing: '-0.05em', mb: 1, fontSize: '2.5rem' }}
          >
            TileStock Pro
          </Typography>
          <Typography variant="body1" color="text.secondary" fontWeight={500} sx={{ opacity: 0.8 }}>
            Professional Inventory & Logistics Management
          </Typography>
        </Box>

        {/* Form Section */}
        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
            {error && (
              <Alert
                severity={error.includes('awaiting approval') ? 'warning' : 'error'}
                variant="outlined"
                sx={{
                  borderRadius: 1.5,
                  fontWeight: 700,
                  border: `1px solid ${alpha(error.includes('awaiting approval') ? theme.palette.warning.main : theme.palette.error.main, 0.3)}`,
                  bgcolor: alpha(error.includes('awaiting approval') ? theme.palette.warning.main : theme.palette.error.main, 0.02),
                }}
              >
                {error}
              </Alert>
            )}

            <TextField
              fullWidth
              id="email"
              label="Login Identity"
              name="email"
              autoComplete="email"
              autoFocus
              required
              value={formData.email}
              onChange={handleChange}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="primary" sx={{ fontSize: 20, opacity: 0.7 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5,
                  bgcolor: alpha(theme.palette.action.hover, 0.05),
                }
              }}
            />

            <TextField
              fullWidth
              name="password"
              label="Access Secret"
              type="password"
              id="password"
              autoComplete="current-password"
              required
              value={formData.password}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="primary" sx={{ fontSize: 20, opacity: 0.7 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5,
                  bgcolor: alpha(theme.palette.action.hover, 0.05),
                }
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                mt: 2,
                py: 2.2,
                borderRadius: 1.5,
                fontWeight: 900,
                fontSize: '1rem',
                textTransform: 'none',
                boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.25)}`,
                '&:hover': {
                  boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.4)}`,
                  transform: 'translateY(-1px)',
                },
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Log In to System'}
            </Button>
          </Box>
        </Box>

        {/* Footer */}
        <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center', gap: 1, opacity: 0.5 }}>
          <SecurityIcon sx={{ fontSize: 16 }} />
          <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1 }}>
            AUTHENTICATED ADMINISTRATIVE CHANNEL
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;
