import UsersContext from "../context/UsersContext.js";
import axios from "axios";
import PropTypes from "prop-types";
import {useEffect, useState} from "react";

export default function UsersProviders ({children}){
    const [ users, setUsers ] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_USERS_URL}`);
                setUsers(response.data);
            } catch (err) {
                console.error(err)
            }
        }
        fetchData().then()
    }, []);

    return (
        <UsersContext.Provider value={{users}}>
            {children}
        </UsersContext.Provider>
    )

}

UsersProviders.propTypes = {
    children: PropTypes.node.isRequired
}