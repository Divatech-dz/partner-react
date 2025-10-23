import feedbackContext from "../context/FeedbackContext.js";
import PropTypes from "prop-types";
import {useEffect, useState} from "react";
import TokenAuth from "../service/TokenAuth.js";
import {useClientContext} from "../context/ClientContext.js";
import axios from "axios";
import {toast} from "react-toastify";

export default function FeedbackProviders({children}) {
    const [feedbacks, setFeedbacks] = useState([]);
    const tokenAuthData = TokenAuth();
    const {isAdmin, token, username, userRole, userName} = tokenAuthData;
    const clientContextData = useClientContext();
    const {userClient, userClientId, clients} = clientContextData;
    
    // Function to format date as yyyy-mm-dd
    const formatDate = (date = new Date()) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_FEEDBACK_URL}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    timeout: 30000
                });
                console.log("Fetched feedbacks:", response.data);
                
                if (isAdmin) {
                    // Admin sees all feedbacks with client names
                    const feedbacksWithClientNames = response.data.map(feedback => {
                        const client = clients.find(client => client.id === feedback.client);
                        return {
                            ...feedback,
                            clientName: client ? client.name : feedback.client_name || 'Unknown Client'
                        };
                    });
                    setFeedbacks(feedbacksWithClientNames);
                } else if (userRole === 'Commercial') {
                    // Commercial sees feedbacks where commercial field matches their username
                    const commercialNameToMatch = username;
                    console.log("Commercial filtering - username:", username, "userRole:", userRole);
                    
                    const commercialFeedbacks = response.data.filter(feedback => {
                        const feedbackCommercial = feedback.commercial;
                        const matches = feedbackCommercial && 
                                       feedbackCommercial.toString().trim().toLowerCase() === commercialNameToMatch.trim().toLowerCase();
                        console.log("Feedback commercial:", feedbackCommercial, "Matches:", matches);
                        return matches;
                    });
                    
                    console.log("Commercial feedbacks found:", commercialFeedbacks);
                    
                    // Add client names to commercial's feedbacks
                    const feedbacksWithClientNames = commercialFeedbacks.map(feedback => {
                        const client = clients.find(client => client.id === feedback.client);
                        return {
                            ...feedback,
                            clientName: client ? client.name : feedback.client_name || 'Unknown Client'
                        };
                    });
                    setFeedbacks(feedbacksWithClientNames);
                } else {
                    // Regular client sees only their own feedbacks
                    const currentUserClientName = userClient?.name || userClient;
                    console.log("Client filtering - userClient:", userClient, "userClientId:", userClientId, "currentUserClientName:", currentUserClientName);
                    
                    const clientFeedbacks = response.data.filter(feedback => {
                        const feedbackClientName = feedback.client_name;
                        const matches = feedbackClientName && 
                                       feedbackClientName.toString().trim().toLowerCase() === currentUserClientName.toString().trim().toLowerCase();
                        console.log("Feedback client:", feedbackClientName, "Matches:", matches);
                        return matches;
                    });
                    
                    console.log("Client feedbacks found:", clientFeedbacks);
                    setFeedbacks(clientFeedbacks);
                }
            } catch (err) {
                console.error("Error fetching feedbacks:", err);
                setFeedbacks([]);
            }
        }
        
        if (token) {
            fetchData().then();
        }
    }, [isAdmin, token, userClient, userClientId, clients, username, userRole, userName]);

    const addFeedback = async (data) => {
        try {
            const postFeedback = {
                ...data,
                etatFeedBack: "en-attente",
                dateBon: formatDate(),
            }
            console.log("Sending feedback:", postFeedback);
            
            await axios.post(`${import.meta.env.VITE_FEEDBACK_URL}`, postFeedback, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                timeout: 30000
            })
            toast.success("Réclamation ajoutée avec succès", {
                onClose: () => window.location.reload()
            });
        } catch (err) {
            console.error(err);
            toast.error("Erreur lors de l'ajout de la réclamation")
        }
    }

    const modifyFeedback = async (data, dataId) => {
        try {
            const postFeedback = {
                ...data,
                etatFeedBack: "en-attente",
                date: formatDate(),
                client: userClientId
            }
            console.log("Updating feedback:", postFeedback);
            
            await axios.put(`${import.meta.env.VITE_FEEDBACK_URL}${dataId}/`, postFeedback, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                timeout: 30000
            })
            toast.success("Réclamation modifiée avec succès", {onClose: () => window.location.reload()})

        } catch (err) {
            console.error(err);
            toast.error("Erreur lors de la modification de la réclamation")
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
            toast.success("Réclamation supprimée avec succès", {
                onClose: () => window.location.reload()
            })
        } catch (err) {
            console.error(err);
            toast.error("Erreur lors de la suppression de la réclamation")
        }
    }
// Add these functions to your FeedbackProviders.jsx

const updateFeedbackStatus = async (feedbackId, newStatus) => {
  try {
    // PATCH request to update only the status
    await axios.patch(`${import.meta.env.VITE_FEEDBACK_URL}${feedbackId}/`, {
      etatFeedBack: newStatus
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      timeout: 30000
    });
    
    // Update local state
    setFeedbacks(prev => prev.map(feedback => 
      feedback.id === feedbackId 
        ? { ...feedback, etatFeedBack: newStatus }
        : feedback
    ));
    
    toast.success("Statut mis à jour avec succès");
  } catch (err) {
    console.error(err);
    toast.error("Erreur lors de la mise à jour du statut");
  }
};

const addFeedbackResponse = async (feedbackId, response) => {
  try {
    // PATCH request to add response and update status to "traite"
    await axios.patch(`${import.meta.env.VITE_FEEDBACK_URL}${feedbackId}/`, {
      reponse: response,
 
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      timeout: 30000
    });
    
    // Update local state
    setFeedbacks(prev => prev.map(feedback => 
      feedback.id === feedbackId 
        ? { ...feedback, reponse: response, etatFeedBack: "traite" }
        : feedback
    ));
    
    toast.success("Réponse envoyée avec succès");
  } catch (err) {
    console.error(err);
    toast.error("Erreur lors de l'envoi de la réponse");
  }
};

// Add these functions to your context value
return (
  <feedbackContext.Provider value={{
    feedbacks, 
    addFeedback, 
    modifyFeedback, 
    deleteFeedback,
    updateFeedbackStatus,
    addFeedbackResponse
  }}>
    {children}
  </feedbackContext.Provider>
);
   
}

FeedbackProviders.propTypes = {
    children: PropTypes.node.isRequired
}