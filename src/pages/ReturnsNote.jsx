import React, { useEffect, useState } from 'react';
import { useReturnsContext } from "../context/ReturnsContext.js";
import TokenAuth from "../service/TokenAuth.js";
import erase from "../assets/button/delete.png";
import openProduct from "../assets/button/add.png";
import closeProduct from "../assets/button/close.png";
import next from "../assets/button/next.png";
import previous from "../assets/button/previous.png";
import ClientProviders from "../providers/ClientProviders.jsx";
import ReturnsProviders from "../providers/ReturnsProviders.jsx";

export default function ReturnsNote() {
  return (
    <ClientProviders>
      <ReturnsProviders>
        <ReturnsNoteContent />
      </ReturnsProviders>
    </ClientProviders>
  );
}

function ReturnsNoteContent() {
  const { returns = [] } = useReturnsContext();
  const { isAdmin } = TokenAuth();
  const [search, setSearch] = useState('');
  const [pickDate, setPickDate] = useState('');
  const [selectedRow, setSelectedRow] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

    const filteredRetours = () => {
        return returns
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
            
            {returns.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-500">Aucun retour trouvé</p>
                </div>
            ) : (
                <div className="rounded-lg px-2 py-4 overflow-x-auto custom-scrollbar mb-12 bg-white/30 bg-center bg-no-repeat">
                    <table className="items-center w-full mb-0 align-top border-gray-200 text-black backdrop-blur-sm bg-white/30">
                        <thead className="align-bottom border-b-2 bg-gray-100">
                        <tr>
                            <td className="px-1 py-3 font-bold uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70">
                                Bon Retour
                            </td>
                            <td className="px-1 py-3 font-bold uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70">
                                Date Retour
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
                                Prix total TTC
                            </td>
                            <td className="px-1 py-3 font-bold uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70">
                                Etat
                            </td>
                            <td className="px-1 py-3 font-bold uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70">
                                Decision
                            </td>
                            <td className="px-1 py-3 font-bold uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70">
                                Actions
                            </td>
                        </tr>
                        </thead>
                        <tbody className="text-sm bg-center py-4">
                        {currentRetours.map((retour, index) => (
                            <React.Fragment key={index}>
                                <tr className="hover:shadow-lg border-b transition duration-200">
                                    <td className="py-3 pl-2">{retour.idBon || 'N/A'}</td>
                                    <td className="py-3 pl-2 capitalize">{retour.date || 'N/A'}</td>
                                    <td className="py-3 pl-2">{retour.idBonLivrison || 'N/A'}</td>
                                    {isAdmin && <td className="py-3 pl-2">{retour.client || 'N/A'}</td>}
                                    <td className="py-3 pl-2">{retour.totalprice || 0} dzd</td>
                                    <td className="py-3 pl-2">{retour.etat || 'N/A'}</td>
                                    <td className="py-3 pl-2">{retour.decision || 'N/A'}</td>
                                    <td className="py-3 pl-2 flex items-center space-x-2">
                                        <button 
                                            type="button" 
                                            onClick={() => handleShowProducts(index)}
                                            className="p-1 hover:bg-gray-100 rounded"
                                        >
                                            {selectedRow === index ?
                                                <img src={closeProduct} alt="close" className="size-5"/> :
                                                <img src={openProduct} alt="open" className="size-6"/>
                                            }
                                        </button>
                                    </td>
                                </tr>
                                {selectedRow === index && retour.produits && (
                                    <tr>
                                        <td colSpan={isAdmin ? 8 : 7}>
                                            <table className="w-full mt-2">
                                                <thead>
                                                <tr className="bg-gray-100">
                                                    <td className="px-1 py-3 font-bold border-r-2 border-r-gray-200 uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70">
                                                        Produit
                                                    </td>
                                                    <td className="px-1 py-3 font-bold border-r-2 border-r-gray-200 uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70">
                                                        Référence
                                                    </td>
                                                    <td className="px-1 py-3 font-bold border-r-2 border-r-gray-200 uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70">
                                                        Prix
                                                    </td>
                                                    <td className="px-1 py-3 font-bold border-r-2 border-r-gray-200 uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70">
                                                        Quantité
                                                    </td>
                                                    <td className="px-1 py-3 font-bold border-r-2 border-r-gray-200 uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70">
                                                        Prix total
                                                    </td>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {retour.produits.map((product, productIndex) => (
                                                    <tr key={productIndex}>
                                                        <td className="px-1 py-3 border-r-2 border-r-gray-200 align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap">
                                                            {product.name || 'N/A'}
                                                        </td>
                                                        <td className="px-1 py-3 border-r-2 border-r-gray-200 align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap">
                                                            {product.reference || 'N/A'}
                                                        </td>
                                                        <td className="px-1 py-3 border-r-2 border-r-gray-200 align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap">
                                                            {(product.unitprice || 0).toFixed(0)} dzd
                                                        </td>
                                                        <td className="px-1 py-3 border-r-2 border-r-gray-200 align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap">
                                                            {product.quantity || 0}
                                                        </td>
                                                        <td className="px-1 py-3 border-r-2 border-r-gray-200 align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap">
                                                            {(product.totalprice || 0).toFixed(0)} dzd
                                                        </td>
                                                    </tr>
                                                ))}
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                )}
                                {selectedRow === index && (
                                    <tr>
                                        <td colSpan={isAdmin ? 8 : 7}>
                                            <p className="text-xl py-2 font-semibold">
                                                Prix total: {retour.totalprice || 0} dzd
                                            </p>
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
                            className="disabled:opacity-50"
                        >
                            <img src={previous} alt="previous" className="size-10"/>
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
                            className="disabled:opacity-50"
                        >
                            <img src={next} alt="next" className="size-10"/>
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
}