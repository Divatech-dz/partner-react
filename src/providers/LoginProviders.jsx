import LoginContext from "../context/LoginContext.js";
import axios from "axios";
import PropTypes from "prop-types";
import {useNavigate} from "react-router-dom";
import {toast} from "react-toastify";

export default function LoginProviders({children}) {
    const navigate = useNavigate();

    const onLogin = async (data) => {
        try {
            const response = await axios.post(`${import.meta.env.VITE_LOGIN_URL}`, data, {
                timeout: 30000
            });
            localStorage.setItem('token', response.data.access);
            localStorage.setItem('username', response.data.user.username);
            navigate("/");
            toast.success(`Bienvenue ${response.data.user.username}`);
        } catch (error) {
            console.error('Login error:', error);
            if (error.code === 'ECONNABORTED') {
                toast.error("Timeout de connexion - vérifiez votre connexion internet");
            } else if (error.response?.status === 401) {
                toast.error("Nom d'utilisateur ou mot de passe incorrect");
            } else if (error.response?.status === 500) {
                toast.error("Erreur serveur - veuillez réessayer plus tard");
            } else {
                toast.error("Erreur lors de la connexion");
            }
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