import ReturnsContext from "../context/ReturnsContext.js";
import axios from "axios";
import {useEffect, useState} from "react";
import TokenAuth from "../service/TokenAuth.js";
import PropTypes from "prop-types";
import {useClientContext} from "../context/ClientContext.js";

export default function ReturnsProviders({children}) {
    const [returns, setReturns] = useState([]);
    const {isAdmin, token} = TokenAuth();
    const {userClient} = useClientContext();

     useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BR_URL}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                if (isAdmin) {
                    setReturns(response.data);
                } else {
                    const returnUSer = response.data.filter(order => order.client === userClient);
                    setReturns(returnUSer);
                }
            } catch (err) {
                console.error(err);
            }
        }
        fetchData().then();
    }, [isAdmin, token, userClient]);

    return (
    <ReturnsContext.Provider value={{returns}}>
        {children}
    </ReturnsContext.Provider>
    )
}

ReturnsProviders.propTypes = {
    children: PropTypes.element.isRequired
}