import { createSlice } from '@reduxjs/toolkit';

const pcBuildSlice = createSlice({
  name: 'pcBuild',
  initialState: {
    currentBuild: {
      components: {
        motherboard: null,
        cpu: null,
        ram: null,
        storage: null,
        gpu: null,
        powerSupply: null,
        case: null,
        cooling: null,
        clavier: null,
        ecrant: null
      },
      quantities: {
        motherboard: 1,
        cpu: 1,
        ram: 1,
        storage: 1,
        gpu: 1,
        powerSupply: 1,
        case: 1,
        cooling: 1,
        clavier: 1,
        ecrant: 1
      },
    },
    isCartOpen: false,
    expandedPcBuilds: {}, // Track which PC builds are expanded
  },
  reducers: {
    // Current build operations
    addComponent: (state, action) => {
      const { componentType, component } = action.payload;
      state.currentBuild.components[componentType] = component;
    },
    removeComponent: (state, action) => {
      const componentType = action.payload;
      state.currentBuild.components[componentType] = null;
      state.currentBuild.quantities[componentType] = 1;
    },
    updateComponentQuantity: (state, action) => {
      const { componentType, quantity } = action.payload;
      state.currentBuild.quantities[componentType] = Math.max(1, quantity);
    },
    clearCurrentBuild: (state) => {
      state.currentBuild = {
        components: {
          motherboard: null,
          cpu: null,
          ram: null,
          storage: null,
          gpu: null,
          powerSupply: null,
          case: null,
          cooling: null,
          clavier: null,
          ecrant: null
        },
        quantities: {
          motherboard: 1,
          cpu: 1,
          ram: 1,
          storage: 1,
          gpu: 1,
          powerSupply: 1,
          case: 1,
          cooling: 1,
          clavier: 1,
          ecrant: 1
        },
      };
    },
    
    // UI state
    toggleCart: (state) => {
      state.isCartOpen = !state.isCartOpen;
    },
    setCartOpen: (state, action) => {
      state.isCartOpen = action.payload;
    },
    
    // PC Build expansion
    togglePcBuildExpansion: (state, action) => {
      const buildId = action.payload;
      state.expandedPcBuilds[buildId] = !state.expandedPcBuilds[buildId];
    },
    setPcBuildExpansion: (state, action) => {
      const { buildId, expanded } = action.payload;
      state.expandedPcBuilds[buildId] = expanded;
    },
  },
});

export const {
  addComponent,
  removeComponent,
  updateComponentQuantity,
  clearCurrentBuild,
  toggleCart,
  setCartOpen,
  togglePcBuildExpansion,
  setPcBuildExpansion,
} = pcBuildSlice.actions;

export default pcBuildSlice.reducer;