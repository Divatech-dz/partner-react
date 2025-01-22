import {useEffect, useState} from "react";
import axios from "axios";
import PropTypes from "prop-types";
import ProductsContext from "../context/ProductsContext.js";
import TokenAuth from "../service/TokenAuth.js";

export default function ProductsProviders({children}) {
   const [products, setProducts] = useState([])
     const {token} = TokenAuth();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_PRODUCTS_URL}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setProducts(response.data);
            } catch (err) {
                console.error(err)
            }
        }
        fetchData().then()
    }, []);

    return (
        <ProductsContext.Provider value={{products}}>
            {children}
        </ProductsContext.Provider>
    )
}
ProductsProviders.propTypes = {
    children: PropTypes.node.isRequired
}
