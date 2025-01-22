import React, {useEffect, useState} from 'react';
import {useFeedbackContext} from "../context/FeedbackContext.js";

import TokenAuth from "../service/TokenAuth.js";
import ShowMessage from "../../public/assets/button/add.png";
import closeMessage from "../../public/assets/button/close.png";
import updateMessage from "../../public/assets/button/update.png";
import deleteMessage from "../../public/assets/button/remove.png";
import erase from "../../public/assets/button/delete.png";
import FeedbackForm from "../components/feedback/FeedbackForm.jsx";

export default function Feedbacks() {
    const {feedbacks, addFeedback, modifyFeedback, deleteFeedback} = useFeedbackContext()
    const {isAdmin} = TokenAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [operation, setOperation] = useState('add');
    const [feedbackId, setFeedbackId] = useState(0)
    const [search, setSearch] = useState('');
    const [pickDate, setPickDate] = useState('');
    const [selectedRow, setSelectedRow] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);

    const filteredFeedbacks = () => {
       if(isAdmin){
         return feedbacks.filter(note => (
                note.clientName.toLowerCase().includes(search.toLowerCase())) &&
            note.date >= pickDate
        ).sort((a, b) => new Date(a.date) - new Date(b.date))
       } else{
           return feedbacks.sort((a, b) => new Date(a.date) - new Date(b.date))
       }
    }

    useEffect(() => {
        currentPage !== 1 && setCurrentPage(1);
    }, [search, pickDate]);

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    const currentFeedback = filteredFeedbacks().slice(startIndex, endIndex);

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

    const onSubmit = (data) => {
        operation === "add" ? addFeedback(data) : modifyFeedback(data, feedbackId);
        setIsOpen(false);
    }

    return (
        <section className="w-full">
            <div className="py-2 mt-4 flex flex-wrap flex-grow justify-between border-b px-2">
                <div>
                    <h1 className="text-3xl uppercase font-bold ">Liste des feedbacks</h1>
                </div>

                <div className='flex justify-center gap-10'>
                    {isAdmin && <div className="relative">
                        <input type="text" placeholder="Rechercher un bon"
                               className="px-4 py-3 rounded-lg shadow-sm focus:outline-none focus:shadow-outline bg-gray-50 text-gray-600 font-medium w-full"
                               value={search} onChange={(e) => setSearch(e.target.value)}
                        />
                        <button type="button" onClick={() => setSearch('')}
                                className="absolute top-1/2 right-3 transform -translate-y-1/2">
                            <img src={erase} alt="erase" className="size-4"/>
                        </button>
                    </div>}
                    <input type='date' value={pickDate}
                           onChange={event => setPickDate(event.target.value)}/>
                </div>

                {!isAdmin &&
                    <button type="button" onClick={() => {
                        setIsOpen(true);
                        setOperation('add');
                    }} className="px-8 py-2 h-10 text-sm font-medium rounded-md hover:text-white hover:bg-red-700 hover:shadow-inner focus:outline-none focus:shadow-outline cursor-pointer">
                        Créer un feedBack
                    </button>}
            </div>
            <table
                className="p-6 w-full border-gray-200 text-black backdrop-blur-sm bg-white/30">
                <thead className="border-b bg-gray-100 text-gray-800 font-semibold px-3">
                <tr>
                    <td className="py-2 pl-2">ID</td>
                    <td className="py-2 pl-2">Date</td>
                    {isAdmin && <td className="py-2 pl-2">Client</td>}
                    <td className="py-2 pl-2">Objet</td>
                    <td className="py-2 pl-2">Status</td>
                    <td className="py-2 pl-2">Action</td>
                </tr>
                </thead>
                <tbody className="">
                {currentFeedback?.map((feedback, index) => (
                    <React.Fragment key={index}>
                        <tr className="hover:shadow-lg border transition duration-200">
                            <td className="py-3 pl-2">{index+1}</td>
                            <td className="py-3 pl-2 capitalize">{feedback.date}</td>
                            {isAdmin &&
                                <td className="py-3 pl-2">{feedback.clientName}</td>}
                            <td className="py-3 pl-2">{feedback.objet}</td>
                            <td className="py-3 pl-2">{feedback.etatFeedBack}</td>
                            <td className="py-3 pl-2 flex items-center space-x-2">
                                <button type="button" className="cursor-pointer"
                                        onClick={() => handleShowMessage(index)}>
                                    {selectedRow === index ?
                                        <img src={closeMessage}
                                             alt="Fermer messager"
                                             className="size-4"/> :
                                        <img src={ShowMessage} alt="Ouvrir message"
                                             className="size-6"/>
                                    }
                                </button>
                                {!isAdmin &&
                                    <div className="flex gap-3">
                                        <button type="button" className="cursor-pointer"
                                                onClick={() => {
                                                    setOperation('update');
                                                    setFeedbackId(feedback.id)
                                                    setIsOpen(true);
                                                }}>
                                            <img src={updateMessage}
                                                 alt="update feedback"
                                                 className="size-6"/>
                                        </button>
                                        <button type="button"
                                                className="cursor-pointer"
                                                onClick={() => deleteFeedback(feedback.id)}
                                        >
                                            <img src={deleteMessage}
                                                 alt="delete feedback"
                                                 className="size-6"/>
                                        </button>
                                    </div>
                                }
                            </td>
                        </tr>
                        {selectedRow === index && (
                            <React.Fragment>
                                <tr>
                                    <th className="px-3 w-20">Message</th>
                                    <td className="p-5">
                                        <p className="w-150 text-gray-800">
                                            {feedback.message}
                                        </p>
                                    </td>
                                </tr>
                            </React.Fragment>
                        )}
                    </React.Fragment>
                ))}
                </tbody>
            </table>

            {
                isOpen && < FeedbackForm setIsOpen={setIsOpen}
                                         operation={operation}
                                         onSubmit={onSubmit}/>
            }
        </section>
    );
};
