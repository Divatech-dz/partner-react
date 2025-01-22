import LoginContext from "../context/LoginContext.js";
import axios from "axios";
import PropTypes from "prop-types";
import {useNavigate} from "react-router-dom";
import {toast} from "react-toastify";

export default function LoginProviders({children}) {
    const navigate = useNavigate();

    const onLogin = async (data) => {
        try {
            const response = await axios.post(`${import.meta.env.VITE_LOGIN_URL}`, data);
            localStorage.setItem('token', response.data.access);
            navigate("/");
            toast.success(`Bienvenue ${response.data.user.username}`);
        } catch {
            toast.error("Erreur lors de la connexion");
        }
    }

    return (
        <LoginContext.Provider value={{onLogin}}>
            {children}
        </LoginContext.Provider>
    )
}

LoginProviders.propTypes = {
    children: PropTypes.node.isRequired
}