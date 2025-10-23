import {createContext, useContext} from "react";

const UsersContext = createContext();

export const useUsersContext = () => {
  const context = useContext(UsersContext);
  if (!context) {
    throw new Error('useUsersContext must be used within a UsersProvider');
  }
  return context;
};

export default UsersContext;