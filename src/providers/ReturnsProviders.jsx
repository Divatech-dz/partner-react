import ReturnsContext from "../context/ReturnsContext.js";
import axios from "axios";
import {useEffect, useState} from "react";
import TokenAuth from "../service/TokenAuth.js";
import PropTypes from "prop-types";
import {useClientContext} from "../context/ClientContext.js";

export default function ReturnsProviders({children}) {
    const [returns, setReturns] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const tokenAuthData = TokenAuth();
    const {isAdmin, token, username, userRole} = tokenAuthData;
    const {userClient, userClientId} = useClientContext();

    useEffect(() => {
        const loadReturns = async () => {
            if (!token) {
                return;
            }

            setIsLoading(true);
            
            try {
                await fetchReturnsFromAPI();
            } catch (error) {
                console.error('❌ Error loading returns:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadReturns();
    }, [isAdmin, token, userClient, username, userRole]);

    const fetchReturnsFromAPI = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BR_URL}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                timeout: 30000
            });
         
            let processedReturns = response.data;
            
       
            if (isAdmin) {
                processedReturns = response.data;
            } else if (userRole === 'Commercial') {
                const commercialNameToMatch = username;
                processedReturns = response.data.filter(returnItem => {
                    const returnCommercial = returnItem.commercial || returnItem.user;
                    return returnCommercial && 
                           returnCommercial.toString().trim().toLowerCase() === commercialNameToMatch.trim().toLowerCase();
                });
            } else {
                processedReturns = response.data.filter(returnItem => {
                    const returnClientName = returnItem.client_name || returnItem.client;
                    const currentUserClientName = userClient?.name || userClient;
                    return returnClientName && 
                           returnClientName.toString().trim().toLowerCase() === currentUserClientName.toString().trim().toLowerCase();
                });
            }
            
            setReturns(processedReturns);
            
        } catch (error) {
            console.error('❌ API fetch error:', error);
            throw error;
        }
    };

    const refreshReturns = async () => {
        setIsLoading(true);
        try {
            await fetchReturnsFromAPI();
        } catch (error) {
            console.error('Refresh failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const createBonReturn = async (formData) => {
        try {
            const CREATE_RETURN_URL = `${import.meta.env.VITE_BRP_URL}`; 
            const response = await axios.post(
                CREATE_RETURN_URL, 
                formData, 
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            
            await refreshReturns();
            return response.data;
        } catch (error) {
            console.error('❌ Error creating return:', error);
            throw error;
        }
    };

    const modifyReturn = async (data, id) => {
        try {
            const formData = new FormData();
            
            formData.append('id_bonlivraison', data.deliveryId);
            formData.append('client_name', data.client_name);
            formData.append('client_id', data.client_id);
            formData.append('date', data.date);
            formData.append('serialNumber', data.serialNumber);
            formData.append('total', data.total.toString());
            
            if (data.product) {
                formData.append('product_name', data.product.name);
                formData.append('product_reference', data.product.reference);
                formData.append('product_quantity', data.product.quantity.toString());
                formData.append('product_unitprice', data.product.unitprice.toString());
                formData.append('product_totalprice', data.product.totalprice.toString());
            }
            
            if (data.imageFile) {
                formData.append('image', data.imageFile);
            }

            const response = await axios.put(`${import.meta.env.VITE_BR_URL}${id}/`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                },
                timeout: 30000
            });
            
            if (response.data.error) {
                alert(response.data.error);
            } else {
                alert("Bon de retour modifié!");
                setReturns(prevReturns => {
                    return prevReturns.map(returnItem => 
                        returnItem.id === id ? response.data : returnItem
                    );
                });
            }
        } catch (error) {
            console.error('Modify error:', error);
            alert(error.response?.data?.message || 'An error occurred');
        }
    };

    const deleteReturn = async (id) => {
        try {
            await axios.delete(`${import.meta.env.VITE_BR_URL}${id}/`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                timeout: 30000
            });
            alert("Bon de retour supprimé !");
            setReturns(prevReturns => {
                return prevReturns.filter(returnItem => returnItem.id !== id);
            });
        } catch (err) {
            console.error('Delete error:', err);
            alert(err.response?.data?.message || 'An error occurred');
        }
    };

    return (
        <ReturnsContext.Provider value={{
            returns, 
            createBonReturn, 
            modifyReturn, 
            deleteReturn,
            refreshReturns,
            isLoading
        }}>
            {children}
        </ReturnsContext.Provider>
    );
}

ReturnsProviders.propTypes = {
    children: PropTypes.node.isRequired
};