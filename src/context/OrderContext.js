import {createContext, useContext} from "react";

const OrderContext = createContext();

export const useOrderContext = () => useContext(OrderContext);

export default OrderContext