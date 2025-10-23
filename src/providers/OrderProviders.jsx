// OrderProviders.jsx (updated with SweetAlert)
import OrderContext from "../context/OrderContext.js";
import {useEffect, useState} from "react";
import axios from "axios";
import PropTypes from "prop-types";
import TokenAuth from "../service/TokenAuth.js";
import {useClientContext} from "../context/ClientContext.js";
import {toast} from "react-toastify";
import Swal from 'sweetalert2';

export default function OrderProviders({children}) {
    const [orderItems, setOrderItems] = useState([]);
    
    const tokenAuthData = TokenAuth();
    const {isAdmin, token, username, userRole, userName,commercial} = tokenAuthData;

    
    const clientContextData = useClientContext();
    const {userClient, userClientId} = clientContextData;
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_ORDERS_URL}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    timeout: 30000
                });
                
                if (isAdmin) {
                    setOrderItems(response.data);
                } else if (userRole === 'Commercial') {
                    const commercialNameToMatch = username;
                    const commercialOrders = response.data.filter(order => {
                        const orderCommercial = order.commercial;
                        return orderCommercial && 
                               orderCommercial.toString().trim().toLowerCase() === commercialNameToMatch.trim().toLowerCase();
                    });
                    setOrderItems(commercialOrders);
                } else {
                    const clientOrders = response.data.filter(order => {
                        const orderClientName = order.client_name;
                        const currentUserClientName = userClient?.name || userClient;
                        return orderClientName && 
                               orderClientName.toString().trim().toLowerCase() === currentUserClientName.toString().trim().toLowerCase();
                    });
                    setOrderItems(clientOrders);
                }
            } catch (err) {
                setOrderItems([]);
            }
        };
        
        if (token) {
            fetchData();
        }
    }, [isAdmin, token, userClient, username, userRole, userName]);

    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

const addOrder = async (data) => {
    try {
        // Show SweetAlert confirmation
        const result = await Swal.fire({
            title: 'Confirmer la commande',
            text: 'Voulez-vous vraiment créer cette commande ?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Oui, confirmer',
            cancelButtonText: 'Annuler'
        });

        if (!result.isConfirmed) {
            return; // User cancelled
        }

        // Use the date from the data if provided, otherwise use current date
        const orderDate = data.dateCommande || formatDate(new Date());
       
        const order = {
            ...data,
            etatCommande: "en-attente",
            dateCommande: orderDate, // Use properly formatted date
            client: userClientId,
            client_name: userClient?.name || userClient ,
            commercial: commercial || "" 
        };
      
        const response = await axios.post(`${import.meta.env.VITE_ORDERSP_URL}`, order, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            timeout: 30000
        });
        
        // Show success message without OK button
        await Swal.fire({
            title: 'Succès!',
            text: 'Commande ajoutée avec succès',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            timerProgressBar: true
        });
        
        // Redirect after success
        window.location.href = "/commandes";
    } catch (err) {
        console.error('Add order error:', err);
        
        // Show error message without OK button
        await Swal.fire({
            title: 'Erreur!',
            text: 'Erreur lors de l\'ajout de la commande',
            icon: 'error',
            timer: 3000,
            showConfirmButton: false,
            timerProgressBar: true
        });
    }
};

    const modifyOrder = async (data, dataId) => {
        try {
            // Show SweetAlert confirmation for modification
            const result = await Swal.fire({
                title: 'Confirmer la modification',
                text: 'Voulez-vous vraiment modifier cette commande ?',
                icon: 'question',
                showCancelButton: {
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Oui, modifier',
                    cancelButtonText: 'Annuler'
                }
            });

            if (!result.isConfirmed) {
                return; // User cancelled
            }

            const orderDate = data.dateCommande || formatDate(new Date());
            
            const order = {
                ...data,
                etatCommande: "en-attente",
                dateCommande: orderDate,
                client_name: userClient?.name || userClient
            };
            
            const response = await axios.put(`${import.meta.env.VITE_ORDERS_URL}${dataId}/`, order, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                timeout: 30000
            });
            
            const updatedOrder = response.data;
            setOrderItems(prev => prev.map(item => item.id === dataId ? updatedOrder : item));
            
            localStorage.removeItem("order");
            localStorage.removeItem("isModify");
            
            // Show success message without OK button
            await Swal.fire({
                title: 'Succès!',
                text: 'Commande modifiée avec succès',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
                timerProgressBar: true
            });
            
            window.location.href = "/commandes";
        } catch (err) {
            // Show error message without OK button
            await Swal.fire({
                title: 'Erreur!',
                text: 'Erreur lors de la modification de la commande',
                icon: 'error',
                timer: 3000,
                showConfirmButton: false,
                timerProgressBar: true
            });
        }
    };

    const deleteOrder = async (id) => {
        try {
            // Show SweetAlert confirmation for deletion
            const result = await Swal.fire({
                title: 'Confirmer la suppression',
                text: 'Voulez-vous vraiment supprimer cette commande ?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Oui, supprimer',
                cancelButtonText: 'Annuler'
            });

            if (!result.isConfirmed) {
                return; // User cancelled
            }

            await axios.delete(`${import.meta.env.VITE_ORDERS_URL}${id}/`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                timeout: 30000
            });
            
            setOrderItems(prev => prev.filter(item => item.id !== id));
            
            // Show success message without OK button
            await Swal.fire({
                title: 'Succès!',
                text: 'Commande supprimée avec succès',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
                timerProgressBar: true
            });
        } catch (err) {
            // Show error message without OK button
            await Swal.fire({
                title: 'Erreur!',
                text: 'Erreur lors de la suppression de la commande',
                icon: 'error',
                timer: 3000,
                showConfirmButton: false,
                timerProgressBar: true
            });
        }
    };

    const value = {
        orderItems, 
        addOrder, 
        modifyOrder, 
        deleteOrder
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