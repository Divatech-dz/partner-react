import {createContext, useContext} from "react";

const DeliveryContext = createContext();

export const useDeliveryContext = () => useContext(DeliveryContext);

export default DeliveryContext