import {createContext, useContext} from "react";

const ProductsContext = createContext();

export const useProductsContext = () => useContext(ProductsContext);

export default ProductsContext