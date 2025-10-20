import {createContext, useContext} from "react";

const FeedbackContext = createContext();

export const useFeedbackContext = () => {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedbackContext must be used within a FeedbackProvider');
  }
  return context;
};

export default FeedbackContext;