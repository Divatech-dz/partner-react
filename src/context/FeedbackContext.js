import {createContext, useContext} from "react";

const FeedbackContext = createContext();

export const useFeedbackContext = () => useContext(FeedbackContext);

export default FeedbackContext