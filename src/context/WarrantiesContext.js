import {createContext, useContext} from "react";

const WarrantiesContext = createContext();

export const useWarrantiesContext = () => {
  const context = useContext(WarrantiesContext);
  if (!context) {
    throw new Error('useWarrantiesContext must be used within a WarrantiesProvider');
  }
  return context;
};

export default WarrantiesContext;