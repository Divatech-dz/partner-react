import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './slices/cartSlice';
import pcBuildReducer from './slices/pcBuildSlice';

// Custom middleware to save cart to localStorage
const cartPersistenceMiddleware = (store) => (next) => (action) => {
  const result = next(action);
  
  // Check if the action is a cart-related action
  if (action.type.startsWith('cart/')) {
    const cartState = store.getState().cart;
    try {
      localStorage.setItem('pcBuilderCart', JSON.stringify(cartState));
    } catch (err) {
      console.error('Could not save cart to localStorage:', err);
    }
  }
  
  return result;
};

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    pcBuild: pcBuildReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(cartPersistenceMiddleware),
});

export default store;