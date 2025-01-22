import {createContext, useContext} from "react";

const WarrantiesContext = createContext();

export const useWarrantiesContext = () => useContext(WarrantiesContext);

export default WarrantiesContext