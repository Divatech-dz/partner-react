import {createContext, useContext} from "react";

const DeliveryContext = createContext();

export const useDeliveryContext = () => {
  const context = useContext(DeliveryContext);
  if (!context) {
    throw new Error('useDeliveryContext must be used within a DeliveryProvider');
  }
  return context;
};

export default DeliveryContext;