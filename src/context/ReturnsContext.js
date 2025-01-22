import {createContext, useContext} from "react";

const ReturnsContext = createContext();

export const useReturnsContext = () => useContext(ReturnsContext);

export default ReturnsContext