import React, { useEffect, useState } from 'react';
import { useFeedbackContext } from "../context/FeedbackContext.js";
import TokenAuth from "../service/TokenAuth.js";
import ShowMessage from "../assets/button/add.png";
import closeMessage from "../assets/button/close.png";
import updateMessage from "../assets/button/update.png";
import deleteMessage from "../assets/button/remove.png";
import erase from "../assets/button/delete.png";
import FeedbackForm from "../components/feedback/FeedbackForm.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import ClientProviders from "../providers/ClientProviders.jsx";
import FeedbackProviders from "../providers/FeedbackProviders.jsx";

export default function Feedbacks() {
  return (
    <ClientProviders>
      <FeedbackProviders>
        <FeedbacksContent />
      </FeedbackProviders>
    </ClientProviders>
  );
}

function FeedbacksContent() {
  const { feedbacks = [], addFeedback, modifyFeedback, deleteFeedback, updateFeedbackStatus, addFeedbackResponse } = useFeedbackContext();
  const { isAdmin, isCommercial } = TokenAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [operation, setOperation] = useState('add');
  const [feedbackId, setFeedbackId] = useState(0);
  const [search, setSearch] = useState('');
  const [pickDate, setPickDate] = useState('');
  const [selectedRow, setSelectedRow] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [responseText, setResponseText] = useState('');
  const [showResponseForm, setShowResponseForm] = useState(null);

  // Add loading state
  if (!feedbacks) {
    return <LoadingSpinner />;
  }

  const filteredFeedbacks = () => {
    if (isAdmin || isCommercial) {
      return feedbacks
        .filter(note => 
          (note.clientName?.toLowerCase().includes(search.toLowerCase()) || 
           note.client_name?.toLowerCase().includes(search.toLowerCase()) || false) &&
          (!pickDate || note.dateBon >= pickDate)
        )
        .sort((a, b) => new Date(b.dateBon || 0) - new Date(a.dateBon || 0));
    } else {
      return feedbacks.sort((a, b) => new Date(b.dateBon || 0) - new Date(a.dateBon || 0));
    }
  };

  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [search, pickDate]);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentFeedbacks = filteredFeedbacks().slice(startIndex, endIndex);

  const totalPages = Math.max(1, Math.ceil(filteredFeedbacks().length / pageSize));

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleShowMessage = (index) => {
    setSelectedRow(selectedRow === index ? null : index);
  }

  const handleStatusUpdate = async (feedbackId, newStatus) => {
    try {
      await updateFeedbackStatus(feedbackId, newStatus);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleSendResponse = async (feedbackId) => {
    if (!responseText.trim()) {
      alert('Veuillez saisir une réponse');
      return;
    }

    try {
      await addFeedbackResponse(feedbackId, responseText);
      setResponseText('');
      setShowResponseForm(null);
    } catch (error) {
      console.error('Error sending response:', error);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'en-attente': { 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
        label: 'En attente' 
      },
      'en-cours': { 
        color: 'bg-blue-100 text-blue-800 border-blue-200', 
        label: 'En cours' 
      },
      'clos': { 
        color: 'bg-green-100 text-green-800 border-green-200', 
        label: 'Clos' 
      }
    };

    const config = statusConfig[status] || { 
      color: 'bg-gray-100 text-gray-800 border-gray-200', 
      label: status 
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const StatusSelect = ({ feedbackId, currentStatus }) => {
    const statusConfig = {
      'en-attente': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'en-cours': 'bg-blue-100 text-blue-800 border-blue-300',
      'clos': 'bg-green-100 text-green-800 border-green-300'
    };

    const colorClass = statusConfig[currentStatus] || 'bg-gray-100 text-gray-800 border-gray-300';
    
    return (
      <select 
        value={currentStatus || 'en-attente'}
        onChange={(e) => handleStatusUpdate(feedbackId, e.target.value)}
        className={`text-sm border-2 rounded px-3 py-1 font-medium ${colorClass}`}
      >
        <option value="en-attente" className="bg-yellow-100 text-yellow-800">En attente</option>
        <option value="en-cours" className="bg-blue-100 text-blue-800">En cours</option>
        <option value="clos" className="bg-green-100 text-green-800">Clos</option>
      </select>
    );
  };

  return (
    <section className="px-10">
      <h1 className="text-3xl text-center uppercase py-4 font-bold">Liste des réclamations</h1>
      <div className="flex flex-col gap-2">
        <div className='flex justify-center gap-10'>
          {(isAdmin || isCommercial) && (
            <div className="relative">
              <input 
                type="text" 
                placeholder="Rechercher un client"
                className="px-4 py-3 rounded-lg shadow-sm focus:outline-none focus:shadow-outline bg-gray-50 text-gray-600 font-medium w-full"
                value={search} 
                onChange={(e) => setSearch(e.target.value)}
              />
              <button 
                type="button" 
                onClick={() => setSearch('')}
                className="absolute top-1/2 right-3 transform -translate-y-1/2"
              >
                <img src={erase} alt="erase" className="size-4"/>
              </button>
            </div>
          )}
          <input 
            type='date' 
            value={pickDate} 
            onChange={event => setPickDate(event.target.value)}
            className="px-4 py-3 rounded-lg shadow-sm focus:outline-none focus:shadow-outline bg-gray-50 text-gray-600 font-medium"
          />
        </div>
        
        {/* Main Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full items-center mb-0 align-top border-gray-200 text-black backdrop-blur-sm bg-white/30">
            <thead className="align-bottom border-b-2 bg-gray-100">
              <tr>
                <th className="px-4 py-3 font-bold uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xs border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70">
                  Date
                </th>
                {(isAdmin || isCommercial) && (
                  <th className="px-4 py-3 font-bold uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xs border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70">
                    Client
                  </th>
                )}
                <th className="px-4 py-3 font-bold uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xs border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70">
                  Sujet
                </th>
                <th className="px-4 py-3 font-bold uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xs border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70">
                  Message
                </th>
                <th className="px-4 py-3 font-bold uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xs border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70">
                  État
                </th>
                <th className="px-4 py-3 font-bold uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xs border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {currentFeedbacks.length > 0 ? (
                currentFeedbacks.map((feedback, index) => (
                  <React.Fragment key={feedback.id || index}>
                    {/* Main Row */}
                    <tr className="hover:bg-gray-50 border-b transition duration-200">
                      <td className="px-4 py-3 align-middle">{feedback.dateBon}</td>
                      {(isAdmin || isCommercial) && (
                        <td className="px-4 py-3 align-middle font-medium">
                          {feedback.clientName || feedback.client_name}
                        </td>
                      )}
                      <td className="px-4 py-3 align-middle">{feedback.objet}</td>
                      <td className="px-4 py-3 align-middle max-w-xs truncate">
                        {feedback.message}
                      </td>
                      <td className="px-4 py-3 align-middle">
                        {isAdmin || isCommercial ? (
                          <StatusSelect 
                            feedbackId={feedback.id} 
                            currentStatus={feedback.etatFeedBack} 
                          />
                        ) : (
                          getStatusBadge(feedback.etatFeedBack)
                        )}
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <div className="flex items-center space-x-3">
                          <button 
                            type="button" 
                            onClick={() => handleShowMessage(index)}
                            className="flex items-center justify-center w-8 h-8 hover:bg-gray-200 rounded transition"
                            title={selectedRow === index ? "Fermer" : "Voir détails"}
                          >
                            <img 
                              src={selectedRow === index ? closeMessage : ShowMessage} 
                              alt={selectedRow === index ? "close" : "open"} 
                              className="size-4"
                            />
                          </button>
                          
                          {!isAdmin && !isCommercial && (
                            <>
                              <button 
                                type="button" 
                                onClick={() => {
                                  setOperation('update');
                                  setFeedbackId(feedback.id);
                                  setIsOpen(true);
                                }}
                                className="flex items-center justify-center w-8 h-8 hover:bg-blue-100 rounded transition"
                                title="Modifier"
                              >
                                <img src={updateMessage} alt="update" className="size-4"/>
                              </button>
                              <button 
                                type="button" 
                                onClick={() => deleteFeedback(feedback.id)}
                                className="flex items-center justify-center w-8 h-8 hover:bg-red-100 rounded transition"
                                title="Supprimer"
                              >
                                <img src={deleteMessage} alt="delete" className="size-4"/>
                              </button>
                            </>
                          )}
                          
                          {(isAdmin || isCommercial) && feedback.etatFeedBack !== 'clos' && (
                            <button 
                              type="button" 
                              onClick={() => setShowResponseForm(showResponseForm === feedback.id ? null : feedback.id)}
                              className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition"
                            >
                              Répondre
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Message Details Row */}
                    {selectedRow === index && (
                      <tr className="bg-gray-50 border-b">
                        <td colSpan={(isAdmin || isCommercial) ? 6 : 5} className="px-4 py-4">
                          <div className="space-y-4">
                            {/* Response Table (if exists) */}
                            {feedback.reponse && (
                              <div className="overflow-hidden rounded-lg border border-blue-200">
                                <table className="min-w-full">
                                  <thead className="bg-blue-50">
                                    <tr>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-blue-700 uppercase">
                                        Réponse
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr>
                                      <td className="px-4 py-3 bg-white">
                                        <p className="text-gray-700 whitespace-pre-wrap">{feedback.reponse}</p>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}

                    {/* Response Form Row */}
                    {showResponseForm === feedback.id && (
                      <tr className="bg-blue-25 border-b">
                        <td colSpan={(isAdmin || isCommercial) ? 6 : 5} className="px-4 py-4">
                          <div className="space-y-3">
                            <h4 className="font-semibold text-blue-800">Répondre à la réclamation:</h4>
                            <textarea
                              value={responseText}
                              onChange={(e) => setResponseText(e.target.value)}
                              placeholder="Saisissez votre réponse..."
                              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              rows="4"
                            />
                            <div className="flex gap-3">
                              <button
                                onClick={() => handleSendResponse(feedback.id)}
                                className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600 transition font-medium"
                              >
                                Envoyer la réponse
                              </button>
                              <button
                                onClick={() => {
                                  setShowResponseForm(null);
                                  setResponseText('');
                                }}
                                className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-600 transition font-medium"
                              >
                                Annuler
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan={(isAdmin || isCommercial) ? 6 : 5} className="px-4 py-8 text-center">
                    <div className="text-gray-500 text-lg">
                      Aucune réclamation trouvée
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="flex justify-between items-center py-6">
          <button 
            disabled={currentPage === 1} 
            onClick={prevPage}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Précédent
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Page</span>
            <select
              value={currentPage}
              onChange={(e) => setCurrentPage(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Array.from({length: totalPages}, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
            <span className="text-gray-600">sur {totalPages}</span>
          </div>
          
          <button 
            disabled={currentPage === totalPages} 
            onClick={nextPage}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Suivant
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Add Feedback Button */}
      {!isAdmin && !isCommercial && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => {
              setOperation('add');
              setIsOpen(true);
            }}
            className="bg-[#EF0839] hover:bg-[#D90734] text-white font-semibold py-3 px-6 border border-[#EF0839] rounded-lg shadow-sm transition duration-200"
          >
            Ajouter une réclamation
          </button>
        </div>
      )}
      
      {/* Feedback Form Modal */}
      {isOpen && (
        <FeedbackForm
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          operation={operation}
          feedbackId={feedbackId}
          addFeedback={addFeedback}
          modifyFeedback={modifyFeedback}
        />
      )}
    </section>
  );
}