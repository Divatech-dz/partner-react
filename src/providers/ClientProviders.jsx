import ClientContext from "../context/ClientContext.js";
import {useEffect, useState} from "react";
import axios from "axios";
import PropTypes from "prop-types";
import TokenAuth from "../service/TokenAuth.js";

export default function ClientProviders({children}) {
    const [clients, setClients] = useState([]);
    const [userClient, setUserClient] = useState("");
    const [userClientId, setUserClientId] = useState(0)
    const {isAdmin, token, username} = TokenAuth();

    useEffect(() => {
    const fetchData = async () => {
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
                    }
                });
                if (isAdmin) {
                    localStorage.setItem('clients', JSON.stringify(response.data));
                    setClients(response.data);
                } else {
                    const user = response.data.find(client => username.replace(/\s/g, '_').toLowerCase() === client.name.replace(/\s/g, '_').toLowerCase());
                    if (user) {
                        setClients(response.data);
                        setUserClient(user.name);
                        setUserClientId(user.id);
                        localStorage.setItem('clients', JSON.stringify(response.data));
                        localStorage.setItem('userClient', user.name);
                        localStorage.setItem('userClientId', user.id);
                    }
                }
            }
        } catch (err) {
            console.error(err);
        }
    };
    fetchData().then();
}, [isAdmin, token, username]);

    const addUser = async (data) => {
        try {
            const response = await axios.post(`${import.meta.env.VITE_REGISTER_URL}`, {...data, group_name: "Client"}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.data.error) {
                alert(response.data.error);
            } else {
                alert("Client Enregistré!");
                window.location.reload()
            }
        } catch (error) {
            console.error('Error response:', error.response);
            alert(error.response.data.message || 'An error occurred');
        }
    };

    const modifyUser = (data, id) => {
        axios.put(`${import.meta.env.VITE_REGISTER_URL}${id}/`, data, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(response => {
                const data = response.data;
                if (data.error) {
                    alert(data.error);
                } else {
                    alert("Informations Modifié!");
                    window.location.reload()
                }
            })
            .catch(error => {
                alert(error);
            });
    };

    const deleteUser = async (id) => {
        try {
            await axios.delete(`${import.meta.env.VITE_REGISTER_URL}${id}/`, {is_active: false}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            alert("Client supprimé !");
            window.location.reload();
        } catch (err) {
            alert(err);
        }
    };

    return (<ClientContext.Provider value={{clients, addUser, modifyUser, deleteUser, userClient, userClientId}}>
        {children}
    </ClientContext.Provider>)
}

ClientProviders.propTypes = {
    children: PropTypes.node.isRequired
}