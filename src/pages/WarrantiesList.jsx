import React, { useEffect, useState } from 'react';
import { useWarrantiesContext } from "../context/WarrantiesContext.js";
import TokenAuth from "../service/TokenAuth.js";
import erase from "../assets/button/delete.png";
import openProduct from "../assets/button/add.png";
import closeProduct from "../assets/button/close.png";
import ClientProviders from "../providers/ClientProviders.jsx";
import WarrantiesProviders from "../providers/WarrantiesProviders.jsx";

export default function WarrantiesList() {
  return (
    <ClientProviders>
      <WarrantiesProviders>
        <WarrantiesListContent />
      </WarrantiesProviders>
    </ClientProviders>
  );
}

function WarrantiesListContent() {
  const { warranties = [] } = useWarrantiesContext();
  const { isAdmin } = TokenAuth();
    const [search, setSearch] = useState('');
    const [pickDate, setPickDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [selectedRow, setSelectedRow] = useState(null);

    const filteredWarranties = () => {
        return warranties
            .filter(option => {
                if (!option) return false;
                const idMatch = option.idBon?.toLowerCase().includes(search.toLowerCase()) || false;
                const clientMatch = option.client?.toLowerCase().includes(search.toLowerCase()) || false;
                const bonMatch = option.idBonLivrison?.toLowerCase().includes(search.toLowerCase()) || false;
                const dateMatch = !pickDate || option.date >= pickDate;
                return (idMatch || clientMatch || bonMatch) && dateMatch;
            })
            .sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
    };

    useEffect(() => {
        if (currentPage !== 1) {
            setCurrentPage(1);
        }
    }, [search, pickDate]);

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentWarranties = filteredWarranties().slice(startIndex, endIndex);

    const totalPages = Math.max(1, Math.ceil(filteredWarranties().length / pageSize));

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
    }

    return (
        <section className="flex flex-col gap-4 w-full overflow-hidden px-4 bg-auto bg-no-repeat bg-center">
            <h1 className="text-3xl text-center uppercase font-bold">Bon de garanties</h1>
            <div className="py-2 flex justify-center gap-6 border-b px-2">
                <div className="relative">
                    <input 
                        type="text" 
                        placeholder="Rechercher un bon"
                        className="px-4 py-3 rounded-lg shadow-sm focus:outline-none focus:shadow-outline bg-gray-50 text-gray-600 font-medium w-full"
                        value={search} 
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                        <button 
                            type="button" 
                            onClick={() => setSearch('')}
                            className="absolute top-1/2 right-3 transform -translate-y-1/2"
                        >
                            <img src={erase} alt="erase" className="size-4"/>
                        </button>
                    )}
                </div>
                <input 
                    type='date' 
                    value={pickDate} 
                    onChange={event => setPickDate(event.target.value)}
                    className="px-4 py-3 rounded-lg border border-gray-300"
                />
            </div>
            
            {warranties.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-500">Aucun bon de garantie trouvé</p>
                </div>
            ) : (
                <>
                    <table className="items-center overflow-hidden w-full mb-0 align-top border-gray-200 text-black">
                        <thead className="align-bottom border-b-2 bg-gray-100">
                        <tr>
                            <td className="px-1 py-3 font-bold uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70">
                                Bon de garantie
                            </td>
                            <td className="px-1 py-3 font-bold uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70">
                                Date de bon
                            </td>
                            <td className="px-1 py-3 font-bold uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70">
                                Bon associé
                            </td>
                            {isAdmin && (
                                <td className="px-1 py-3 font-bold uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70">
                                    Client
                                </td>
                            )}
                            <td className="px-1 py-3 font-bold uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70">
                                temps écoulé
                            </td>
                            <td className="px-6 py-3 font-bold text-center uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70">
                                Actions
                            </td>
                        </tr>
                        </thead>
                        <tbody className="text-sm bg-center py-4">
                        {currentWarranties.map((warranty, index) => (
                            <React.Fragment key={index}>
                                <tr className="hover:shadow-lg border-b transition duration-200">
                                    <td className="py-3 pl-2">{warranty.idBon || 'N/A'}</td>
                                    <td className="py-3 pl-2">{warranty.date || 'N/A'}</td>
                                    <td className="py-3 pl-2">{warranty.idBonLivrison || 'N/A'}</td>
                                    {isAdmin && <td className="py-3 pl-2">{warranty.client || 'N/A'}</td>}
                                    <td className="py-3 pl-2">
                                        {(warranty.tps_ecoule > 0) && `${warranty.tps_ecoule} jours`}
                                    </td>
                                    <td className="py-3 pl-2 flex justify-center items-center space-x-2">
                                        <button 
                                            type="button" 
                                            onClick={() => handleShowProducts(index)}
                                            className="p-1 hover:bg-gray-100 rounded"
                                        >
                                            {selectedRow === index ?
                                                <img src={closeProduct} alt="close" className="size-4"/> :
                                                <img src={openProduct} alt="open" className="size-6"/>
                                            }
                                        </button>
                                    </td>
                                </tr>
                                {selectedRow === index && warranty.produits && (
                                    <tr>
                                        <td colSpan={isAdmin ? 6 : 5}>
                                            <table className="w-full border-2 mt-2">
                                                <thead>
                                                <tr className="bg-gray-100">
                                                    <td className="px-1 py-3 w-10 font-bold border-r-2 border-r-gray-200 uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70">
                                                        Produit
                                                    </td>
                                                    <td className="px-1 py-3 w-20 font-bold border-r-2 border-r-gray-200 uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70">
                                                        Référence
                                                    </td>
                                                    <td className="px-1 py-3 w-10 font-bold border-r-2 border-r-gray-200 uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70">
                                                        Quantité
                                                    </td>
                                                    <td className="px-1 py-3 w-40 font-bold border-r-2 border-r-gray-200 uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70">
                                                        Numéros de série
                                                    </td>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {warranty.produits.map((product, productIndex) => (
                                                    <tr key={productIndex}>
                                                        <td className="px-1 py-3 border-r-2 border-r-gray-200 align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap">
                                                            {product.name || 'N/A'}
                                                        </td>
                                                        <td className="px-1 py-3 border-r-2 border-r-gray-200 align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap">
                                                            {product.reference || 'N/A'}
                                                        </td>
                                                        <td className="px-1 py-3 border-r-2 border-r-gray-200 align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap">
                                                            {product.quantity || 0}
                                                        </td>
                                                        <td className="px-1 py-3 border-r-2 border-r-gray-200 align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap">
                                                            {product.NumeroSeries ? 
                                                                product.NumeroSeries.split(",").map((num, idx) => (
                                                                    <div key={idx}>{num.replace(/['[\]]/g, "").trim()}</div>
                                                                )) : 
                                                                'Aucun numéro'
                                                            }
                                                        </td>
                                                    </tr>
                                                ))}
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                        </tbody>
                    </table>

                    <div className="flex justify-between items-center py-4">
                        <button 
                            disabled={currentPage === 1} 
                            onClick={prevPage}
                            className="disabled:opacity-50 p-2"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                        <div className="flex items-center gap-2">
                            Page
                            <select
                                value={currentPage}
                                onChange={(e) => setCurrentPage(Number(e.target.value))}
                                className="text-center w-16 border rounded py-1"
                            >
                                {Array.from({length: totalPages}, (_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                        {i + 1}
                                    </option>
                                ))}
                            </select>
                            sur {totalPages}
                        </div>
                        <button 
                            disabled={currentPage === totalPages} 
                            onClick={nextPage}
                            className="disabled:opacity-50 p-2"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                    </div>
                </>
            )}
        </section>
    );
}