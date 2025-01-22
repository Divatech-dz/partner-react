import React, {useEffect, useState} from 'react';
import {useReturnsContext} from "../context/ReturnsContext.js";
import TokenAuth from "../service/TokenAuth.js";
import PropTypes from "prop-types";
import erase from "../../public/assets/button/delete.png";
import openProduct from "../../public/assets/button/add.png";
import closeProduct from "../../public/assets/button/close.png";
import next from "../../public/assets/button/next.png";
import previous from "../../public/assets/button/previous.png";

export default function ReturnsNote() {
    const {returns} = useReturnsContext()
    const {isAdmin} = TokenAuth();
    const [search, setSearch] = useState('');
    const [pickDate, setPickDate] = useState('');
    const [selectedRow, setSelectedRow] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);

    const filteredRetours = () => {
        return returns
            .filter(option =>
                (option.idBon.toLowerCase().includes(search.toLowerCase()) ||
                    option.client.toLowerCase().includes(search.toLowerCase()) ||
                    option.idBonLivrison.toLowerCase().includes(search.toLowerCase())) &&
                option.date >= pickDate
            )
            .sort((a, b) => new Date(a.date) - new Date(b.date))
    };

    useEffect(() => {
        currentPage !== 1 && setCurrentPage(1);
    }, [search, pickDate]);

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentRetours = filteredRetours().slice(startIndex, endIndex);

    const totalPages = Math.max(1, Math.ceil(filteredRetours().length / pageSize));

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

    const handleShowProducts = (index) => {
        setSelectedRow(selectedRow === index ? null : index);
    };

    return (
        <section className="w-full overflow-hidden px-4 bg-auto bg-no-repeat bg-center">
            <h1 className="text-3xl text-center uppercase font-bold ">Etat de Retour</h1>
            <div className="py-2 flex justify-center gap-10 border-b px-2">
                <div className="relative">
                    <input type="text" placeholder="Rechercher un bon"
                           className="px-4 py-3 rounded-lg shadow-sm focus:outline-none focus:shadow-outline bg-gray-50 text-gray-600 font-medium w-full"
                           value={search} onChange={(e) => setSearch(e.target.value)}
                    />
                    <button type="button" onClick={() => setSearch('')}
                            className="absolute top-1/2 right-3 transform -translate-y-1/2">
                        <img src={erase} alt="erase" className="size-4"/>
                    </button>
                </div>
                <input type='date' value={pickDate} onChange={event => setPickDate(event.target.value)}/>
            </div>
            <div
                className=" rounded-lg px-2 py-4 overflow-x-auto custom-scrollbar mb-12 bg-white/30 bg-center bg-no-repeat"
                style={{backgroundImage: `url(${('images/bg03.webp')})`}}>
                <table
                    className="items-center w-full mb-0 align-top border-gray-200 text-black backdrop-blur-sm bg-white/30">
                    <thead className="align-bottom border-b-2 bg-gray-100">
                    <tr>
                        <td className="px-1 py-3 font-bold uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70">Bon
                            Retour
                        </td>
                        <td className="px-1 py-3 font-bold uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70">Date
                            Retour
                        </td>
                        <td className="px-1 py-3 font-bold uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70">Bon
                            associé
                        </td>
                        {isAdmin && <td className="px-1 py-3 font-bold uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70">Client</td>}
                        <td className="px-1 py-3 font-bold uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70">Prix
                            total TTC
                        </td>
                        <td className="px-1 py-3 font-bold uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70">Etat</td>
                        <td className="px-1 py-3 font-bold uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70">Decision</td>
                        <td className="px-1 py-3 font-bold uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70">Actions</td>
                    </tr>
                    </thead>
                    <tbody className="text-sm bg-center py-4">
                    {currentRetours?.map((retour, index) => (
                        <React.Fragment key={index}>
                            <tr className="hover:shadow-lg border-b transition duration-200">
                                <td className="py-3 pl-2">{retour.idBon}</td>
                                <td className="py-3 pl-2 capitalize">{retour.date}</td>
                                <td className="py-3 pl-2">{retour.idBonLivrison}</td>
                                {isAdmin &&<td className="py-3 pl-2">{retour.client}</td>}
                                <td className="py-3 pl-2">{retour.totalprice} dzd</td>
                                <td className="py-3 pl-2">{retour.etat}</td>
                                <td className="py-3 pl-2">{retour.decision}</td>
                                <td className="py-3 pl-2 flex items-center space-x-2">
                                    <button type="button" onClick={() => handleShowProducts(index)}>
                                        {selectedRow === index ?
                                            <img src={closeProduct} alt="close" className="size-5"/> :
                                            <img src={openProduct} alt="open" className="size-6"/>
                                        }
                                    </button>
                                </td>
                            </tr>
                            {selectedRow === index && (
                                <tr>
                                    <td colSpan="8">
                                        <table className="w-full">
                                            <thead>
                                            <tr className="bg-gray-100">
                                                <td className="px-1 py-3 font-bold border-r-2 border-r-gray-200 uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70">Produit</td>
                                                <td className="px-1 py-3 font-bold border-r-2 border-r-gray-200 uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70">Référence</td>
                                                <td className="px-1 py-3 font-bold border-r-2 border-r-gray-200 uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70">Prix</td>
                                                <td className="px-1 py-3 font-bold border-r-2 border-r-gray-200 uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70">Quantité</td>
                                                <td className="px-1 py-3 font-bold border-r-2 border-r-gray-200 uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70">Prix
                                                    total
                                                </td>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {retour.produits.map((product, productIndex) => (
                                                <tr key={productIndex}>
                                                    <td className="px-1 py-3 font-bold border-r-2 border-r-gray-200 uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70">{product.name}</td>
                                                    <td className="px-1 py-3 font-bold border-r-2 border-r-gray-200 uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70">{product.reference}</td>
                                                    <td className="px-1 py-3 font-bold border-r-2 border-r-gray-200 uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70">{product.unitprice.toFixed(0)} dzd</td>
                                                    <td className="px-1 py-3 font-bold border-r-2 border-r-gray-200 uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70">{product.quantity}</td>
                                                    <td className="px-1 py-3 font-bold border-r-2 border-r-gray-200 uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70">{product.totalprice.toFixed(0)} dzd</td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                            )}
                            {selectedRow === index &&
                                <p className="text-xl py-2">
                                    Prix total: {retour.totalprice} dzd
                                </p>
                            }
                        </React.Fragment>
                    ))}
                    </tbody>
                </table>
                <div className="flex justify-between py-4">
                    <button disabled={currentPage === 1} onClick={prevPage}>
                        <img src={previous} alt="previous" className="size-10"/>
                    </button>
                    <div>
                        Page
                        <select
                            value={currentPage}
                            onChange={(e) => setCurrentPage(Number(e.target.value))}
                            className="text-center w-16"
                        >
                            {Array.from({length: totalPages}, (_, i) => (<option key={i + 1} value={i + 1}>
                                {i + 1}
                            </option>))}
                        </select>
                        of {totalPages}
                    </div>
                    <button disabled={currentPage === totalPages}
                            onClick={nextPage}>
                        <img src={next} alt="next" className="size-10"/>
                    </button>
                </div>
            </div>
        </section>
    );
};

ReturnsNote.propTypes = {
    reqsRetour: PropTypes.array,
    stocks: PropTypes.array,
};