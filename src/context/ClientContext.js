import {createContext, useContext} from "react";

const ClientContext = createContext();

export const useClientContext = () => {
  const context = useContext(ClientContext);
  if (!context) {
    throw new Error('useClientContext must be used within a ClientProvider');
  }
  return context;
};

export default ClientContext;