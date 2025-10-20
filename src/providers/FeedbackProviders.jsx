import feedbackContext from "../context/FeedbackContext.js";
import PropTypes from "prop-types";
import {useEffect, useState} from "react";
import TokenAuth from "../service/TokenAuth.js";
import {useClientContext} from "../context/ClientContext.js";
import axios from "axios";
import {toast} from "react-toastify";

export default function FeedbackProviders({children}) {
    const [feedbacks, setFeedbacks] = useState([]);
    const {isAdmin, token} = TokenAuth();
    const {userClientId, clients} = useClientContext();
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_FEEDBACK_URL}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    timeout: 30000
                });
                
                if (isAdmin) {
                    const feedbacksWithClientNames = response.data.map(feedback => {
                        const client = clients.find(client => client.id === feedback.client);
                        return {
                            ...feedback,
                            clientName: client ? client.name : 'Unknown Client'
                        };
                    });
                    setFeedbacks(feedbacksWithClientNames);
                } else {
                    const feedbackUser = response.data.filter(feedback => feedback.client === userClientId);
                    setFeedbacks(feedbackUser);
                }
            } catch (err) {
                console.error(err);
                setFeedbacks([]);
            }
        }
        
        if (token) {
            fetchData().then();
        }
    }, [isAdmin, token, userClientId, clients]);

    const addFeedback = async (data) => {
        try {
            const postFeedback = {
                ...data,
                etatFeedBack: "en-attente",
                date: new Date().toLocaleDateString(),
                client: userClientId
            }
            await axios.post(`${import.meta.env.VITE_FEEDBACK_URL}`, postFeedback, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                timeout: 30000
            })
            toast.success("Feedback ajouté avec succès", {
                onClose: () => window.location.reload()
            });
        } catch (err) {
            console.error(err);
            toast.error("Erreur lors de l'ajout du feedback")
        }
    }

    const modifyFeedback = async (data, dataId) => {
        try {
            const postFeedback = {
                ...data,
                dataId,
                etatFeedBack: "en-attente",
                date: new Date().toLocaleDateString(),
                client: userClientId
            }
            await axios.put(`${import.meta.env.VITE_FEEDBACK_URL}${dataId}/`, postFeedback, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                timeout: 30000
            })
            toast.success("Feedback modifié avec succès", {onClose: () => window.location.reload()})

        } catch (err) {
            toast.error("Erreur lors de la modification du feedback")
        }
    }

    const deleteFeedback = async (dataId) => {
        try {
            await axios.delete(`${import.meta.env.VITE_FEEDBACK_URL}${dataId}/`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                timeout: 30000
            })
            toast.success("Feedback supprimé avec succès", {
                onClose: () => window.location.reload()
            })
        } catch (err) {
            console.error(err);
            toast.error("Erreur lors de la suppression du feedback")
        }
    }

    return (
        <feedbackContext.Provider value={{feedbacks, addFeedback, modifyFeedback, deleteFeedback}}>
            {children}
        </feedbackContext.Provider>
    );
}

FeedbackProviders.propTypes = {
    children: PropTypes.node.isRequired
}