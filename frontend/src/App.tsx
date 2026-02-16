import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Container } from '@mui/material';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TilesList from './pages/TilesList';
import TileCreate from './pages/TileCreate';
import TileDetail from './pages/TileDetail';
import StockManagement from './pages/StockManagement';
import RemoveStock from './pages/RemoveStock';
import AddStock from './pages/AddStock';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import LowStockAlert from './components/LowStockAlert';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { io } from 'socket.io-client';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { getTheme } from './theme/theme';
import { useAppSelector } from './store/store';
import { updateTileStock } from './store/slices/tileSlice';
// ... other imports

// Initialize socket outside component to prevent multiple connections
const socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000');

function App() {
  const dispatch = useDispatch();

  const { mode } = useAppSelector((state) => state.theme);
  const theme = React.useMemo(() => getTheme(mode), [mode]);

  useEffect(() => {
    socket.on('stock_updated', (data) => {
      console.log('⚡ Stock Update Received:', data);
      dispatch(updateTileStock(data));
    });

    return () => {
      socket.off('stock_updated');
    };
  }, [dispatch]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          {/* Register route removed */}
          <Route
            path="/*"
            element={
              <>
                <LowStockAlert />
                <Navbar />
                <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
                  <Routes>
                    <Route path="/" element={<PrivateRoute><Navigate to="/dashboard" replace /></PrivateRoute>} />
                    <Route path="/dashboard" element={
                      <PrivateRoute roles={['grand_admin', 'shop_admin']}>
                        <Dashboard />
                      </PrivateRoute>
                    } />
                    <Route path="/tiles" element={
                      <PrivateRoute roles={['grand_admin', 'shop_admin']}>
                        <TilesList />
                      </PrivateRoute>
                    } />
                    <Route path="/tiles/create" element={
                      <PrivateRoute roles={['grand_admin', 'shop_admin']}>
                        <TileCreate />
                      </PrivateRoute>
                    } />
                    <Route path="/tiles/edit/:id" element={
                      <PrivateRoute roles={['grand_admin', 'shop_admin']}>
                        <TileCreate />
                      </PrivateRoute>
                    } />
                    <Route path="/tiles/:id" element={
                      <PrivateRoute roles={['grand_admin', 'shop_admin']}>
                        <TileDetail />
                      </PrivateRoute>
                    } />
                    <Route path="/stock" element={
                      <PrivateRoute>
                        <StockManagement />
                      </PrivateRoute>
                    } />
                    <Route path="/stock/add" element={
                      <PrivateRoute>
                        <AddStock />
                      </PrivateRoute>
                    } />
                    <Route path="/stock/remove" element={
                      <PrivateRoute>
                        <RemoveStock />
                      </PrivateRoute>
                    } />
                    <Route path="/reports" element={
                      <PrivateRoute roles={['grand_admin', 'shop_admin']}>
                        <Reports />
                      </PrivateRoute>
                    } />
                    <Route path="/settings" element={
                      <PrivateRoute>
                        <Settings />
                      </PrivateRoute>
                    } />
                  </Routes>
                </Container>
              </>
            }
          />
        </Routes>
      </div>
    </ThemeProvider>
  );
}

export default App;

