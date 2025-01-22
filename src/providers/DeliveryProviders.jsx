import DeliveryContext from "../context/DeliveryContext.js";
import {useEffect, useState} from "react";
import axios from "axios";
import PropTypes from "prop-types";
import TokenAuth from "../service/TokenAuth.js";
import {useClientContext} from "../context/ClientContext.js";

export default function DeliveryProviders({children}) {
    const [deliveryNotes, setDeliveryNotes] = useState([]);
    const {isAdmin, token} = TokenAuth();
    const {userClient} = useClientContext();
     useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BL_URL}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                if (isAdmin) {
                    setDeliveryNotes(response.data);
                } else {
                    const deliveries = response.data.filter(order => order.client === userClient);
                    setDeliveryNotes(deliveries);
                }
            } catch (err) {
                console.error(err);
            }
        }
        fetchData().then();
    }, [isAdmin, token, userClient]);
    return (
        <DeliveryContext.Provider value={{deliveryNotes}}>
            {children}
        </DeliveryContext.Provider>
    );
}

DeliveryProviders.propTypes = {
    children: PropTypes.node.isRequired
}
