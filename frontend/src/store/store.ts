import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import authReducer from './slices/authSlice';
import tileReducer from './slices/tileSlice';
import stockReducer from './slices/stockSlice';
import salesReducer from './slices/salesSlice';
import reportsReducer from './slices/reportsSlice';
import shopReducer from './slices/shopSlice';
import notificationReducer from './slices/notificationSlice';
import themeReducer from './slices/themeSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tiles: tileReducer,
    stock: stockReducer,
    sales: salesReducer,
    reports: reportsReducer,
    shop: shopReducer,
    notifications: notificationReducer,
    theme: themeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks for use throughout the app
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

