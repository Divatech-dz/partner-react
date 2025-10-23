import { useState, useMemo } from 'react';
import { useReturnsContext } from "../context/ReturnsContext";
import { FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa';
import { IoPrintOutline } from "react-icons/io5";
import ClientProviders from "../providers/ClientProviders.jsx";
import ReturnsProviders from "../providers/ReturnsProviders.jsx";
import { RiFileExcel2Line } from 'react-icons/ri';
import TokenAuth from "../service/TokenAuth.js";

export default function RetourList() {
  return (
    <ClientProviders>
      <ReturnsProviders>
        <RetourListContent />
      </ReturnsProviders>
    </ClientProviders>
  );
}

function RetourListContent() {
  const { returns, deleteReturn } = useReturnsContext();
  const { isAdmin } = TokenAuth();
  const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [openPreview, setOpenPreview] = useState(false);

    // Filter returns based on search
    const filteredReturns = useMemo(() => {
        if (!returns) return [];
        
        return returns.filter(retour => {
            if (!retour) return false;
            const searchLower = search.toLowerCase();
            
            return (
                retour.idBon?.toLowerCase().includes(searchLower) ||
                retour.client?.toLowerCase().includes(searchLower) ||
                (retour.commercial && retour.commercial.toLowerCase().includes(searchLower)) ||
                (retour.user && retour.user.toLowerCase().includes(searchLower)) ||
                retour.date?.toLowerCase().includes(searchLower) ||
                retour.produits?.some(produit => 
                    produit.name?.toLowerCase().includes(searchLower) ||
                    produit.reference?.toLowerCase().includes(searchLower)
                )
            );
        });
    }, [returns, search]);

    // Pagination
    const currentReturns = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        return filteredReturns.slice(startIndex, endIndex);
    }, [filteredReturns, currentPage, pageSize]);

    const totalPages = Math.max(1, Math.ceil(filteredReturns.length / pageSize));

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

    const printReturns = () => {
        const printContents = `
            <div class="p-4 w-full bg-white">
                <div class="py-4 border-b-2 border-red-600">
                    <h1 class="text-2xl font-bold text-red-600">Liste des bons de retour</h1>
                </div>
                <div class="py-1 border-b border-red-600">
                    <h2 class="text-3xl font-bold text-center pb-2 tracking-wider uppercase text-red-600">
                        Liste des bons de retour
                    </h2>
                </div>
                <div class="mt-4">
                    ${currentReturns.map(retour => `
                        <div class="border border-gray-300 rounded-lg p-4 mb-4">
                            <div class="flex justify-between items-center mb-2">
                                <h3 class="text-xl font-bold text-red-600">${retour.idBon || 'N/A'}</h3>
                                <div class="text-sm text-gray-600">
                                    <span class="font-semibold">Date:</span> ${retour.date || 'N/A'}
                                </div>
                            </div>
                            <div class="mb-2">
                                <span class="font-semibold">Client:</span> ${retour.client || 'N/A'}
                            </div>
                            <div class="mb-2">
                                <span class="font-semibold">Commercial:</span> ${retour.commercial || retour.user || 'Non assigné'}
                            </div>
                            <div class="mb-3">
                                <span class="font-semibold">Total:</span> ${(retour.totalprice || 0).toFixed(2)} DZD
                            </div>
                            <div class="border-t pt-2">
                                <h4 class="font-semibold mb-2">Produits:</h4>
                                <table class="w-full text-sm">
                                    <thead class="bg-gray-100">
                                        <tr>
                                            <th class="px-2 py-1 text-left">Produit</th>
                                            <th class="px-2 py-1 text-left">Référence</th>
                                            <th class="px-2 py-1 text-right">Quantité</th>
                                            <th class="px-2 py-1 text-right">Prix unitaire</th>
                                            <th class="px-2 py-1 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${(retour.produits || []).map(produit => `
                                            <tr>
                                                <td class="px-2 py-1">${produit.name || 'N/A'}</td>
                                                <td class="px-2 py-1">${produit.reference || 'N/A'}</td>
                                                <td class="px-2 py-1 text-right">${produit.quantity || 0}</td>
                                                <td class="px-2 py-1 text-right">${(produit.unitprice || 0).toFixed(2)} DZD</td>
                                                <td class="px-2 py-1 text-right">${(produit.totalprice || 0).toFixed(2)} DZD</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Bons de Retour</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    .border-b-2 { border-bottom-width: 2px; }
                    .border-red-600 { border-color: #dc2626; }
                    .text-red-600 { color: #dc2626; }
                </style>
            </head>
            <body>${printContents}</body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    const exportToExcel = () => {
        // Simple CSV export implementation
        const headers = ['ID Bon', 'Date', 'Client', 'Commercial', 'Produit', 'Référence', 'Quantité', 'Prix Unitaire', 'Total Produit', 'Total Bon', 'État', 'Décision'];
        
        const csvData = returns.flatMap(retour => 
            (retour.produits || []).map((produit, index) => {
                const baseRow = [
                    index === 0 ? retour.idBon || '' : '',
                    index === 0 ? retour.date || '' : '',
                    index === 0 ? retour.client || '' : '',
                    index === 0 ? (retour.commercial || retour.user || '') : '',
                    produit.name || '',
                    produit.reference || '',
                    produit.quantity || 0,
                    (produit.unitprice || 0).toFixed(2),
                    (produit.totalprice || 0).toFixed(2),
                    index === 0 ? (retour.totalprice || 0).toFixed(2) : '',
                    index === 0 ? (retour.etat || '') : '',
                    index === 0 ? (retour.decision || '') : ''
                ];
                
                return baseRow;
            })
        );

        const csvContent = [headers, ...csvData]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'bons_retour.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <section className="px-5 bg-white min-h-screen text-black">
            <div className="bg-white rounded-lg shadow-md p-6">
                <h1 className="text-3xl text-center uppercase font-bold py-2 text-red-600">
                    Liste des bons de retour
                </h1>
                
                {/* Search and Actions */}
                <div className="my-4">
                    <div className="flex flex-col sm:flex-row justify-between items-center py-4 gap-4">
                        <div className="flex gap-4">
                            <button 
                                onClick={exportToExcel}
                                className="p-2 bg-green-200 text-green-700 rounded-full hover:bg-green-300 transition" 
                                title="Exporter Excel" 
                                aria-label="Exporter Excel"
                            >
                                <RiFileExcel2Line className="w-8 h-8 " />
                            </button>
                            <button 
                                onClick={printReturns}
                                className="p-2 bg-purple-200 rounded-full text-purple-700 hover:bg-purple-300 transition" 
                                title="Imprimer" 
                                aria-label="Imprimer"
                            >
                                <IoPrintOutline className="w-8 h-8 " />
                            </button>
                        </div>
                        <div className="flex gap-2 w-full sm:w-96">
                            <input
                                type="text"
                                className="px-4 py-2 bg-white text-black border border-gray-300 rounded focus:ring-2 focus:ring-red-600 w-full"
                                placeholder="Rechercher bon, client ou commercial..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setCurrentPage(1);
                                }}
                                aria-label="Rechercher un bon de retour"
                            />
                            <button
                                onClick={() => {
                                    setSearch('');
                                    setCurrentPage(1);
                                }}
                                className="px-2 py-1 bg-gray-300 text-black rounded hover:bg-gray-400 transition"
                                aria-label="Effacer la recherche"
                            >
                                <FaTimes />
                            </button>
                        </div>
                    </div>

                    {/* Returns Table */}
                    <table className="w-full text-black bg-white rounded-lg overflow-hidden shadow-md">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-3 font-bold uppercase text-sm text-red-600">ID Bon</th>
                                <th className="px-4 py-3 font-bold uppercase text-sm text-red-600">Date</th>
                                <th className="px-4 py-3 font-bold uppercase text-sm text-red-600">Client</th>
                                <th className="px-4 py-3 font-bold uppercase text-sm text-red-600">Commercial</th>
                                <th className="px-4 py-3 font-bold uppercase text-sm text-red-600">Total</th>
                                <th className="px-4 py-3 font-bold uppercase text-sm text-red-600">Produits</th>
                                <th className="px-4 py-3 font-bold uppercase text-sm text-red-600">État</th>
                                <th className="px-4 py-3 font-bold uppercase text-sm text-red-600">Décision</th>
                            </tr>
                        </thead>
                        <tbody className="text-md">
                            {currentReturns?.map((retour, index) => (
                                <tr key={index} className="hover:bg-gray-50 transition duration-200 border-b border-gray-200">
                                    <td className="pl-4 py-4 font-semibold">{retour.idBon || 'N/A'}</td>
                                    <td className="pl-4 py-4">{retour.date || 'N/A'}</td>
                                    <td className="pl-4 py-4">{retour.client || 'N/A'}</td>
                                    <td className="pl-4 py-4">
                                        <span className="font-medium text-black bg-blue-100 px-2 py-1 rounded text-sm">
                                            {retour.commercial || retour.user || 'Non assigné'}
                                        </span>
                                    </td>
                                    <td className="py-4 pl-4 text-red-600 font-bold">
                                        {(retour.totalprice || 0).toFixed(2)} DZD
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="space-y-1">
                                            {(retour.produits || []).map((produit, idx) => (
                                                <div key={idx} className="text-sm">
                                                    <span className="font-medium">{produit.name}</span>
                                                    <span className="text-gray-600 ml-2">({produit.reference})</span>
                                                    <span className="text-red-600 ml-2">x{produit.quantity}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            retour.etat === 'Traité' ? 'bg-green-100 text-green-800' :
                                            retour.etat === 'En cours' ? 'bg-yellow-100 text-yellow-800' :
                                            retour.etat === 'En attente' ? 'bg-blue-100 text-blue-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {retour.etat || 'Non défini'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            retour.decision === 'Accepté' ? 'bg-green-100 text-green-800' :
                                            retour.decision === 'Refusé' ? 'bg-red-100 text-red-800' :
                                            retour.decision === 'En attente' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {retour.decision || 'En attente'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {currentReturns.length === 0 && (
                                <tr>
                                    <td colSpan="8" className="text-center py-8 text-gray-600">
                                        {returns.length === 0 ? 'Aucun bon de retour trouvé' : 'Aucun résultat pour votre recherche'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    <div className="flex justify-between items-center py-4">
                        <button 
                            disabled={currentPage === 1} 
                            onClick={prevPage}
                            className="p-2 bg-red-600 rounded-full hover:bg-red-700 transition disabled:opacity-50"
                            aria-label="Page précédente"
                        >
                            <FaChevronLeft className="w-8 h-8 text-white" />
                        </button>
                        <div className="flex items-center gap-2">
                            <span className="text-black">Page</span>
                            <select
                                value={currentPage}
                                onChange={(e) => setCurrentPage(Number(e.target.value))}
                                className="text-center w-16 border rounded bg-white text-black border-gray-300 focus:ring-2 focus:ring-red-600"
                                aria-label="Sélectionner la page"
                            >
                                {Array.from({length: totalPages}, (_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                        {i + 1}
                                    </option>
                                ))}
                            </select>
                            <span className="text-black">sur {totalPages}</span>
                        </div>
                        <button 
                            disabled={currentPage === totalPages} 
                            onClick={nextPage}
                            className="p-2 bg-red-600 rounded-full hover:bg-red-700 transition disabled:opacity-50"
                            aria-label="Page suivante"
                        >
                            <FaChevronRight className="w-8 h-8 text-white" />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}