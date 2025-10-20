import OrderContext from "../context/OrderContext.js";
import {useClientContext} from "../context/ClientContext.js";
import {toast} from "react-toastify";
import axios from "axios";
import {useEffect, useState} from "react";
import TokenAuth from "../service/TokenAuth.js";
import PropTypes from "prop-types";

export default function OrderProviders({children}) {
    const [orderItems, setOrderItems] = useState([]);
    const [itemToModify, setItemToModify] = useState(null);
    const [isModify, setIsModify] = useState(false);
    const [loading, setLoading] = useState(true);
    const {isAdmin, token} = TokenAuth();
    
    // Move useClientContext inside the component (not in try-catch at top level)
    const clientContext = useClientContext();
    const userClientId = clientContext?.userClientId;
    const clients = clientContext?.clients || [];

    useEffect(() => {
        const fetchData = async () => {
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const response = await axios.get(`${import.meta.env.VITE_ORDERS_URL}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    timeout: 30000
                });
                
                if (isAdmin) {
                    const ordersWithClientNames = response.data.map(order => {
                        const client = clients.find(client => client.id === order.client);
                        return {
                            ...order,
                            clientName: client ? client.name : 'Unknown Client'
                        };
                    });
                    setOrderItems(ordersWithClientNames);
                } else {
                    const orders = response.data.filter(order => order.client === userClientId);
                    setOrderItems(orders);
                }
            } catch (err) {
                console.error('Orders fetch error:', err);
                setOrderItems([]);
            } finally {
                setLoading(false);
            }
        };
        
        if (token) {
            fetchData();
        }
    }, [clients, isAdmin, token, userClientId]);

 const addOrder = async (data) => {
    try {
        const order = {
            ...data,
            etatCommande: "En attente",
            dateCommande: new Date().toLocaleDateString(),
            client: userClientId
        };
        
        await axios.post(`${import.meta.env.VITE_ORDERS_URL}`, order, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            timeout: 30000
        });
        
        toast.success("Commande ajoutée avec succès", {
            onClose: () => window.location.href = "/commandes"
        });
    } catch (err) {
        console.error('Add order error:', err);
        toast.error("Erreur lors de l'ajout de la commande");
    }
};

const modifyOrder = async (data, dataId) => {
    try {
        const order = {
            ...data,
            etatCommande: "En attente",
            dateCommande: new Date().toLocaleDateString('fr-FR'),
            client: userClientId
        };
        
        await axios.put(`${import.meta.env.VITE_ORDERS_URL}${dataId}/`, order, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            timeout: 30000
        });
        
        localStorage.removeItem("order");
        localStorage.removeItem("isModify");
        toast.success("Commande modifiée avec succès", {
            onClose: () => window.location.href = "/commandes"
        });
    } catch (err) {
        console.error('Modify order error:', err);
        toast.error("Erreur lors de la modification de la commande");
    }
};

const deleteOrder = async (id) => {
    try {
        await axios.delete(`${import.meta.env.VITE_ORDERS_URL}${id}/`, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            timeout: 30000
        });
        
        toast.success("Commande supprimée avec succès", {
            onClose: () => window.location.reload()
        });
    } catch (err) {
        console.error('Delete order error:', err);
        toast.error("Erreur lors de la suppression de la commande");
    }
};

    const value = {
        orderItems, 
        addOrder, 
        modifyOrder, 
        deleteOrder, 
        itemToModify, 
        setItemToModify,
        isModify, 
        setIsModify,
        loading
    };

    return (
        <OrderContext.Provider value={value}>
            {children}
        </OrderContext.Provider>
    );
}

OrderProviders.propTypes = {
    children: PropTypes.node.isRequired
};