import { useState, useRef, useMemo } from 'react';
import { useProductsContext } from "../context/ProductsContext";
import OrderTable from "../components/orders/OrderTable.jsx";
import logoHeader from '../assets/images/logos_header.png';
import print from '../assets/button/print.png';
import exportExcel from '../assets/button/excel.png';
import previous from "../assets/button/previous.png";
import next from "../assets/button/next.png";

export default function ProductsList() {
    const itemToModify = JSON.parse(localStorage.getItem('order') || 'null');
    const isModify = localStorage.getItem('isModify') === 'true';
    const [showSummary, setShowSummary] = useState(false);
    const [orderItems, setOrderItems] = useState(itemToModify?.produits || []);
    const [openPreview, setOpenPreview] = useState(false);
    const [note, setNote] = useState('');
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(20);
    const [showPcBuilder, setShowPcBuilder] = useState(false);
    const { products = [] } = useProductsContext();
    const printTemplateRef = useRef(null);

    // PC Building State
    const [pcBuild, setPcBuild] = useState({
        motherboard: null,
        cpu: null,
        ram: null,
        storage: null,
        gpu: null,
        powerSupply: null,
        case: null,
        cooling: null
    });

    const [quantities, setQuantities] = useState({
        motherboard: 1,
        cpu: 1,
        ram: 1,
        storage: 1,
        gpu: 1,
        powerSupply: 1,
        case: 1,
        cooling: 1
    });

    const [currentStep, setCurrentStep] = useState(1);
    const [componentSearch, setComponentSearch] = useState({
        motherboard: '',
        cpu: '',
        ram: '',
        storage: '',
        gpu: '',
        powerSupply: '',
        case: '',
        cooling: ''
    });

    const [showSearchDropdown, setShowSearchDropdown] = useState(false);

    const orderId = itemToModify?.id || null;

    const categories = useMemo(() => {
        const uniqueCategories = new Set(['all']);
        const categoryMap = {
            "clavier": "clavier",
            "souris": "souris",
            "carte mere": "carte mere",
            "processeur": "processeur",
            "ssd": "ssd",
            "ram": "ram",
            "ecran": "ecran",
            "tower": "boitier",
            "botier": "boitier"
        };

        products.forEach(product => {
            if (!product?.category) return;
            let normalizedCategory = product.category.toLowerCase();
            Object.entries(categoryMap).forEach(([key, value]) => {
                if (normalizedCategory.includes(key)) {
                    normalizedCategory = value;
                }
            });
            uniqueCategories.add(normalizedCategory);
        });

        return Array.from(uniqueCategories);
    }, [products]);

    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            if (!product) return false;
            const searchLower = search.toLowerCase() || '';
            const nameMatch = product.name?.toLowerCase().includes(searchLower);
            const referenceMatch = product.reference?.toLowerCase().includes(searchLower);
            const categoryMatch = categories.some(cat => 
                cat !== 'all' && cat.toLowerCase().includes(searchLower) && 
                product.category?.toLowerCase().includes(cat.toLowerCase())
            );
            return (nameMatch || referenceMatch || categoryMatch) && product.quantity > 0;
        });
    }, [products, search, categories]);

    const currentProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        return filteredProducts.slice(startIndex, endIndex);
    }, [filteredProducts, currentPage, pageSize]);

    const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));

    // Filter products by category and search for PC building
    const pcComponents = useMemo(() => {
        const filterBySearch = (products, searchTerm) =>
            products.filter(p =>
                p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.reference?.toLowerCase().includes(searchTerm.toLowerCase())
            );

        return {
            motherboards: filterBySearch(
                products.filter(p => 
                    p.category?.toLowerCase().includes('carte mere') || 
                    p.category?.toLowerCase().includes('motherboard')
                ),
                componentSearch.motherboard
            ),
            cpus: filterBySearch(
                products.filter(p => 
                    p.category?.toLowerCase().includes('processeur') || 
                    p.category?.toLowerCase().includes('cpu')
                ),
                componentSearch.cpu
            ),
            rams: filterBySearch(
                products.filter(p => 
                    p.category?.toLowerCase().includes('ram') || 
                    p.category?.toLowerCase().includes('memory')
                ),
                componentSearch.ram
            ),
            storages: filterBySearch(
                products.filter(p => 
                    p.category?.toLowerCase().includes('ssd') || 
                    p.category?.toLowerCase().includes('hdd') ||
                    p.category?.toLowerCase().includes('stockage')
                ),
                componentSearch.storage
            ),
            gpus: filterBySearch(
                products.filter(p => 
                    p.category?.toLowerCase().includes('carte graphique') || 
                    p.category?.toLowerCase().includes('gpu') ||
                    p.category?.toLowerCase().includes('graphique')
                ),
                componentSearch.gpu
            ),
            powerSupplies: filterBySearch(
                products.filter(p => 
                    p.category?.toLowerCase().includes('alimentation') || 
                    p.category?.toLowerCase().includes('power')
                ),
                componentSearch.powerSupply
            ),
            cases: filterBySearch(
                products.filter(p => 
                    p.category?.toLowerCase().includes('boitier') || 
                    p.category?.toLowerCase().includes('case') ||
                    p.category?.toLowerCase().includes('tour')
                ),
                componentSearch.case
            ),
            coolings: filterBySearch(
                products.filter(p => 
                    p.category?.toLowerCase().includes('ventirad') || 
                    p.category?.toLowerCase().includes('refroidissement') || 
                    p.category?.toLowerCase().includes('cooling') ||
                    p.category?.toLowerCase().includes('ventilation')
                ),
                componentSearch.cooling
            )
        };
    }, [products, componentSearch]);

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

    const deleteItem = (reference) => {
        setOrderItems(orderItems?.filter(item => item.reference !== reference) || []);
    };

    const addItem = (name, reference, price, quantity) => {
        const numericPrice = parseFloat(price) || 0;
        setOrderItems(prevState => [...(prevState || []), { 
            name, 
            reference, 
            prixVente: numericPrice, 
            qty: quantity 
        }]);
    };

    const printInvoice = () => {
        if (!printTemplateRef.current) return;
        const printContents = printTemplateRef.current.innerHTML;
        const originalContents = document.body.innerHTML;
        document.body.innerHTML = printContents;
        window.print();
        document.body.innerHTML = originalContents;
        window.location.reload();
    };

    // PC Building Functions
    const selectComponent = (componentType, product) => {
        setPcBuild(prev => ({
            ...prev,
            [componentType]: product
        }));
    };

    const removeComponent = (componentType) => {
        setPcBuild(prev => ({
            ...prev,
            [componentType]: null
        }));
        setComponentSearch(prev => ({
            ...prev,
            [componentType]: ''
        }));
    };

    const updateQuantity = (componentType, newQuantity) => {
        const quantity = Math.max(1, newQuantity);
        setQuantities(prev => ({
            ...prev,
            [componentType]: quantity
        }));
    };

    const nextStep = () => {
        if (currentStep < 4) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const addPcBuildToOrder = () => {
        const components = Object.entries(pcBuild)
            .filter(([_, component]) => component !== null)
            .map(([type, component]) => ({
                ...component,
                quantity: quantities[type]
            }));
        
        if (components.length === 0) {
            alert('Veuillez sélectionner au moins un composant');
            return;
        }

        components.forEach(component => {
            addItem(
                component.name || 'Composant sans nom',
                component.reference || 'N/A',
                component.unitprice || 0,
                component.quantity || 1
            );
        });

        setPcBuild({
            motherboard: null,
            cpu: null,
            ram: null,
            storage: null,
            gpu: null,
            powerSupply: null,
            case: null,
            cooling: null
        });
        setQuantities({
            motherboard: 1,
            cpu: 1,
            ram: 1,
            storage: 1,
            gpu: 1,
            powerSupply: 1,
            case: 1,
            cooling: 1
        });
        setComponentSearch({
            motherboard: '',
            cpu: '',
            ram: '',
            storage: '',
            gpu: '',
            powerSupply: '',
            case: '',
            cooling: ''
        });
        setCurrentStep(1);
        setShowPcBuilder(false);
        
        alert('Configuration PC ajoutée à la commande!');
    };

    const calculateTotalPrice = () => {
        return Object.entries(pcBuild).reduce((total, [type, component]) => {
            if (!component) return total;
            const quantity = quantities[type] || 1;
            return total + (component.unitprice || 0) * quantity;
        }, 0);
    };

    const getStepComponents = (step) => {
        switch(step) {
            case 1:
                return ['motherboard', 'cpu', 'ram'];
            case 2:
                return ['storage', 'gpu'];
            case 3:
                return ['powerSupply', 'case', 'cooling'];
            case 4:
                return ['summary'];
            default:
                return [];
        }
    };

    const getStepTitle = (step) => {
        switch(step) {
            case 1:
                return 'Composants Principaux';
            case 2:
                return 'Stockage et Graphique';
            case 3:
                return 'Alimentation et Boîtier';
            case 4:
                return 'Récapitulatif';
            default:
                return '';
        }
    };

    // Simple Search Component with Dropdown
    const SearchWithDropdown = () => {
        const [showDropdown, setShowDropdown] = useState(false);

        const handleSearchChange = (value) => {
            setSearch(value);
            setCurrentPage(1);
        };

        const handleProductSelect = (product) => {
            // Add product to order when clicked in dropdown
            if (product.quantity > 0) {
                addItem(
                    product.name || 'Produit sans nom', 
                    product.reference || 'N/A', 
                    (product.unitprice || 0),
                    1
                );
            }
            setShowDropdown(false);
        };

        const handleCategorySelect = (category) => {
            setSearch(category);
            setCurrentPage(1);
            setShowDropdown(false);
        };

        const clearSearch = () => {
            setSearch('');
            setCurrentPage(1);
            setShowDropdown(false);
        };

        const toggleDropdown = () => {
            setShowDropdown(!showDropdown);
        };

        return (
            <div className="flex gap-2 w-full sm:w-96 relative">
                <div className="border rounded overflow-hidden flex w-full relative">
                    <input
                        type="text"
                        className="px-4 py-2 bg-white text-black border-gray-300 focus:ring-2 focus:ring-red-600 w-full pr-10"
                        placeholder="Rechercher un produit..."
                        value={search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        onFocus={() => setShowDropdown(true)}
                        aria-label="Rechercher un produit"
                    />
                    {/* Dropdown Arrow Button */}
                    <button
                        onClick={toggleDropdown}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        aria-label="Ouvrir la liste des produits"
                    >
                        <svg 
                            className={`w-5 h-5 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    
                    {/* Dropdown for search results and categories */}
                    {showDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-20 max-h-80 overflow-y-auto">
                            <div className="p-2">
                                {/* Quick Categories Section */}
                                <div className="mb-3">
                                    <h4 className="font-semibold text-red-600 text-sm mb-2">Catégories rapides</h4>
                                    <div className="flex flex-wrap gap-1">
                                        {categories.filter(cat => cat !== 'all').slice(0, 8).map(category => (
                                            <button
                                                key={category}
                                                onClick={() => handleCategorySelect(category)}
                                                className="px-2 py-1 bg-gray-100 hover:bg-red-100 text-black rounded text-sm transition"
                                            >
                                                {category}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                
                                {/* Search Results Section */}
                                <div>
                                    <h4 className="font-semibold text-red-600 text-sm mb-2">
                                        {search ? `Résultats pour "${search}"` : 'Tous les produits'}
                                    </h4>
                                    <div className="space-y-1 max-h-40 overflow-y-auto">
                                        {(search ? filteredProducts : products).slice(0, 10).map((product) => (
                                            <div
                                                key={product.reference}
                                                className={`p-2 rounded cursor-pointer border ${
                                                    product.quantity > 0 
                                                        ? 'hover:bg-red-50 border-gray-200' 
                                                        : 'bg-gray-100 border-gray-300 opacity-60'
                                                }`}
                                                onClick={() => product.quantity > 0 && handleProductSelect(product)}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <div className="font-medium text-black text-sm">
                                                            {product.reference}
                                                        </div>
                                                        <div className="text-xs text-gray-600 truncate">
                                                            {product.name}
                                                        </div>
                                                    </div>
                                                    <div className="text-right ml-2">
                                                        <div className="text-red-600 font-bold text-sm">
                                                            {(product.unitprice || 0).toFixed(0)} DZD
                                                        </div>
                                                        <div className={`text-xs ${
                                                            product.quantity > 0 ? 'text-green-600' : 'text-red-600'
                                                        }`}>
                                                            {product.quantity > 0 ? `${product.quantity} en stock` : 'Indisponible'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {filteredProducts.length === 0 && search && (
                                            <div className="text-center text-gray-500 text-sm py-2">
                                                Aucun produit trouvé
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <button
                    onClick={clearSearch}
                    className="px-3 py-2 bg-gray-300 text-black rounded hover:bg-gray-400 transition flex items-center justify-center"
                    aria-label="Effacer la recherche"
                >
                    ✕
                </button>
            </div>
        );
    };

    const ComponentSelector = ({ title, componentType, products, selectedComponent }) => (
        <div className="border rounded-lg p-4 bg-white text-black shadow-md">
            <h3 className="font-bold text-lg mb-3 text-red-600">{title}</h3>
            <div className="space-y-3">
                {selectedComponent ? (
                    <>
                        <div className="flex justify-between items-center p-3 bg-gray-100 rounded border border-red-600">
                            <div className="flex-1">
                                <p className="font-semibold">{selectedComponent.name}</p>
                                <p className="text-sm text-gray-600">{selectedComponent.reference}</p>
                                <p className="text-red-600 font-bold">{(selectedComponent.unitprice || 0).toFixed(0)} DZD</p>
                            </div>
                            <button
                                onClick={() => removeComponent(componentType)}
                                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition"
                                aria-label={`Retirer ${selectedComponent.name}`}
                            >
                                Retirer
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Quantité:</span>
                            <div className="flex items-center border rounded border-gray-300">
                                <button
                                    onClick={() => updateQuantity(componentType, quantities[componentType] - 1)}
                                    className="px-3 py-1 hover:bg-gray-200 transition"
                                    disabled={quantities[componentType] <= 1}
                                    aria-label="Diminuer la quantité"
                                >
                                    -
                                </button>
                                <input
                                    type="number"
                                    min="1"
                                    value={quantities[componentType]}
                                    onChange={(e) => updateQuantity(componentType, parseInt(e.target.value) || 1)}
                                    className="w-12 text-center bg-white text-black border-x border-gray-300 py-1"
                                    aria-label="Quantité"
                                />
                                <button
                                    onClick={() => updateQuantity(componentType, quantities[componentType] + 1)}
                                    className="px-3 py-1 hover:bg-gray-200 transition"
                                    aria-label="Augmenter la quantité"
                                >
                                    +
                                </button>
                            </div>
                            <span className="text-sm text-gray-600">
                                Total: {((selectedComponent.unitprice || 0) * quantities[componentType]).toFixed(0)} DZD
                            </span>
                        </div>
                    </>
                ) : (
                    <div className="space-y-2">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                className="w-full p-2 border rounded border-gray-300 bg-white text-black focus:ring-2 focus:ring-red-600"
                                placeholder={`Rechercher ${title.toLowerCase()}...`}
                                value={componentSearch[componentType]}
                                onChange={(e) => setComponentSearch(prev => ({
                                    ...prev,
                                    [componentType]: e.target.value
                                }))}
                                aria-label={`Rechercher ${title.toLowerCase()}`}
                            />
                            <button
                                onClick={() => setComponentSearch(prev => ({ ...prev, [componentType]: '' }))}
                                className="px-2 py-1 bg-gray-300 text-black rounded hover:bg-gray-400 transition"
                                aria-label={`Effacer la recherche pour ${title.toLowerCase()}`}
                            >
                                ✕
                            </button>
                        </div>
                        <select
                            onChange={(e) => {
                                const product = products.find(p => p.reference === e.target.value);
                                if (product) selectComponent(componentType, product);
                            }}
                            className="w-full p-2 border rounded border-gray-300 bg-white text-black focus:ring-2 focus:ring-red-600"
                            value=""
                            aria-label={`Sélectionner un ${title.toLowerCase()}`}
                        >
                            <option value="">Sélectionner un {title.toLowerCase()}</option>
                            {products.map(product => (
                                <option key={product.reference} value={product.reference}>
                                    {product.name} - {(product.unitprice || 0).toFixed(0)} DZD
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>
        </div>
    );

    const SummaryStep = () => (
        <div className="space-y-4">
            <h3 className="text-xl font-bold mb-4 text-red-600">Récapitulatif de votre configuration</h3>
            {Object.entries(pcBuild).map(([type, component]) => {
                if (!component) return null;
                const typeLabels = {
                    motherboard: 'Carte Mère',
                    cpu: 'Processeur',
                    ram: 'Mémoire RAM',
                    storage: 'Stockage',
                    gpu: 'Carte Graphique',
                    powerSupply: 'Alimentation',
                    case: 'Boîtier',
                    cooling: 'Refroidissement'
                };
                return (
                    <div key={type} className="flex justify-between items-center p-3 border rounded bg-gray-100 border-gray-300">
                        <div>
                            <p className="font-semibold text-black">{typeLabels[type]}</p>
                            <p className="text-sm text-gray-600">{component.name}</p>
                            <p className="text-sm text-gray-600">Quantité: {quantities[type]}</p>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-red-600">
                                {((component.unitprice || 0) * quantities[type]).toFixed(0)} DZD
                            </p>
                            <p className="text-sm text-gray-600">
                                ({quantities[type]} × {(component.unitprice || 0).toFixed(0)} DZD)
                            </p>
                        </div>
                    </div>
                );
            })}
            <div className="border-t pt-4 mt-4 border-gray-300">
                <div className="flex justify-between items-center text-xl font-bold">
                    <span className="text-black">Total général:</span>
                    <span className="text-red-600">{calculateTotalPrice().toFixed(0)} DZD</span>
                </div>
            </div>
        </div>
    );

    return (
        <section className="px-5 bg-white min-h-screen text-black">
            <div className="bg-white rounded-lg shadow-md p-6">
                <h1 className="text-3xl text-center uppercase font-bold py-2 text-red-600">Liste des produits</h1>
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
                <div className="my-4">
                    <div className="flex flex-col sm:flex-row justify-between items-center py-4 gap-4">
                        <div className="flex gap-4">
                            <button className="p-2 bg-red-600 rounded-full hover:bg-red-700 transition" title="Exporter Excel" aria-label="Exporter Excel">
                                <img src={exportExcel} alt="Exporter Excel" className="w-8 h-8" />
                            </button>
                            <button onClick={printInvoice} className="p-2 bg-red-600 rounded-full hover:bg-red-700 transition" title="Imprimer" aria-label="Imprimer">
                                <img src={print} alt="Imprimer" className="w-8 h-8" />
                            </button>
                            <button
                                onClick={() => setShowPcBuilder(true)}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold flex items-center gap-2 transition"
                                title="Construire un PC"
                                aria-label="Ouvrir le configurateur PC"
                            >
                                <span>🖥️</span>
                                Configurer PC
                            </button>
                        </div>
                        <SearchWithDropdown />
                    </div>

                    {/* Rest of your component remains exactly the same */}
                    {/* PC Builder Modal */}
                    {showPcBuilder && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-lg">
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <div>
                                            <h2 className="text-2xl font-bold text-red-600">Configurateur PC</h2>
                                            <p className="text-gray-600">Étape {currentStep} sur 4 - {getStepTitle(currentStep)}</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setShowPcBuilder(false);
                                                setCurrentStep(1);
                                                setComponentSearch({
                                                    motherboard: '',
                                                    cpu: '',
                                                    ram: '',
                                                    storage: '',
                                                    gpu: '',
                                                    powerSupply: '',
                                                    case: '',
                                                    cooling: ''
                                                });
                                            }}
                                            className="text-gray-600 hover:text-red-600 text-2xl"
                                            aria-label="Fermer le configurateur"
                                        >
                                            ×
                                        </button>
                                    </div>
                                    {/* Progress Bar */}
                                    <div className="mb-6">
                                        <div className="flex justify-between mb-2">
                                            {[1, 2, 3, 4].map(step => (
                                                <div
                                                    key={step}
                                                    className={`text-sm font-medium ${
                                                        step <= currentStep ? 'text-red-600' : 'text-gray-500'
                                                    }`}
                                                >
                                                    Étape {step}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-red-600 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${(currentStep / 4) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    {/* Step Content */}
                                    <div className="mb-6">
                                        {currentStep === 4 ? (
                                            <SummaryStep />
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {getStepComponents(currentStep).map(componentType => {
                                                    const componentMap = {
                                                        motherboard: { title: 'Carte Mère', products: pcComponents.motherboards },
                                                        cpu: { title: 'Processeur', products: pcComponents.cpus },
                                                        ram: { title: 'Mémoire RAM', products: pcComponents.rams },
                                                        storage: { title: 'Stockage', products: pcComponents.storages },
                                                        gpu: { title: 'Carte Graphique', products: pcComponents.gpus },
                                                        powerSupply: { title: 'Alimentation', products: pcComponents.powerSupplies },
                                                        case: { title: 'Boîtier', products: pcComponents.cases },
                                                        cooling: { title: 'Refroidissement', products: pcComponents.coolings }
                                                    };
                                                    const config = componentMap[componentType];
                                                    if (!config) return null;
                                                    return (
                                                        <ComponentSelector
                                                            key={componentType}
                                                            title={config.title}
                                                            componentType={componentType}
                                                            products={config.products}
                                                            selectedComponent={pcBuild[componentType]}
                                                        />
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                    {/* Navigation Buttons */}
                                    <div className="flex justify-between pt-4 border-t border-gray-300">
                                        <div>
                                            {currentStep > 1 && (
                                                <button
                                                    onClick={prevStep}
                                                    className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 text-black transition"
                                                    aria-label="Étape précédente"
                                                >
                                                    ← Précédent
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setShowPcBuilder(false);
                                                    setCurrentStep(1);
                                                    setComponentSearch({
                                                        motherboard: '',
                                                        cpu: '',
                                                        ram: '',
                                                        storage: '',
                                                        gpu: '',
                                                        powerSupply: '',
                                                        case: '',
                                                        cooling: ''
                                                    });
                                                }}
                                                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 text-black transition"
                                                aria-label="Annuler"
                                            >
                                                Annuler
                                            </button>
                                            {currentStep < 4 ? (
                                                <button
                                                    onClick={nextStep}
                                                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                                                    aria-label="Étape suivante"
                                                >
                                                    Suivant →
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={addPcBuildToOrder}
                                                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                                                    aria-label="Ajouter à la commande"
                                                >
                                                    Ajouter à la commande
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Products Table */}
                    <table className="w-full text-black bg-white rounded-lg overflow-hidden shadow-md">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-3 font-bold uppercase text-sm text-red-600">Designation</th>
                                <th className="px-4 py-3 font-bold uppercase text-sm text-red-600">Référence</th>
                                <th className="px-4 py-3 font-bold uppercase text-sm text-red-600">Prix Vente TTC</th>
                                <th className="px-4 py-3 font-bold uppercase text-sm text-red-600">Quantité</th>
                                <th className="px-4 py-3 font-bold uppercase text-sm text-red-600 text-center">Commander</th>
                            </tr>
                        </thead>
                        <tbody className="text-md">
                            {currentProducts?.map((product, index) => (
                                <tr key={index} className="hover:bg-gray-50 transition duration-200 border-b border-gray-200">
                                    <td className="pl-4 py-4">{product.name || 'N/A'}</td>
                                    <td className="pl-4 py-4">{product.reference || 'N/A'}</td>
                                    <td className="py-4 pl-4 text-red-600">{(product.unitprice || 0).toFixed(0)} DZD</td>
                                    <td className="px-4 py-4 text-center">
                                        <span className={`
                                            px-6 py-2 rounded-full font-semibold text-sm
                                            ${(product.quantity || 0) === 0 
                                                ? 'bg-red-600 text-white animate-pulse border-2 border-red-700' 
                                                : 'bg-gray-100 text-black border border-gray-300'
                                            }
                                        `}>
                                            {product.quantity || 0}
                                        </span>
                                    </td>
                                    <td className="flex justify-center items-center gap-2 py-4">
                                        <button 
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                if ((product.quantity || 0) === 0) {
                                                    alert('Veuillez sélectionner une quantité supérieure à la quantité minimale');
                                                } else {
                                                    addItem(
                                                        product.name || 'Produit sans nom', 
                                                        product.reference || 'N/A', 
                                                        (product.unitprice || 0),
                                                        product.quantity || 1
                                                    );
                                                }
                                            }}
                                            disabled={(product.quantity || 0) === 0}
                                            className={`
                                                px-5 py-2 rounded-md text-sm font-semibold uppercase tracking-widest 
                                                border border-solid transition-all duration-200
                                                ${(product.quantity || 0) === 0
                                                    ? 'bg-gray-300 text-gray-500 border-gray-400 cursor-not-allowed opacity-50'
                                                    : 'text-white bg-red-600 hover:bg-red-700 border-red-600'
                                                }
                                            `}
                                            aria-label={`Ajouter ${product.name || 'produit'} à la commande`}
                                        >
                                            {(product.quantity || 0) === 0 ? 'Indisponible' : 'Ajouter le produit'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {currentProducts.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="text-center py-4 text-gray-600">
                                        Aucun produit trouvé
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    <div className="flex justify-between items-center py-4">
                        <button 
                            disabled={currentPage === 1} 
                            onClick={prevPage}
                            className="p-2 bg-red-600 rounded-full hover:bg-red-700 transition disabled:opacity-50"
                            aria-label="Page précédente"
                        >
                            <img src={previous} alt="Précédent" className="w-8 h-8" />
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
                            <img src={next} alt="Suivant" className="w-8 h-8" />
                        </button>
                    </div>
                </div>

                {/* Print Template */}
                <div id="print-template" ref={printTemplateRef} className="hidden">
                    <div className="p-4 w-full bg-white">
                        <div className="py-4 border-b-2 border-red-600">
                            <img src={logoHeader} alt="logo" style={{width: '793.7px'}} />
                        </div>
                        <div className="py-1 border-b border-red-600">
                            <h2 className="text-3xl font-bold text-center pb-2 tracking-wider uppercase text-red-600">
                                Catalogue des produits
                            </h2>
                        </div>
                        <div className="container grid grid-cols-2 gap-4 px-2">
                            {products?.map((item, index) => (
                                <div key={index} className="w-full flex flex-col px-1 border border-gray-200 rounded p-4">
                                    <div className="flex items-center space-x-1 mb-4">
                                        {item.image1 && (
                                            <img alt="Product" className="object-cover object-center rounded" src={item.image1} style={{width: '150px', height: '150px'}} />
                                        )}
                                        {item.image2 && (
                                            <img alt="Product" className="object-cover object-center rounded" src={item.image2} style={{width: '150px', height: '150px'}} />
                                        )}
                                    </div>
                                    <h2 className="bg-red-600 w-fit p-2 text-sm title-font text-white tracking-widest rounded">
                                        Disponible en configuration
                                    </h2>
                                    <div className="w-full mt-4">
                                        <h1 className="text-black text-md title-font font-medium mb-1">
                                            {item.name || 'Produit sans nom'}
                                        </h1>
                                        <p className="leading-relaxed text-sm text-gray-600">{item.description || 'Aucune description'}</p>
                                        <div className="flex mt-4 items-center pb-5 border-b-2 border-gray-200 mb-5">
                                            <div className="flex">
                                                <span className="title-font font-medium text-2xl text-red-600">
                                                    {(item.unitprice || 0).toFixed(0)} DZD
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
        </section>
    );
}