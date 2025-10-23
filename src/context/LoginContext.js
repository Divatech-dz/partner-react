import {createContext, useContext} from "react";

const LoginContext = createContext();

export const useLoginContext = () => {
  const context = useContext(LoginContext);
  if (!context) {
    throw new Error('useLoginContext must be used within a LoginProvider');
  }
  return context;
};

export default LoginContext;