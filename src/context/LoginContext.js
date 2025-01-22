import {createContext, useContext} from "react";

const LoginContext = createContext();

export const useLoginContext = () => useContext(LoginContext);

export default LoginContext