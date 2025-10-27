import {useEffect, useState} from "react";
import axios from "axios";
import PropTypes from "prop-types";
import ProductsContext from "../context/ProductsContext.js";
import TokenAuth from "../service/TokenAuth.js";

export default function ProductsProviders({children}) {
   const [products, setProducts] = useState([])
   const [pcProducts, setPcProducts] = useState([])
   const [loading, setLoading] = useState(true)
   const [error, setError] = useState(null)
   const {token} = TokenAuth();

    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();

        const fetchData = async () => {
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                // Fetch regular products
                const productsResponse = await axios.get(`${import.meta.env.VITE_PRODUCTS_URL}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    timeout: 30000,
                    signal: controller.signal
                });
              
                if (isMounted) {
                    setProducts(Array.isArray(productsResponse.data) ? productsResponse.data : []);
           
                }

            } catch (err) {
                if (isMounted && err.code !== 'ECONNABORTED') {
                    console.error("Products fetch error:", err);
                    setError(err.message);
                    setProducts([]);
                }
            }
        };
const fetchPcData = async () => {
    if (!token) return;

    try {
        const response = await axios.get(`${import.meta.env.VITE_PRODUCTS_URL}`, {
           headers: {
                        Authorization: `Bearer ${token}`
                    },
            timeout: 30000,
            signal: controller.signal
        });
 
        
        let pcData = [];
        
        // Check if response is HTML (indicating wrong endpoint)
        if (typeof response.data === 'string' && response.data.includes('<!doctype html>')) {
            console.error('PC Products endpoint returned HTML instead of JSON. Check VITE_PC_PRODUCTS_URL environment variable.');
            setPcProducts([]);
            return;
        }
        
        if (Array.isArray(response.data)) {
            // Enhanced filtering for PC products
            pcData = response.data.filter(product => {
              
                
                if (!product || !product.category) return false;
                
                const category = product.category.toString().toUpperCase();
                return category.includes('PC') || category.includes('GAMING');
            });
        }
    
        setPcProducts(pcData);
    
    } catch (err) {
        if (isMounted && err.code !== 'ECONNABORTED') {
            console.error("PC Products fetch error:", err);
            setPcProducts([]);
        }
    } finally {
        if (isMounted) {
            setLoading(false);
        }
    }
};

        // Fetch both regular products and PC products
        const fetchAllData = async () => {
            await fetchData();
            await fetchPcData();
        };

        fetchAllData();

        // Cleanup function
        return () => {
            isMounted = false;
            controller.abort();
        };
    }, [token]);

    return (
        <ProductsContext.Provider value={{products, pcProducts, loading, error}}>
            {children}
        </ProductsContext.Provider>
    )
}

ProductsProviders.propTypes = {
    children: PropTypes.node.isRequired
};