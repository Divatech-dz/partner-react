import React, {useState, useRef} from 'react';
import {useProductsContext} from "../context/ProductsContext.js";
import {useDispatch, useSelector} from 'react-redux';
import {addToCart, addPcBuildToCart} from '../store/slices/cartSlice';
import OrderTable from "../components/orders/OrderTable.jsx";
import logoHeader from '../assets/images/logos_header.png';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import ClientProviders from "../providers/ClientProviders.jsx";
import OrderProviders from "../providers/OrderProviders.jsx";
import ProductsProviders from "../providers/ProductsProviders.jsx";
import print from '../assets/button/print.png';
import exportExcel from '../assets/button/excel.png';
import previous from "../assets/button/previous.png";
import next from "../assets/button/next.png";

export default function ProductsList() {
  return (
    <ClientProviders>
      <OrderProviders>
        <ProductsProviders>
          <ProductsListContent />
        </ProductsProviders>
      </OrderProviders>
    </ClientProviders>
  );
}

function ProductsListContent() {
    const itemToModify = JSON.parse(localStorage.getItem('order'));
    const isModify = localStorage.getItem('isModify') === 'true';
    const [showSummary, setShowSummary] = useState(false)
    const [openPreview, setOpenPreview] = useState(false);
    const [note, setNote] = useState('');
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(20);
    const [category, setCategory] = useState("");
    const [expandedPcId, setExpandedPcId] = useState(null);
    const {products, pcProducts, loading, error} = useProductsContext();
    
    // Redux
    const dispatch = useDispatch();
    const { items: orderItems } = useSelector(state => state.cart);
    
    let orderId = null;
    if(itemToModify) {
       orderId= itemToModify?.id
    }

    const allProducts = pcProducts;
    
    const filteredProducts = () => {
        return allProducts.filter(product => {
            if (!product) return false;
            
            const isPcProduct = product.category === 'PC' || 
                               product.category === 'PC GAMING' ||
                               product.category?.toLowerCase().includes('pc');
            
            if (!isPcProduct) return false;
            
            const nameMatch = product?.name?.toLowerCase().includes(search?.toLowerCase());
            const referenceMatch = product?.reference?.toLowerCase().includes(search?.toLowerCase());
            
            let categoryMatch = true;
            if (category && category !== 'all') {
                categoryMatch = product?.category === category;
            }
            
            return (search === '' && categoryMatch) || ((nameMatch || referenceMatch) && categoryMatch);
        });
    };

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentProducts = filteredProducts().slice(startIndex, endIndex);

    const totalPages = Math.max(1, Math.ceil(filteredProducts().length / pageSize));

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

    // Helper function to map categories to component types
    const getComponentTypeFromCategory = (category) => {
      if (!category) return null;
      
      const categoryLower = category.toLowerCase();
      
      if (categoryLower.includes('carte mere') || categoryLower.includes('motherboard')) return 'motherboard';
      if (categoryLower.includes('processeur') || categoryLower.includes('cpu')) return 'cpu';
      if (categoryLower.includes('ram') || categoryLower.includes('memory')) return 'ram';
      if (categoryLower.includes('ssd') || categoryLower.includes('hdd') || categoryLower.includes('stockage')) return 'storage';
      if (categoryLower.includes('carte graphique') || categoryLower.includes('gpu')) return 'gpu';
      if (categoryLower.includes('alimentation') || categoryLower.includes('power')) return 'powerSupply';
      if (categoryLower.includes('boitier') || categoryLower.includes('case') || categoryLower.includes('tour')) return 'case';
      if (categoryLower.includes('ventirad') || categoryLower.includes('refroidissement') || categoryLower.includes('cooling')) return 'cooling';
      if (categoryLower.includes('clavier') || categoryLower.includes('keyboard')) return 'clavier';
      if (categoryLower.includes('ecran') || categoryLower.includes('écran') || categoryLower.includes('monitor')) return 'ecrant';
      
      return null;
    };

    const deleteItem = (reference) => {
        // This will be handled by Redux automatically through OrderTable
    };

// In ProductsList1.jsx - Update the addItem function
const addItem = (name, reference, price, quantity, product = null) => {
  // Check if it's a PC product with variants
  if (product && product.varients_pc && product.varients_pc.length > 0) {
    // Create a PC build from the pre-configured PC
    const components = {};
    
    product.varients_pc.forEach((variant) => {
      const componentType = getComponentTypeFromCategory(variant.category);
      if (componentType) {
        components[componentType] = {
          name: variant.name,
          reference: variant.reference,
          unitprice: variant.unitprice || variant.price || 0,
          prixVente: variant.unitprice || variant.price || 0, // Add prixVente for consistency
          category: variant.category,
          type: componentType,
          price: variant.unitprice || variant.price || 0
        };
      }
    });

    const pcBuild = {
      components: components,
      totalPrice: product.unitprice || product.prixVente || product.prix || 0,
      buildName: product.name,
      buildNote: 'PC pré-configuré avec composants inclus',
      buildType: 'preconfigure',
      quantity: parseInt(quantity) || 1
    };
    
    dispatch(addPcBuildToCart(pcBuild));
    toast.success('PC pré-configuré ajouté au panier!');
  } else {
    // Regular product
    dispatch(addToCart({
      name,
      reference, 
      prixVente: parseFloat(price),
      qty: parseInt(quantity) || 1
    }));
    toast.success('Produit ajouté au panier!');
  }
};
    // Function to toggle PC variants visibility
    const togglePcVariants = (pcReference) => {
        setExpandedPcId(expandedPcId === pcReference ? null : pcReference);
    };

    // Check if a product is a PC with variants
    const isPcWithVariants = (product) => {
        return (product.category === 'PC' || product.category?.toLowerCase().includes('pc')) && 
               product.varients_pc && product.varients_pc.length > 0;
    };

    // Get PC variants - use varients_pc array from your data
    const getPcVariants = (product) => {
        if (product.varients_pc && Array.isArray(product.varients_pc)) {
            return product.varients_pc;
        }
        return [];
    };

    const printInvoice = () => {
        const printContents = document.getElementById('print-template').innerHTML;
        const originalContents = document.body.innerHTML;
        document.body.innerHTML = printContents;
        window.print();
        document.body.innerHTML = originalContents;
        window.location.reload();
    };

    // Get unique categories from all products
    const getUniqueCategories = () => {
        const categories = new Set();
        allProducts.forEach(product => {
            if (product && product.category) {
                const category = product.category.toString().toUpperCase();
                if (category.includes('PC') || category.includes('GAMER')) {
                    categories.add(product.category);
                }
            }
        });
        return Array.from(categories);
    };

    const uniqueCategories = getUniqueCategories();
const formatPrice = (price) => {
  const num = parseFloat(price) || 0;
  return parseFloat(num.toFixed(2));
};
    if (loading) {
        return (
            <section className="px-5 bg-auto bg-no-repeat bg-center">
                <div className="bg-white/30 bg-center bg-no-repeat p-8">
                    <div className="text-center">Chargement des produits...</div>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="px-5 bg-auto bg-no-repeat bg-center">
                <div className="bg-white/30 bg-center bg-no-repeat p-8">
                    <div className="text-center text-red-500">Erreur: {error}</div>
                </div>
            </section>
        );
    }

    return (
        <section className="px-5 bg-auto bg-no-repeat bg-center">
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
            
            <div className="bg-white/30 bg-center bg-no-repeat ">
                <h1 className="text-3xl text-center uppercase font-bold p-y2">Liste des produits</h1>
                <OrderTable 
                    showSummary={showSummary} 
                    setShowSummary={setShowSummary}
                    note={note} 
                    setNote={setNote} 
                    deleteItem={deleteItem} 
                    orderItems={orderItems} 
                    orderId={orderId} 
                    isModify={isModify}
                />
                <div className="my-2 backdrop-blur-md">
                    <div className="flex py-2 border-b">
                        <div className="flex flex-col w-screen">
                            <div className="flex justify-between py-4">
                                <div className="flex gap-5">
                                    <div className="size-10 cursor-pointer">
                                        <img src={exportExcel} alt="exporter excel"/>
                                    </div>

                                    <div className="size-10 cursor-pointer" onClick={printInvoice}>
                                        <img src={print} alt="Imprimer"/>
                                    </div>
                                </div>
                                <select 
                                    value={category} 
                                    onChange={(e) => {
                                        setCategory(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="border rounded px-3 py-2"
                                >
                                    <option value="all">Tous les Produits</option>
                                    {uniqueCategories.map((cat, index) => (
                                        <option key={`cat-${index}`} value={cat}>
                                            {cat.toUpperCase()}
                                        </option>
                                    ))}
                                </select>

                                <div className="border rounded overflow-hidden flex">
                                    <input
                                        type="text"
                                        className="px-4 py-2 w-64"
                                        placeholder="Rechercher un produit"
                                        value={search}
                                        onChange={(e) => {
                                            setSearch(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                    />
                                </div>
                            </div>
                            
                            {/* Products Table */}
                            <table className="border-gray-200 text-black bg-center w-full">
                                <thead className="border-b-2 bg-gray-100">
                                <tr>
                                    <td className="px-4 py-3 font-bold uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-sm border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70">
                                        Designation
                                    </td>
                                    <td className="px-4 py-3 font-bold uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-sm border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70">
                                        Référence
                                    </td>
                                    <td className="px-4 py-3 font-bold uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-sm border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70">
                                        Prix Vente TTC
                                    </td>
                                    <td className="px-4 py-3 font-bold uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-sm border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70">
                                        Quantité
                                    </td>
                                    <td className="px-4 py-3 text-center font-bold uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-sm border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70">
                                        Commander
                                    </td>
                                </tr>
                                </thead>
                                <tbody className="text-md">
                                {currentProducts?.length > 0 ? (
                                    currentProducts.map((product, index) => {
                                        const hasVariants = isPcWithVariants(product);
                                        const isExpanded = expandedPcId === product.reference;
                                        const variants = getPcVariants(product);
                                        
                                        return (
                                            <React.Fragment key={`product-${product.reference || index}`}>
                                                <tr className="hover:shadow-lg border-b transition duration-200">
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center">
                                                            {hasVariants && (
                                                                <button 
                                                                    onClick={() => togglePcVariants(product.reference)}
                                                                    className="mr-2 p-1 rounded hover:bg-gray-200 transition-colors"
                                                                    title="Voir les composants"
                                                                >
                                                                    <svg 
                                                                        className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                                                        fill="none" 
                                                                        stroke="currentColor" 
                                                                        viewBox="0 0 24 24"
                                                                    >
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                                    </svg>
                                                                </button>
                                                            )}
                                                            <div className="flex-1">
                                                                <div className="font-medium">{product.name}</div>
                                                                {hasVariants && (
                                                                    <div className="text-xs text-gray-500 mt-1">
                                                                        {variants.length} composants - Cliquez pour voir les détails
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">{product.reference}</td>
                                                    <td className="px-4 py-3">
                                                      {formatPrice(product.unitprice || product.prixVente || product.prix || 0)} Dzd
                                                    </td>
                                                    <td className={`px-4 py-3 text-center ${(product.quantity || product.stock || 0) === 0 ? 'bg-red-500 text-white' : ''}`}>
                                                        {product.quantity || product.stock || 0}
                                                    </td>
                                                    <td className="px-4 py-3 flex justify-center items-center">
                                                        <button 
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                const availableQuantity = product.quantity || product.stock || 0;
                                                                if (availableQuantity === 0) {
                                                                    alert('Produit en rupture de stock');
                                                                } else {
                                                                    addItem(
                                                                        product.name, 
                                                                        product.reference, 
                                                                        product.unitprice || product.prixVente || product.prix || 0, 
                                                                        1,
                                                                        product
                                                                    );
                                                                }
                                                            }}
                                                            disabled={(product.quantity || product.stock || 0) === 0}
                                                            className="px-5 py-2 rounded-md cursor-pointer text-[#ff0c3b] hover:text-white hover:bg-gradient-to-t to-[#ff0c3b] from-[#93291E] focus:outline-none border border-solid text-sm text-center font-semibold uppercase tracking-widest overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            {hasVariants ? 'Ajouter PC au panier' : 'Ajouter le produit'}
                                                        </button>
                                                    </td>
                                                </tr>
                                                
                                                {/* PC Variants Expansion */}
                                                {hasVariants && isExpanded && (
                                                    <tr className="bg-gray-50">
                                                        <td colSpan="5" className="px-4 py-4">
                                                            <div className="ml-8 border-l-2 border-blue-200 pl-4">
                                                                <h4 className="font-semibold text-gray-700 mb-3 text-lg">Composants du PC:</h4>
                                                                <div className="overflow-x-auto">
                                                                    <table className="min-w-full bg-white border border-gray-200">
                                                                        <thead className="bg-gray-100">
                                                                            <tr>
                                                                                <th className="py-2 px-4 border-b text-left">Référence</th>
                                                                                <th className="py-2 px-4 border-b text-left">Composant</th>
                                                                                <th className="py-2 px-4 border-b text-left">Catégorie</th>
                                                                              
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {variants.map((variant, variantIndex) => (
                                                                                <tr key={`variant-${variantIndex}`} className="hover:bg-gray-50">
                                                                                    <td className="py-2 px-4 border-b text-sm">{variant.reference}</td>
                                                                                    <td className="py-2 px-4 border-b text-sm">{variant.name}</td>
                                                                                    <td className="py-2 px-4 border-b text-sm">{variant.category}</td>
                                                                                  
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                                <div className="mt-3 text-sm text-gray-600">
                                                                    <p><strong>Prix total du PC:</strong> {product.unitprice?.toFixed(0)} Dzd</p>
                                                                    <p><strong>Stock disponible:</strong> {product.quantity} unité(s)</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                                            {allProducts.length === 0 ? 'Aucun produit disponible' : 'Aucun produit trouvé'}
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                            
                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-between items-center py-4">
                                    <button 
                                        disabled={currentPage === 1} 
                                        onClick={prevPage}
                                        className={`flex items-center gap-2 px-4 py-2 rounded ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                                    >
                                        <img src={previous} alt="previous" className="size-6"/>
                                        <span>Précédent</span>
                                    </button>
                                    
                                    <div className="flex items-center gap-2">
                                        <span>Page</span>
                                        <select
                                            value={currentPage}
                                            onChange={(e) => setCurrentPage(Number(e.target.value))}
                                            className="text-center border rounded px-3 py-1"
                                        >
                                            {Array.from({length: totalPages}, (_, i) => (
                                                <option key={i + 1} value={i + 1}>
                                                    {i + 1}
                                                </option>
                                            ))}
                                        </select>
                                        <span>sur {totalPages}</span>
                                    </div>
                                    
                                    <button 
                                        disabled={currentPage === totalPages}
                                        onClick={nextPage}
                                        className={`flex items-center gap-2 px-4 py-2 rounded ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                                    >
                                        <span>Suivant</span>
                                        <img src={next} alt="next" className="size-6"/>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Preview Modal */}
                    <div>
                        <div
                            style={{backgroundColor: 'rgba(0, 0, 0, 0.8)'}}
                            className={`fixed z-40 top-0 overflow-y-scroll right-0 left-0 bottom-0 h-full w-full py-8 ${openPreview ? 'block' : 'hidden'}`}
                        >
                            <div
                                className="shadow absolute -right-0 top-0 w-10 h-10 rounded-full bg-white text-gray-500 hover:text-gray-800 inline-flex items-center justify-center cursor-pointer"
                                onClick={() => setOpenPreview(!openPreview)}
                            >
                                <svg className="fill-current w-6 h-6"
                                     xmlns="http://www.w3.org/2000/svg"
                                     viewBox="0 0 24 24">
                                    <path
                                        d="M16.192 6.344L11.949 10.586 7.707 6.344 6.293 7.758 10.535 12 6.293 16.242 7.707 17.656 11.949 13.414 16.192 17.656 17.606 16.242 13.364 12 17.606 7.758z"/>
                                </svg>
                            </div>
                        </div>

                        {/* Print Template */}
                        <div id="print-template" className="hidden">
                            <div
                                className="p-4 w-full relative left-0 right-0 overflow-hidden bg-white h-full"
                                onClick={() => setOpenPreview(!openPreview)}>
                                <div className="py-4 border-b-2 border-gray-100">
                                    <img src={logoHeader} alt="logo"
                                         style={{width: '793.7px'}}/>
                                </div>
                                <div className="py-1 border-b border-stone-500">
                                    <h2 className="text-3xl font-bold text-center pb-2 tracking-wider uppercase">Catalogue
                                        des produits</h2>
                                </div>
                                <div className="container grid grid-cols-2 gap-4 px-4"
                                     style={{cursor: 'auto'}}>
                                    {allProducts?.map((item) => (
                                        <div key={`print-${item.id || item.reference}`}
                                             className="w-full flex flex-col p-4 border border-gray-200 rounded-lg">
                                            <div className="flex items-center space-x-2 mb-4">
                                                {item.image1 && (
                                                    <img alt="Product"
                                                         className="object-cover object-center rounded"
                                                         src={item.image1}
                                                         style={{
                                                             cursor: 'auto',
                                                             width: '150px',
                                                             height: '150px'
                                                         }}/>
                                                )}
                                                {item.image2 && (
                                                    <img alt="Product"
                                                         className="object-cover object-center rounded"
                                                         src={item.image2}
                                                         style={{
                                                             cursor: 'auto',
                                                             width: '150px',
                                                             height: '150px'
                                                         }}/>
                                                )}
                                            </div>
                                            <h2 className="bg-gradient-to-r from-red-500 to-red-700 w-fit px-3 py-1 rounded text-sm text-white tracking-widest mb-2"
                                                style={{cursor: 'auto'}}>
                                                Disponible en configuration
                                            </h2>
                                            <div className="w-full mt-2"
                                                 style={{cursor: 'auto'}}>
                                                <h1 className="text-gray-900 text-lg font-bold mb-1"
                                                    style={{cursor: 'auto'}}>{item.name}</h1>
                                                <p className="leading-relaxed text-sm text-gray-600 mb-3">{item.description}</p>
                                                {item.varients_pc && item.varients_pc.length > 0 && (
                                                    <div className="mb-2">
                                                        <p className="text-sm font-semibold text-gray-700 mb-1">Composants:</p>
                                                        <ul className="text-sm text-gray-600 list-disc list-inside">
                                                            {item.varients_pc.slice(0, 3).map((variant, idx) => (
                                                                <li key={idx}>{variant.name}</li>
                                                            ))}
                                                            {item.varients_pc.length > 3 && (
                                                                <li>... et {item.varients_pc.length - 3} autres composants</li>
                                                            )}
                                                        </ul>
                                                    </div>
                                                )}
                                                <div className="flex items-center justify-between py-3 border-t border-gray-100">
                                                    <div className="flex">
                                                        <span className="font-bold text-2xl bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">
                                                         {formatPrice(item.unitprice || item.prixVente || item.prix || 0)} DZD
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}