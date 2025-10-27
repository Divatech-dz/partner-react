import { createSlice } from '@reduxjs/toolkit';

// Load initial state from localStorage
const loadCartState = () => {
  try {
    const serializedState = localStorage.getItem('pcBuilderCart');
    if (serializedState === null) {
      return {
        items: [],
        pcBuilds: [],
        total: 0,
      };
    }
    return JSON.parse(serializedState);
  } catch (err) {
    return {
      items: [],
      pcBuilds: [],
      total: 0,
    };
  }
};

// Save state to localStorage
const saveCartState = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('pcBuilderCart', serializedState);
  } catch (err) {
    console.error('Could not save cart state:', err);
  }
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: loadCartState(),
  reducers: {
    // Individual products
    addToCart: (state, action) => {
      const { name, reference, prixVente, qty } = action.payload;
      const existingItem = state.items.find(item => item.reference === reference);
      
      if (existingItem) {
        existingItem.qty += qty;
      } else {
        state.items.push({ name, reference, prixVente, qty, type: 'product' });
      }
      
      state.total = calculateTotal(state);
      saveCartState(state);
    },
    removeFromCart: (state, action) => {
      const reference = action.payload;
      state.items = state.items.filter(item => item.reference !== reference);
      state.total = calculateTotal(state);
      saveCartState(state);
    },
    updateQuantity: (state, action) => {
      const { reference, qty } = action.payload;
      const item = state.items.find(item => item.reference === reference);
      
      if (item) {
        item.qty = qty;
        state.total = calculateTotal(state);
        saveCartState(state);
      }
    },
addPcBuildToCart: (state, action) => {
  const { components, quantities, totalPrice, buildName, buildNote, buildType, quantity } = action.payload;
  
  // Handle different component structures
  let processedComponents = [];
  
  if (Array.isArray(components)) {
    // If components is already an array (from ProductsList.jsx)
    processedComponents = components.map(component => ({
      ...component,
      type: component.type || component.category,
      name: component.name,
      reference: component.reference,
      // Extract price from any possible field
      price: component.unitprice || component.prixVente || component.price || component.prix || 0,
      prixVente: component.unitprice || component.prixVente || component.price || component.prix || 0,
      quantity: buildType === 'preconfigure' ? 1 : (quantities?.[component.type || component.category] || 1)
    }));
  } else {
    // If components is an object (from ProductsList1.jsx)
    processedComponents = Object.entries(components)
      .filter(([_, component]) => component !== null && component !== undefined)
      .map(([type, component]) => ({
        type,
        name: component.name,
        reference: component.reference,
        // Extract price from any possible field with better fallbacks
        price: component.unitprice || component.prixVente || component.price || component.prix || 0,
        prixVente: component.unitprice || component.prixVente || component.price || component.prix || 0,
        quantity: buildType === 'preconfigure' ? 1 : (quantities?.[type] || 1)
      }));
  }
  
  const pcBuild = {
    id: Date.now().toString(),
    name: buildName || `PC ${state.pcBuilds.length + 1}`,
    buildName: buildName || `PC ${state.pcBuilds.length + 1}`,
    components: processedComponents,
    totalPrice: totalPrice || processedComponents.reduce((total, comp) => total + (comp.price * comp.quantity), 0),
    buildNote: buildNote || '',
    buildType: buildType || 'custom',
    quantity: buildType === 'preconfigure' ? (quantity || 1) : 1,
    type: 'pc-build',
    createdAt: new Date().toISOString()
  };
  
  state.pcBuilds.push(pcBuild);
  state.total = calculateTotal(state);
  saveCartState(state);
},
    removePcBuildFromCart: (state, action) => {
      const buildId = action.payload;
      state.pcBuilds = state.pcBuilds.filter(build => build.id !== buildId);
      state.total = calculateTotal(state);
      saveCartState(state);
    },
    
    updatePcBuildQuantity: (state, action) => {
      const { buildId, quantity } = action.payload;
      const pcBuild = state.pcBuilds.find(build => build.id === buildId);
      if (pcBuild && pcBuild.buildType === 'preconfigure') {
        pcBuild.quantity = quantity;
        state.total = calculateTotal(state);
        saveCartState(state);
      }
    },
    
  // Add this to your cartSlice.js
updatePcBuildComponentQuantity: (state, action) => {
  const { buildId, componentType, quantity } = action.payload;
  const pcBuild = state.pcBuilds.find(build => build.id === buildId);
  if (pcBuild && pcBuild.buildType !== 'preconfigure') {
    // Update the quantity for this component type
    if (!pcBuild.quantities) {
      pcBuild.quantities = {};
    }
    pcBuild.quantities[componentType] = quantity;
    
    // Recalculate total price for the PC build
    let newTotal = 0;
    Object.entries(pcBuild.components).forEach(([type, component]) => {
      if (component) {
        const compQty = pcBuild.quantities?.[type] || 1;
        const price = component.unitprice || component.prixVente || component.price || 0;
        newTotal += price * compQty;
      }
    });
    pcBuild.totalPrice = newTotal;
    
    // Recalculate cart total
    state.total = state.items.reduce((sum, item) => sum + (item.prixVente * item.qty), 0) +
                 state.pcBuilds.reduce((sum, build) => sum + build.totalPrice, 0);
  }
},
    
    clearCart: (state) => {
      state.items = [];
      state.pcBuilds = [];
      state.total = 0;
      saveCartState(state);
    },
    
    // Load cart from storage
    loadCartFromStorage: (state) => {
      const storedState = loadCartState();
      state.items = storedState.items;
      state.pcBuilds = storedState.pcBuilds;
      state.total = storedState.total;
    },
  },
});

// Helper function to calculate total
// Helper function to calculate total
const calculateTotal = (state) => {
  const itemsTotal = state.items.reduce((total, item) => total + (item.prixVente * item.qty), 0);
  const pcBuildsTotal = state.pcBuilds.reduce((total, build) => {
    if (build.buildType === 'preconfigure') {
      return total + (build.totalPrice * (build.quantity || 1));
    } else {
      // For custom builds, calculate from components with better price extraction
      return total + build.components.reduce((compTotal, component) => {
        const price = component.prixVente || component.price || component.unitprice || component.prix || 0;
        return compTotal + (price * (component.quantity || 1));
      }, 0);
    }
  }, 0);
  return itemsTotal + pcBuildsTotal;
};

export const { 
  addToCart, 
  removeFromCart, 
  updateQuantity, 
  addPcBuildToCart,
  removePcBuildFromCart,
  updatePcBuildQuantity,
  updatePcBuildComponentQuantity,
  clearCart,
  loadCartFromStorage
} = cartSlice.actions;

export default cartSlice.reducer;