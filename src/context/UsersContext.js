import {createContext, useContext} from "react";

const UsersContext = createContext();

export const useUsersContext = () => useContext(UsersContext);

export default UsersContext