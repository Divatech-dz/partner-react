import UsersContext from "../context/UsersContext.js";
import axios from "axios";
import PropTypes from "prop-types";
import {useEffect, useState} from "react";
import TokenAuth from "../service/TokenAuth.js"; // Import the auth hook

export default function UsersProviders({children}) {
    const [users, setUsers] = useState([]);
    const { token } = TokenAuth(); // Get the token

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Check if token exists before making the request
                if (!token) {
                    console.log("No token available");
                    return;
                }

                const response = await axios.get(`${import.meta.env.VITE_USERS_URL}`, {
                    headers: {
                        Authorization: `Bearer ${token}`, // Include the token
                    }
                });
                console.log("useeeeers", response.data);
                
                setUsers(response.data);
            } catch (err) {
                console.error(err);
                // Handle 401 specifically
                if (err.response?.status === 401) {
                    console.error("Unauthorized - Token may be invalid or expired");
                    // Optionally: redirect to login or clear local storage
                    // localStorage.clear();
                    // window.location.href = '/login';
                }
            }
        }
        
        // Only fetch if token exists
        if (token) {
            fetchData().then();
        }
    }, [token]); // Add token as dependency

    return (
        <UsersContext.Provider value={{users}}>
            {children}
        </UsersContext.Provider>
    )
}

UsersProviders.propTypes = {
    children: PropTypes.node.isRequired
}