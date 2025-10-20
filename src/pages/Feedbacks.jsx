import React, {useEffect, useState} from 'react';
import {useFeedbackContext} from "../context/FeedbackContext.js";
import TokenAuth from "../service/TokenAuth.js";
import ShowMessage from "../assets/button/add.png";
import closeMessage from "../assets/button/close.png";
import updateMessage from "../assets/button/update.png";
import deleteMessage from "../assets/button/remove.png";
import erase from "../assets/button/delete.png";
import FeedbackForm from "../components/feedback/FeedbackForm.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";


export default function Feedbacks() {
    const { feedbacks = [], addFeedback, modifyFeedback, deleteFeedback } = useFeedbackContext();
    const { isAdmin } = TokenAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [operation, setOperation] = useState('add');
    const [feedbackId, setFeedbackId] = useState(0);
    const [search, setSearch] = useState('');
    const [pickDate, setPickDate] = useState('');
    const [selectedRow, setSelectedRow] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);

    // Add loading state
    if (!feedbacks) {
        return <LoadingSpinner />;
    }

    const filteredFeedbacks = () => {
        if (isAdmin) {
            return feedbacks
                .filter(note => 
                    (note.clientName?.toLowerCase().includes(search.toLowerCase()) || false) &&
                    (!pickDate || note.date >= pickDate)
                )
                .sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
        } else {
            return feedbacks.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
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

    return (
        <section className="px-10">
            <h1 className="text-3xl text-center uppercase py-4 font-bold">Liste des réclamations</h1>
            <div className="flex flex-col gap-2">
                <div className='flex justify-center gap-10'>
                    {isAdmin && (
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
                <table className="items-center w-full mb-0 align-top border-gray-200 text-black backdrop-blur-sm bg-white/30">
                    <thead className="align-bottom border-b-2 bg-gray-100">
                    <tr>
                        <td className="px-1 py-3 font-bold uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70">
                            Date
                        </td>
                        {isAdmin && (
                            <td className="px-1 py-3 font-bold uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70">
                                Client
                            </td>
                        )}
                        <td className="px-1 py-3 font-bold uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70">
                            Sujet
                        </td>
                        <td className="px-1 py-3 font-bold uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70">
                            Actions
                        </td>
                    </tr>
                    </thead>
                    <tbody className="text-sm bg-center py-4">
                    {currentFeedbacks.length > 0 ? (
                        currentFeedbacks.map((feedback, index) => (
                            <React.Fragment key={index}>
                                <tr className="hover:shadow-lg border-b transition duration-200">
                                    <td className="py-3 pl-2">{feedback.date}</td>
                                    {isAdmin && <td className="py-3 pl-2">{feedback.clientName}</td>}
                                    <td className="py-3 pl-2">{feedback.subject}</td>
                                    <td className="py-3 pl-2 flex items-center space-x-2">
                                        <button type="button" onClick={() => handleShowMessage(index)}>
                                            {selectedRow === index ? 
                                                <img src={closeMessage} alt="close" className="size-4"/> : 
                                                <img src={ShowMessage} alt="open" className="size-6"/>
                                            }
                                        </button>
                                        {!isAdmin && (
                                            <>
                                                <button 
                                                    type="button" 
                                                    onClick={() => {
                                                        setOperation('update');
                                                        setFeedbackId(feedback.id);
                                                        setIsOpen(true);
                                                    }}
                                                >
                                                    <img src={updateMessage} alt="update" className="size-6"/>
                                                </button>
                                                <button 
                                                    type="button" 
                                                    onClick={() => deleteFeedback(feedback.id)}
                                                >
                                                    <img src={deleteMessage} alt="delete" className="size-6"/>
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                                {selectedRow === index && (
                                    <tr>
                                        <td colSpan={isAdmin ? 4 : 3}>
                                            <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
                                                <p className="text-gray-700 whitespace-pre-wrap">{feedback.message}</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={isAdmin ? 4 : 3} className="py-4 text-center">
                                Aucune réclamation trouvée
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
                <div className="flex justify-between py-4">
                    <button disabled={currentPage === 1} onClick={prevPage}>
                        <svg id="chevrons-left_24" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
                            <rect width="24" height="24" stroke="none" fill="#000000" opacity="0"/>
                            <g transform="matrix(1 0 0 1 12 12)">
                                <g>
                                    <g transform="matrix(1 0 0 1 0 0)">
                                        <path
                                            style={{
                                                stroke: 'none',
                                                strokeWidth: 2,
                                                strokeDasharray: 'none',
                                                strokeLinecap: 'round',
                                                strokeDashoffset: 0,
                                                strokeLinejoin: 'round',
                                                strokeMiterlimit: 4,
                                                fill: 'none',
                                                fillRule: 'nonzero',
                                                opacity: 1
                                            }}
                                            transform="translate(-12, -12)"
                                            d="M 0 0 L 24 0 L 24 24 L 0 24 z"
                                            strokeLinecap="round"
                                        />
                                    </g>
                                    <g transform="matrix(1 0 0 1 -3.75 -0.25)">
                                        <polyline
                                            style={{
                                                stroke: 'rgb(0,0,0)',
                                                strokeWidth: 1.5,
                                                strokeDasharray: 'none',
                                                strokeLinecap: 'round',
                                                strokeDashoffset: 0,
                                                strokeLinejoin: 'round',
                                                strokeMiterlimit: 4,
                                                fill: 'none',
                                                fillRule: 'nonzero',
                                                opacity: 1
                                            }}
                                            points="2.5,-5 -2.5,0 2.5,5"
                                        />
                                    </g>
                                    <g transform="matrix(1 0 0 1 2.25 -0.25)">
                                        <polyline
                                            style={{
                                                stroke: 'rgb(0,0,0)',
                                                strokeWidth: 1.5,
                                                strokeDasharray: 'none',
                                                strokeLinecap: 'round',
                                                strokeDashoffset: 0,
                                                strokeLinejoin: 'round',
                                                strokeMiterlimit: 4,
                                                fill: 'none',
                                                fillRule: 'nonzero',
                                                opacity: 1
                                            }}
                                            points="2.5,-5 -2.5,0 2.5,5"
                                        />
                                    </g>
                                </g>
                            </g>
                        </svg>
                    </button>
                    <div>
                        Page
                        <select
                            value={currentPage}
                            onChange={(e) => setCurrentPage(Number(e.target.value))}
                            className="text-center w-16"
                        >
                            {Array.from({length: totalPages}, (_, i) => (
                                <option key={i + 1} value={i + 1}>
                                    {i + 1}
                                </option>
                            ))}
                        </select>
                        of {totalPages}
                    </div>
                    <button disabled={currentPage === totalPages} onClick={nextPage}>
                        <svg id="chevrons-right_24" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
                            <rect width="24" height="24" stroke="none" fill="#000000" opacity="0"/>
                            <g transform="matrix(1 0 0 1 12 12)">
                                <g>
                                    <g transform="matrix(1 0 0 1 0 0)">
                                        <path
                                            style={{
                                                stroke: 'none',
                                                strokeWidth: 2,
                                                strokeDasharray: 'none',
                                                strokeLinecap: 'round',
                                                strokeDashoffset: 0,
                                                strokeLinejoin: 'round',
                                                strokeMiterlimit: 4,
                                                fill: 'none',
                                                fillRule: 'nonzero',
                                                opacity: 1
                                            }}
                                            transform="translate(-12, -12)"
                                            d="M 0 0 L 24 0 L 24 24 L 0 24 z"
                                            strokeLinecap="round"
                                        />
                                    </g>
                                    <g transform="matrix(1 0 0 1 -2.75 -0.25)">
                                        <polyline
                                            style={{
                                                stroke: 'rgb(0,0,0)',
                                                strokeWidth: 1.5,
                                                strokeDasharray: 'none',
                                                strokeLinecap: 'round',
                                                strokeDashoffset: 0,
                                                strokeLinejoin: 'round',
                                                strokeMiterlimit: 4,
                                                fill: 'none',
                                                fillRule: 'nonzero',
                                                opacity: 1
                                            }}
                                            points="-2.5,-5 2.5,0 -2.5,5"
                                        />
                                    </g>
                                    <g transform="matrix(1 0 0 1 3.25 -0.25)">
                                        <polyline
                                            style={{
                                                stroke: 'rgb(0,0,0)',
                                                strokeWidth: 1.5,
                                                strokeDasharray: 'none',
                                                strokeLinecap: 'round',
                                                strokeDashoffset: 0,
                                                strokeLinejoin: 'round',
                                                strokeMiterlimit: 4,
                                                fill: 'none',
                                                fillRule: 'nonzero',
                                                opacity: 1
                                            }}
                                            points="-2.5,-5 2.5,0 -2.5,5"
                                        />
                                    </g>
                                </g>
                            </g>
                        </svg>
                    </button>
                </div>
            </div>
            {!isAdmin && (
                <div className="flex justify-center mt-8">
                    <button
                        onClick={() => {
                            setOperation('add');
                            setIsOpen(true);
                        }}
                        className="bg-[#EF0839] hover:bg-[#EF0839] text-white font-semibold py-2 px-4 border border-[#EF0839] rounded shadow-sm"
                    >
                        Ajouter une réclamation
                    </button>
                </div>
            )}
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