import {createContext, useContext} from "react";

const ReturnsContext = createContext();

export const useReturnsContext = () => {
  const context = useContext(ReturnsContext);
  if (!context) {
    throw new Error('useReturnsContext must be used within a ReturnsProvider');
  }
  return context;
};

export default ReturnsContext;