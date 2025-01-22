import OrderContext from "../context/OrderContext.js";
import {useClientContext} from "../context/ClientContext.js";
import {toast} from "react-toastify";
import axios from "axios";
import {useEffect, useState} from "react";
import TokenAuth from "../service/TokenAuth.js";
import PropTypes from "prop-types";

export default function OrderProviders({children}) {
    const [orderItems, setOrderItems] = useState([]);
    const [itemToModify, setItemToModify] = useState([]);
    const [isModify, setIsModify] = useState(false);
    const {isAdmin, token} = TokenAuth();
    const {userClientId, clients} = useClientContext();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_ORDERS_URL}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                if (isAdmin) {
                    const client = clients.find(client => orderItems.filter(order => order.client === client.id));
                    setOrderItems(response.data.map(order => ({...order, clientName: client.name})));
                } else {
                    const orders = response.data.filter(order => order.client === userClientId);
                    setOrderItems(orders);
                }
            } catch (err) {
                console.error(err);
            }
        }
        fetchData().then();
    }, [clients, isAdmin, token, userClientId]);

    const addOrder = async (data) => {
        try {
            const order = {
                ...data,
                etatCommande: "En attente",
                dateCommande: new Date().toLocaleDateString(),
                client: userClientId
            }
            await axios.post(`${import.meta.env.VITE_ORDERS_URL}`, order, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            toast.success("Commande ajoutée avec succès", {
                onClose: () => window.location="/commandes"
            });
        } catch (err) {
            console.error(err);
            toast.error("Erreur lors de l'ajout de la commande");
        }
    }

    const modifyOrder = async (data, dataId) => {
        try {
            const order = {
                ...data,
                etatCommande: "En attente",
                dateCommande: new Date().toLocaleDateString('fr-FR'),
                client: userClientId
            }
            await axios.put(`${import.meta.env.VITE_ORDERS_URL}${dataId}/`, order, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            localStorage.removeItem("order")
            localStorage.removeItem("isModify")
            toast.success("Commande modifiée avec succès", {
                onClose: () => window.location="/commandes"
            });
        } catch (err) {
            console.error(err);
            toast.error("Erreur lors de la modification de la commande");
        }
    }

    const deleteOrder = async (id) => {
        try {
            await axios.delete(`${import.meta.env.VITE_ORDERS_URL}${id}/`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            toast.success("Commande supprimé avec succès", {
                onClose: () => window.location.reload()
            });
        } catch (err) {
            console.error(err);
            toast.error("Erreur lors de la suppression de la Commande");
        }
    }

    return (
        <OrderContext.Provider value={{
            orderItems, addOrder, modifyOrder, deleteOrder, itemToModify, setItemToModify,
            isModify, setIsModify
        }}>
            {children}
        </OrderContext.Provider>
    )
}

OrderProviders.propTypes = {
    children: PropTypes.node.isRequired
}