import {useEffect, useState} from "react";
import WarrantiesContext from "../context/WarrantiesContext.js";
import {useClientContext} from "../context/ClientContext.js";
import axios from "axios";
import PropTypes from "prop-types";
import TokenAuth from "../service/TokenAuth.js";

export default function WarrantiesProviders ({children}){
    const [warranties , setWarranties] = useState([]);
    const {isAdmin, token} = TokenAuth();
    const {userClient} = useClientContext();

     useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BG_URL}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                if (isAdmin) {
                    setWarranties(response.data);
                } else {
                    const warrantiesUser = response.data.filter(order => order.client === userClient);
                    setWarranties(warrantiesUser);
                }
            } catch (err) {
                console.error(err);
            }
        }
        fetchData().then();
    }, [isAdmin, token, userClient]);

    return (
        <WarrantiesContext.Provider value={{warranties}}>
            {children}
        </WarrantiesContext.Provider>
    );
}

WarrantiesProviders.propTypes = {
    children: PropTypes.node.isRequired
}