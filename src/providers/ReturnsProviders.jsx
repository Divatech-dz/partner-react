import ReturnsContext from "../context/ReturnsContext.js";
import axios from "axios";
import {useEffect, useState} from "react";
import TokenAuth from "../service/TokenAuth.js";
import PropTypes from "prop-types";
import {useClientContext} from "../context/ClientContext.js";

export default function ReturnsProviders({children}) {
    const [returns, setReturns] = useState([]);
    const {isAdmin, token} = TokenAuth();
    const {userClient, userClientId} = useClientContext();

    useEffect(() => {
        const fetchData = async () => {
            if (!token) {
                console.log("No token available");
                return;
            }

            try {
                let response;
                if (localStorage.getItem('returns') && isAdmin) {
                    setReturns(JSON.parse(localStorage.getItem('returns')));
                } else if (localStorage.getItem('userReturns')) {
                    setReturns(JSON.parse(localStorage.getItem('userReturns')));
                } else {
                    // CORRECTION: Utiliser la bonne URL pour récupérer les retours
                    response = await axios.get(`${import.meta.env.VITE_BR_URL}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        timeout: 30000
                    });
                    
                    if (isAdmin) {
                        localStorage.setItem('returns', JSON.stringify(response.data));
                        setReturns(response.data);
                    } else {
                        const userReturns = response.data.filter(order => order.client === userClient);
                        setReturns(userReturns);
                        localStorage.setItem('userReturns', JSON.stringify(userReturns));
                    }
                }
            } catch (err) {
                console.error('Fetch error:', err);
            }
        };

        fetchData().then();
    }, [isAdmin, token, userClient]);

    const createBonReturn = async (data) => {
        console.log(' Creating return with data:', data);
        
        try {
            // CORRECTION: Utiliser FormData pour envoyer les données
            const formData = new FormData();
            
            // Ajouter tous les champs requis pour votre API
            formData.append('id_bonlivraison', data.deliveryId);
            formData.append('client_name', data.client_name);
            formData.append('client_id', data.client_id);
            formData.append('date', data.date);
            formData.append('serialNumber', data.serialNumber);
            formData.append('total', data.total.toString());
            
            // Ajouter les données du produit
            if (data.product) {
                formData.append('product_name', data.product.name);
                formData.append('product_reference', data.product.reference);
                formData.append('product_quantity', data.product.quantity.toString());
                formData.append('product_unitprice', data.product.unitprice.toString());
                formData.append('product_totalprice', data.product.totalprice.toString());
            }
            
            // Ajouter l'image si elle existe
            if (data.imageFile) {
                formData.append('image', data.imageFile);
            }

       
            const CREATE_RETURN_URL = `${import.meta.env.VITE_BR_URL}`; // ou une autre URL spécifique
            
         
           

            const response = await axios.post(CREATE_RETURN_URL, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                },
                timeout: 30000
            });
            
            console.log('✅ Response:', response.data);
            
            if (response.data.error) {
                alert(response.data.error);
            } else {
                alert("Bon de retour créé!");
                // Update local state and storage
                setReturns(prevReturns => {
                    const newReturns = [...prevReturns, response.data];
                    if (isAdmin) {
                        localStorage.setItem('returns', JSON.stringify(newReturns));
                    } else {
                        localStorage.setItem('userReturns', JSON.stringify(newReturns));
                    }
                    return newReturns;
                });
            }
        } catch (error) {
            console.error('❌ Error response:', error);
            console.error('Error details:', {
                status: error.response?.status,
                data: error.response?.data,
                config: error.config
            });
            alert(error.response?.data?.message || 'An error occurred while creating return');
        }
    };

    const modifyReturn = async (data, id) => {
        try {
            const formData = new FormData();
            
            // Ajouter les mêmes champs que createBonReturn
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
                    const updatedReturns = prevReturns.map(returnItem => 
                        returnItem.id === id ? response.data : returnItem
                    );
                    if (isAdmin) {
                        localStorage.setItem('returns', JSON.stringify(updatedReturns));
                    } else {
                        localStorage.setItem('userReturns', JSON.stringify(updatedReturns));
                    }
                    return updatedReturns;
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
                const filteredReturns = prevReturns.filter(returnItem => returnItem.id !== id);
                if (isAdmin) {
                    localStorage.setItem('returns', JSON.stringify(filteredReturns));
                } else {
                    localStorage.setItem('userReturns', JSON.stringify(filteredReturns));
                }
                return filteredReturns;
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
            deleteReturn
        }}>
            {children}
        </ReturnsContext.Provider>
    );
}

ReturnsProviders.propTypes = {
    children: PropTypes.node.isRequired
};