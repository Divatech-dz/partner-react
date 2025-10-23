import DeliveryContext from "../context/DeliveryContext.js";
import {useEffect, useState} from "react";
import axios from "axios";
import PropTypes from "prop-types";
import TokenAuth from "../service/TokenAuth.js";
import {useClientContext} from "../context/ClientContext.js";

export default function DeliveryProviders({children}) {
    const [deliveryNotes, setDeliveryNotes] = useState([]);
    
    const tokenAuthData = TokenAuth();
    const {isAdmin, token, username, userRole, commercial} = tokenAuthData;
    
    const clientContextData = useClientContext();
    const {userClient} = clientContextData;
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BL_URL}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    timeout: 30000
                });
           
                
                if (isAdmin) {
                    setDeliveryNotes(response.data);
                } else if (userRole === 'Commercial') {
                    const commercialNameToMatch = username;
                    const commercialDeliveries = response.data.filter(delivery => {
                        const deliveryUser = delivery.user;
                        return deliveryUser && 
                               deliveryUser.toString().trim().toLowerCase() === commercialNameToMatch.trim().toLowerCase();
                    });
                    setDeliveryNotes(commercialDeliveries);
                } else {
                    const clientDeliveries = response.data.filter(delivery => {
                        const deliveryClient = delivery.client;
                        const currentUserClientName = userClient?.name || userClient;
                        return deliveryClient && 
                               deliveryClient.toString().trim().toLowerCase() === currentUserClientName.toString().trim().toLowerCase();
                    });
                    setDeliveryNotes(clientDeliveries);
                }

            } catch (err) {
                console.error(err);
                setDeliveryNotes([]);
            }
        }
        
        if (token) {
            fetchData().then();
        }
    }, [isAdmin, token, userClient, username, userRole]);

    return (
        <DeliveryContext.Provider value={{deliveryNotes}}>
            {children}
        </DeliveryContext.Provider>
    );
}

DeliveryProviders.propTypes = {
    children: PropTypes.node.isRequired
};