import { useDeliveryContext } from "../context/DeliveryContext.js";
import { useClientContext } from "../context/ClientContext.js";
import { useReturnsContext } from "../context/ReturnsContext.js";
import React, { useEffect, useState } from "react";
import TokenAuth from "../service/TokenAuth.js";
import openProduct from "../assets/button/add.png";
import closeProduct from "../assets/button/close.png";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

export default function DeliveryList() {
    const { deliveryNotes } = useDeliveryContext();
    const { userClient } = useClientContext();
    const { returns, createBonReturn } = useReturnsContext();
    const { isAdmin, token } = TokenAuth();
    const [search, setSearch] = useState('');
    const [pickDate, setPickDate] = useState('');
    const [selectedRow, setSelectedRow] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [selectedDelivery, setSelectedDelivery] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showReturnList, setShowReturnList] = useState({});
    const [serialNumber, setSerialNumber] = useState('');
    const [productImage, setProductImage] = useState(null);
    const [uploading, setUploading] = useState(false);

    if (!deliveryNotes) {
        return <LoadingSpinner />;
    }

    const filteredNotes = () => {
        return deliveryNotes.filter(note => (
            note.idBon.toLowerCase().includes(search.toLowerCase()) ||
            note.client.toLowerCase().includes(search.toLowerCase())) &&
            note.date >= pickDate
        ).sort((a, b) => new Date(a.date) - new Date(b.date))
    }

    useEffect(() => {
        currentPage !== 1 && setCurrentPage(1);
    }, [search, pickDate]);

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentNotes = filteredNotes().slice(startIndex, endIndex);
    const totalPages = Math.max(1, Math.ceil(filteredNotes().length / pageSize));

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

    const handleAddReturn = (deliveryNote, product = null) => {
        setSelectedDelivery(deliveryNote);
        setSelectedProduct(product);
        setSerialNumber('');
        setProductImage(null);
        setShowReturnModal(true);
    }

    const handleShowReturnList = (deliveryId) => {
        setShowReturnList(prev => ({
            ...prev,
            [deliveryId]: !prev[deliveryId]
        }));
    }

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Veuillez sélectionner un fichier image valide');
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('La taille du fichier ne doit pas dépasser 5MB');
                return;
            }

            setProductImage({
                file,
                preview: URL.createObjectURL(file),
                name: file.name,
                size: file.size
            });
        }
    };

    const removeImage = () => {
        if (productImage) {
            URL.revokeObjectURL(productImage.preview);
            setProductImage(null);
        }
    };

  const handleCreateReturn = async () => {
    if (!selectedProduct) {
        alert("Veuillez sélectionner un produit");
        return;
    }

    if (!serialNumber.trim()) {
        alert("Veuillez saisir le numéro de série");
        return;
    }

    setUploading(true);

    try {
        // CORRECTION: Structure simplifiée pour correspondre à votre API
        const newReturnNote = {
            idBonLivraison: selectedDelivery.idBon,
            client_name: selectedDelivery.client,
          
            dateBon: new Date().toISOString().split('T')[0],
           
            total: selectedProduct.unitprice,
            // Données produit séparées
            produit: {
                reference: selectedProduct.reference,
                unitprice: selectedProduct.unitprice,
                quantity: 1,
                totalprice: selectedProduct.unitprice,
                 numseries: serialNumber.trim(),
            },
            // Fichier image
            image: productImage ? productImage.file : null
        };

        console.log('🔄 Données envoyées au serveur:', newReturnNote);

        // Utiliser le contexte ReturnsProvider pour créer le retour
        await createBonReturn(newReturnNote);
        
        alert(`✅ Bon de retour créé pour ${selectedProduct.name}\nNuméro de série: ${serialNumber}`);
        
        resetReturnForm();

    } catch (error) {
        console.error('❌ Erreur détaillée:', error);
        alert('Erreur lors de la création du bon de retour. Voir la console pour les détails.');
    } finally {
        setUploading(false);
    }
}
    const getDeliveryReturns = (deliveryId) => {
        return returns.filter(returnNote => returnNote.deliveryId === deliveryId || returnNote.id_bonlivraison === deliveryId);
    }

    const resetReturnForm = () => {
        setShowReturnModal(false);
        setSelectedProduct(null);
        setSerialNumber('');
        setProductImage(null);
        setUploading(false);
    }

    return (
        <section className="px-6 py-6 w-full mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-black mb-2">Liste des Bons de Livraison</h1>
            </div>

            {/* Search and Filters */}
            <div className="mb-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative flex-1 max-w-md">
                        <input 
                            type="text" 
                            placeholder="Rechercher un bon ou client..."
                            className="px-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-black"
                            value={search} 
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        {search && (
                            <button 
                                type="button" 
                                onClick={() => setSearch('')}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                                <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                    
                    <input 
                        type='date' 
                        value={pickDate} 
                        onChange={event => setPickDate(event.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-black"
                    />
                </div>
            </div>

            {/* Delivery Notes Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left font-semibold text-black">N° Bon</th>
                                <th className="px-4 py-3 text-left font-semibold text-black">Date</th>
                                {isAdmin && <th className="px-4 py-3 text-left font-semibold text-black">Client</th>}
                                <th className="px-4 py-3 text-left font-semibold text-black">Prix Total</th>
                                <th className="px-4 py-3 text-left font-semibold text-black">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {currentNotes?.map((note, index) => {
                                const deliveryReturns = getDeliveryReturns(note.idBon);
                                const hasReturns = deliveryReturns.length > 0;
                                
                                return (
                                    <React.Fragment key={index}>
                                        <tr className="hover:bg-gray-50">
                                            <td className="px-4 py-3">
                                                <span className="font-medium text-black">{note.idBon}</span>
                                            </td>
                                            <td className="px-4 py-3 text-black">{note.date}</td>
                                            {isAdmin && (
                                                <td className="px-4 py-3 text-black">{note.client}</td>
                                            )}
                                            <td className="px-4 py-3">
                                                <span className="font-semibold text-black">{note.totalprice.toFixed(0)} dzd</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    {/* Bon de retour button */}
                                                    <button 
                                                        type="button" 
                                                        onClick={() => handleAddReturn(note)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Créer un bon de retour"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                    </button>

                                                    {/* View returns button */}
                                                    {hasReturns && (
                                                        <button 
                                                            type="button" 
                                                            onClick={() => handleShowReturnList(note.idBon)}
                                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                            title={showReturnList[note.idBon] ? 'Masquer les retours' : 'Voir les retours'}
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                    
                                                    {/* Show products button */}
                                                    <button 
                                                        type="button" 
                                                        onClick={() => handleShowProducts(index)} 
                                                        className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                                    >
                                                        {selectedRow === index ? (
                                                            <img src={closeProduct} alt="Fermer" className="size-5" />
                                                        ) : (
                                                            <img src={openProduct} alt="Ouvrir" className="size-5" />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        
                                        {/* Products Section */}
                                        {selectedRow === index && (
                                            <tr>
                                                <td colSpan={isAdmin ? 5 : 4} className="p-0">
                                                    <div className="bg-gray-50 p-4">
                                                        <h3 className="font-semibold text-black mb-3">Produits</h3>
                                                        <div className="overflow-hidden rounded border border-gray-200">
                                                            <table className="w-full">
                                                                <thead className="bg-gray-100">
                                                                    <tr>
                                                                        <th className="px-3 py-2 text-left text-sm font-semibold text-black">Produit</th>
                                                                        <th className="px-3 py-2 text-left text-sm font-semibold text-black">Référence</th>
                                                                        <th className="px-3 py-2 text-left text-sm font-semibold text-black">Prix Unitaire</th>
                                                                        <th className="px-3 py-2 text-left text-sm font-semibold text-black">Quantité</th>
                                                                        <th className="px-3 py-2 text-left text-sm font-semibold text-black">Prix Total</th>
                                                                        <th className="px-3 py-2 text-left text-sm font-semibold text-black">Actions</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-gray-200">
                                                                    {note.produits.map((product, productIndex) => (
                                                                        <tr key={productIndex} className="hover:bg-white">
                                                                            <td className="px-3 py-2 font-medium text-black">{product.name}</td>
                                                                            <td className="px-3 py-2 text-black">{product.reference}</td>
                                                                            <td className="px-3 py-2 font-semibold text-black">{product.unitprice.toFixed(0)} dzd</td>
                                                                            <td className="px-3 py-2">
                                                                                <span className="px-2 py-1 bg-red-100 text-black rounded text-sm">
                                                                                    {product.quantity}
                                                                                </span>
                                                                            </td>
                                                                            <td className="px-3 py-2 font-semibold text-black">{product.totalprice.toFixed(0)} dzd</td>
                                                                            <td className="px-3 py-2">
                                                                                <button 
                                                                                    type="button" 
                                                                                    onClick={() => handleAddReturn(note, product)}
                                                                                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                                                    title="Créer un bon de retour pour ce produit"
                                                                                >
                                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                                    </svg>
                                                                                </button>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}

                                        {/* Return Notes Section */}
                                        {showReturnList[note.idBon] && hasReturns && (
                                            <tr>
                                                <td colSpan={isAdmin ? 5 : 4} className="p-0">
                                                    <div className="bg-red-50 p-4 border-t">
                                                        <h3 className="font-semibold text-black mb-3">Bons de retour pour {note.idBon}</h3>
                                                        <div className="space-y-2">
                                                            {deliveryReturns.map((returnNote, returnIndex) => (
                                                                <div key={returnIndex} className="bg-white rounded border border-red-200 p-3">
                                                                    <div className="flex justify-between items-start">
                                                                        <div>
                                                                            <p className="font-semibold text-black">{returnNote.id}</p>
                                                                            <p className="text-sm text-black">Date: {returnNote.date}</p>
                                                                            <p className="text-sm text-black mt-1">
                                                                                {returnNote.product?.name || 'Produit non spécifié'} - {returnNote.product?.unitprice?.toFixed(0) || '0'} dzd
                                                                            </p>
                                                                            {returnNote.serialNumber && (
                                                                                <p className="text-sm text-black">
                                                                                    N° série: {returnNote.serialNumber}
                                                                                </p>
                                                                            )}
                                                                            {returnNote.image && (
                                                                                <p className="text-xs text-gray-600">
                                                                                    Image disponible
                                                                                </p>
                                                                            )}
                                                                            <p className="text-xs text-gray-600">
                                                                                Client: {returnNote.client_name}
                                                                            </p>
                                                                        </div>
                                                                        <span className="font-bold text-black">
                                                                            {returnNote.total?.toFixed(0) || '0'} dzd
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-4 py-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                        <button 
                            onClick={prevPage} 
                            disabled={currentPage === 1}
                            className="px-3 py-1 text-sm text-black border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                        >
                            Précédent
                        </button>
                        
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-black">
                                Page {currentPage} sur {totalPages}
                            </span>
                            <select
                                value={currentPage}
                                onChange={(e) => setCurrentPage(Number(e.target.value))}
                                className="px-2 py-1 border border-gray-300 rounded text-sm text-black"
                            >
                                {Array.from({length: totalPages}, (_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                        {i + 1}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <button 
                            onClick={nextPage} 
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 text-sm text-black border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                        >
                            Suivant
                        </button>
                    </div>
                </div>
            </div>

            {/* Return Modal */}
            {showReturnModal && selectedDelivery && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-4 border-b">
                            <h2 className="text-lg font-semibold text-black">Créer un bon de retour</h2>
                            <p className="text-sm text-black">Pour le bon: {selectedDelivery.idBon}</p>
                            <p className="text-sm text-black">Client: {selectedDelivery.client}</p>
                        </div>
                        
                        <div className="p-4">
                            {/* Product Selection */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-black mb-2">
                                    Sélectionner un produit
                                </label>
                                <div className="space-y-2 max-h-40 overflow-y-auto border rounded p-2">
                                    {selectedDelivery.produits.map((product, index) => (
                                        <div key={index} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                                            <input
                                                type="radio"
                                                name="selectedProduct"
                                                checked={selectedProduct?.reference === product.reference}
                                                onChange={() => setSelectedProduct(product)}
                                                className="text-red-600"
                                            />
                                            <div className="flex-1">
                                                <p className="font-medium text-black">{product.name}</p>
                                                <p className="text-sm text-black">{product.reference}</p>
                                            </div>
                                            <span className="font-semibold text-black">{product.unitprice.toFixed(0)} dzd</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Serial Number Input */}
                            {selectedProduct && (
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-black mb-2">
                                        Numéro de série *
                                    </label>
                                    <input
                                        type="text"
                                        value={serialNumber}
                                        onChange={(e) => setSerialNumber(e.target.value)}
                                        placeholder="Saisir le numéro de série du produit"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-black"
                                        required
                                    />
                                </div>
                            )}

                            {/* Image Upload */}
                            {selectedProduct && (
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-black mb-2">
                                        Photo du produit
                                    </label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                        {!productImage ? (
                                            <>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageUpload}
                                                    className="hidden"
                                                    id="product-image"
                                                />
                                                <label 
                                                    htmlFor="product-image"
                                                    className="cursor-pointer block text-center"
                                                >
                                                    <div className="flex flex-col items-center justify-center gap-2">
                                                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        <span className="text-sm text-gray-600">
                                                            Cliquez pour ajouter une photo
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            JPG, PNG (max 5MB)
                                                        </span>
                                                    </div>
                                                </label>
                                            </>
                                        ) : (
                                            <div className="relative">
                                                <img 
                                                    src={productImage.preview} 
                                                    alt="Aperçu du produit"
                                                    className="w-full h-48 object-contain rounded"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={removeImage}
                                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                                                >
                                                    ×
                                                </button>
                                                <p className="text-xs text-gray-600 text-center mt-2">
                                                    {productImage.name} ({(productImage.size / 1024 / 1024).toFixed(2)} MB)
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Selected Product Summary */}
                            {selectedProduct && (
                                <div className="p-3 bg-red-50 rounded border border-red-200">
                                    <p className="font-semibold text-black mb-2">Récapitulatif du retour:</p>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <p className="text-black font-medium">Produit:</p>
                                            <p className="text-black">{selectedProduct.name}</p>
                                            <p className="text-black">Référence: {selectedProduct.reference}</p>
                                        </div>
                                        <div>
                                            <p className="text-black font-medium">Informations:</p>
                                            <p className="text-black">N° série: {serialNumber || 'Non saisi'}</p>
                                            <p className="text-black">Photo: {productImage ? 'Oui' : 'Non'}</p>
                                            <p className="font-semibold text-black mt-1">
                                                Total retour: {selectedProduct.unitprice.toFixed(0)} dzd
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-2 p-4 border-t">
                            <button
                                onClick={resetReturnForm}
                                disabled={uploading}
                                className="flex-1 px-4 py-2 text-black border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleCreateReturn}
                                disabled={!selectedProduct || !serialNumber.trim() || uploading}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
                            >
                                {uploading ? (
                                    <>
                                        <LoadingSpinner />
                                        Création...
                                    </>
                                ) : (
                                    'Créer le retour'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}