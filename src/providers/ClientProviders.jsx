import ClientContext from "../context/ClientContext.js";
import {useEffect, useState} from "react";
import axios from "axios";
import PropTypes from "prop-types";
import TokenAuth from "../service/TokenAuth.js";

export default function ClientProviders({children}) {
    const [clients, setClients] = useState([]);
    const [userClient, setUserClient] = useState("");
    const [userClientId, setUserClientId] = useState(0);
    const {isAdmin, token, username} = TokenAuth();

    useEffect(() => {
        const fetchData = async () => {
            if (!token) {
                console.log("No token available");
                return;
            }

            try {
                let response;
                if (localStorage.getItem('clients') && isAdmin) {
                    setClients(JSON.parse(localStorage.getItem('clients')));
                } else if (localStorage.getItem('userClient') && localStorage.getItem('userClientId')) {
                    setClients(JSON.parse(localStorage.getItem('clients')));
                    setUserClient(localStorage.getItem('userClient'));
                    setUserClientId(parseInt(localStorage.getItem('userClientId'), 10));
                } else {
                    response = await axios.get(`${import.meta.env.VITE_CLIENTS_URL}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        timeout: 30000
                    });
                    
                    if (isAdmin) {
                        localStorage.setItem('clients', JSON.stringify(response.data));
                        setClients(response.data);
                    } else {
                        if (!username) {
                            console.error('Username is undefined');
                            return;
                        }
                        
                        const user = response.data.find(client => {
                            const formattedUsername = username?.replace(/\s/g, '_').toLowerCase();
                            const formattedClientName = client.name?.replace(/\s/g, '_').toLowerCase();
                            return formattedUsername === formattedClientName;
                        });
                        
                        if (user) {
                            setClients(response.data);
                            setUserClient(user.name);
                            setUserClientId(user.id);
                            localStorage.setItem('clients', JSON.stringify(response.data));
                            localStorage.setItem('userClient', user.name);
                            localStorage.setItem('userClientId', user.id.toString());
                        }
                    }
                }
            } catch (err) {
                console.error('Fetch error:', err);
            }
        };

        fetchData().then();
    }, [isAdmin, token, username]);

    const addUser = async (data) => {
        console.log('Adding user with data:', data);
        try {
            const response = await axios.post(`${import.meta.env.VITE_REGISTER_URL}`, 
                {...data, group_name: "Client"}, 
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    timeout: 30000
                }
            );
            if (response.data.error) {
                alert(response.data.error);
            } else {
                alert("Client Enregistré!");
                window.location.reload();
            }
        } catch (error) {
            console.error('Error response:', error);
            alert(error.response?.data?.message || 'An error occurred');
        }
    };

    const modifyUser = async (data, id) => {
        try {
            const response = await axios.put(`${import.meta.env.VITE_REGISTER_URL}${id}/`, data, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                timeout: 30000
            });
            
            if (response.data.error) {
                alert(response.data.error);
            } else {
                alert("Informations Modifié!");
                window.location.reload();
            }
        } catch (error) {
            console.error('Modify error:', error);
            alert(error.response?.data?.message || 'An error occurred');
        }
    };

    const deleteUser = async (id) => {
        try {
            await axios.delete(`${import.meta.env.VITE_REGISTER_URL}${id}/`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                timeout: 30000
            });
            alert("Client supprimé !");
            window.location.reload();
        } catch (err) {
            console.error('Delete error:', err);
            alert(err.response?.data?.message || 'An error occurred');
        }
    };

    return (
        <ClientContext.Provider value={{
            clients, 
            addUser, 
            modifyUser, 
            deleteUser, 
            userClient, 
            userClientId
        }}>
            {children}
        </ClientContext.Provider>
    );
}

ClientProviders.propTypes = {
    children: PropTypes.node.isRequired
};