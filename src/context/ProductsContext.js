import {createContext, useContext} from "react";

const ProductsContext = createContext();

export const useProductsContext = () => {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error('useProductsContext must be used within a ProductsProvider');
  }
  return context;
};

export default ProductsContext;