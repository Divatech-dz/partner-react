import {createContext, useContext} from "react";

const ClientContext = createContext();

export const useClientContext = () => useContext(ClientContext);

export default ClientContext