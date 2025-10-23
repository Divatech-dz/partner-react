import { useState, useRef, useMemo } from 'react';
import { useProductsContext } from "../context/ProductsContext.js";
import { useOrderContext } from "../context/OrderContext.js";
import { useClientContext } from "../context/ClientContext.js";
import ClientProviders from "../providers/ClientProviders.jsx";
import OrderProviders from "../providers/OrderProviders.jsx";
import ProductsProviders from "../providers/ProductsProviders.jsx";
import { FaTimes, FaChevronLeft, FaChevronRight, FaDesktop, FaPlus, FaMicrochip, FaMemory, FaHdd, FaGamepad, FaBolt, FaCube, FaFan, FaList, FaCheckCircle, FaKeyboard, FaTv, FaCheck, FaStickyNote, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { MdOutlineShoppingCart } from 'react-icons/md';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Select from 'react-select';
import Swal from 'sweetalert2';

export default function ProductsList() {
  return (

        <ProductsProviders>
          <ProductsListContent />
        </ProductsProviders>


  );
}

function ProductsListContent() {
  const itemToModify = JSON.parse(localStorage.getItem('order') || 'null');
  const isModify = localStorage.getItem('isModify') === 'true';
  const [orderItems, setOrderItems] = useState(itemToModify?.produits || []);
  const [note, setNote] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { products = [] } = useProductsContext();
  const { addOrder, modifyOrder } = useOrderContext();
  const { userClientId } = useClientContext();
  
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
    cooling: null,
    clavier: null,
    ecrant: null
  });

  const [quantities, setQuantities] = useState({
    motherboard: 1,
    cpu: 1,
    ram: 1,
    storage: 1,
    gpu: 1,
    powerSupply: 1,
    case: 1,
    cooling: 1,
    clavier: 1,
    ecrant: 1
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [showConfigModal, setShowConfigModal] = useState(false);

  const orderId = itemToModify?.id || null;

  // Format price function
  const formatPrice = (price) => {
    const num = parseFloat(price) || 0;
    return Math.round(num * 100) / 100;
  };

  const formatPriceDisplay = (price) => {
    const num = formatPrice(price);
    return new Intl.NumberFormat('fr-FR', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    }).format(num);
  };

  // Filter products by category for PC building
  const pcComponents = useMemo(() => {
    const getProductsByCategory = (categoryKeywords) => {
      return products.filter(product => {
        if (!product?.category) return false;
        const category = product.category.toLowerCase();
        return categoryKeywords.some(keyword => category.includes(keyword));
      });
    };

    return {
      motherboards: getProductsByCategory(['carte mere', 'motherboard']),
      cpus: getProductsByCategory(['processeur', 'cpu']),
      rams: getProductsByCategory(['ram', 'memory']),
      storages: getProductsByCategory(['ssd', 'hdd', 'stockage']),
      gpus: getProductsByCategory(['carte graphique', 'gpu', 'graphique']),
      powerSupplies: getProductsByCategory(['alimentation', 'power']),
      cases: getProductsByCategory(['boitier', 'boîtier', 'case', 'tour', 'tower', 'chassis']),
      coolings: getProductsByCategory(['ventirad', 'refroidissement', 'cooling', 'ventilation']),
      claviers: getProductsByCategory(['clavier', 'keyboard']),
      ecrants: getProductsByCategory(['ecran', 'écran', 'monitor', 'screen', 'display'])
    };
  }, [products]);

  // Command Functions
  const handleOrderProducts = async () => {
    if (!orderItems || orderItems.length === 0) {
      await Swal.fire({
        title: 'Erreur',
        text: 'Veuillez ajouter des produits à la commande',
        icon: 'error',
        timer: 3000,
        showConfirmButton: false,
        timerProgressBar: true
      });
      return;
    }

    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const currentDate = `${year}-${month}-${day}`;
      
      const produits = orderItems.map(item => {
        const prixVente = formatPrice(item.prixVente);
        const qty = parseInt(item.qty) || 1;
        
        return {
          name: item.name?.trim() || 'Produit sans nom',
          reference: item.reference?.trim() || 'N/A',
          qty: qty,
          prixVente: prixVente
        };
      }).filter(item => item.name !== 'Produit sans nom');

      if (produits.length === 0) {
        await Swal.fire({
          title: 'Erreur',
          text: 'Aucun produit valide dans la commande',
          icon: 'error',
          timer: 3000,
          showConfirmButton: false,
          timerProgressBar: true
        });
        return;
      }

      const orderData = {
        dateCommande: currentDate,
        note: note?.trim() || '',
        etatCommande: "en-attente",
        client: userClientId,
        produits: produits
      };

      if (isModify && orderId) {
        await modifyOrder(orderData, orderId);
      } else {
        await addOrder(orderData);
      }

      setOrderItems([]);
      setNote('');
      localStorage.removeItem('order');
      localStorage.removeItem('isModify');
      
    } catch (error) {
      console.error('Erreur lors de la commande:', error);
      await Swal.fire({
        title: 'Erreur',
        text: 'Erreur lors de l\'envoi de la commande: ' + error.message,
        icon: 'error',
        timer: 3000,
        showConfirmButton: false,
        timerProgressBar: true
      });
    }
  };

  const deleteItem = (reference) => {
    setOrderItems(orderItems?.filter(item => item.reference !== reference) || []);
  };

  const addItem = (name, reference, price, quantity = 1) => {
    const numericPrice = formatPrice(price);
    const numericQuantity = parseInt(quantity) || 1;
    
    if (!name || !reference) {
      console.error('Nom et référence sont requis');
      return;
    }

    const newItem = { 
      name: name.trim(), 
      reference: reference.trim(), 
      prixVente: numericPrice,
      qty: numericQuantity 
    };

    setOrderItems(prevState => {
      const existingItems = prevState || [];
      const existingIndex = existingItems.findIndex(
        item => item.reference === newItem.reference
      );
      
      if (existingIndex !== -1) {
        const updatedItems = [...existingItems];
        updatedItems[existingIndex].qty += numericQuantity;
        return updatedItems;
      }
      
      return [...existingItems, newItem];
    });
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
  };

  const clearAllComponents = () => {
    setPcBuild({
      motherboard: null,
      cpu: null,
      ram: null,
      storage: null,
      gpu: null,
      powerSupply: null,
      case: null,
      cooling: null,
      clavier: null,
      ecrant: null
    });
    setQuantities({
      motherboard: 1,
      cpu: 1,
      ram: 1,
      storage: 1,
      gpu: 1,
      powerSupply: 1,
      case: 1,
      cooling: 1,
      clavier: 1,
      ecrant: 1
    });
    setCurrentStep(1);
    toast.success('Configuration réinitialisée');
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
        name: component.name || `Composant ${type}`,
        reference: component.reference || 'N/A',
        prixVente: formatPrice(component.unitprice) || 0,
        qty: quantities[type] || 1
      }));
    
    if (components.length === 0) {
      Swal.fire({
        title: 'Erreur',
        text: 'Veuillez sélectionner au moins un composant',
        icon: 'error',
        timer: 3000,
        showConfirmButton: false,
        timerProgressBar: true
      });
      return;
    }

    components.forEach(component => {
      addItem(
        component.name,
        component.reference,
        component.prixVente,
        component.qty
      );
    });

    toast.success('Configuration PC ajoutée au panier!');
    setIsCartOpen(false);
  };

  const calculateTotalPrice = () => {
    return Object.entries(pcBuild).reduce((total, [type, component]) => {
      if (!component) return total;
      const quantity = quantities[type] || 1;
      return total + (formatPrice(component.unitprice) || 0) * quantity;
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
        return ['clavier', 'ecrant'];
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
        return 'Périphériques';
      default:
        return '';
    }
  };

  const getComponentIcon = (type) => {
    const icons = {
      motherboard: FaMicrochip,
      cpu: FaMicrochip,
      ram: FaMemory,
      storage: FaHdd,
      gpu: FaGamepad,
      powerSupply: FaBolt,
      case: FaCube,
      cooling: FaFan,
      clavier: FaKeyboard,
      ecrant: FaTv
    };
    return icons[type] || FaList;
  };

  // Component Selector Component
  const ComponentSelector = ({ title, componentType, products, selectedComponent }) => {
    const Icon = getComponentIcon(componentType);

    const productOptions = useMemo(() => {
      const seen = new Set();
      return products
        .filter(product => {
          if (!product?.reference) return false;
          const key = product.reference.trim();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        })
        .map(product => ({
          value: product,
          label: `${product.reference} - ${product.name || 'Unnamed Product'} - ${formatPriceDisplay(product.unitprice || 0)} DZD`,
          product: product
        }));
    }, [products]);

    const handleProductSelect = (selectedOption) => {
      if (selectedOption) {
        selectComponent(componentType, selectedOption.product);
      }
    };

    const customStyles = {
      control: (base) => ({
        ...base,
        border: '2px solid #fecaca',
        borderRadius: '12px',
        padding: '8px',
        backgroundColor: 'white',
        '&:hover': {
          borderColor: '#fecaca'
        },
        boxShadow: 'none'
      }),
      menu: (base) => ({
        ...base,
        borderRadius: '12px',
        border: '2px solid #fecaca',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        zIndex: 20,
      }),
      option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected ? '#dc2626' : state.isFocused ? '#fef2f2' : 'white',
        color: state.isSelected ? 'white' : 'black',
        padding: '12px 16px',
        '&:hover': {
          backgroundColor: '#fef2f2',
        },
      }),
      input: (base) => ({
        ...base,
        color: 'black',
      }),
      singleValue: (base) => ({
        ...base,
        color: 'black',
      }),
    };

    return (
      <div className="border-2 border-red-100 rounded-2xl p-6 w-full bg-white shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-xl">
            <Icon className="text-red-600 w-5 h-5" />
          </div>
          <h3 className="font-bold text-xl text-red-800">{title}</h3>
        </div>
        
        <div className="space-y-4">
          {selectedComponent ? (
            <>
              <div className="bg-gradient-to-r from-red-50 to-white p-4 rounded-xl border-2 border-red-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-bold text-black text-lg">{selectedComponent.name}</p>
                    <p className="text-gray-600 text-sm mt-1">{selectedComponent.reference}</p>
                    <p className="text-red-600 font-bold text-xl mt-2">
                      {formatPriceDisplay(selectedComponent.unitprice || 0)} DZD
                    </p>
                  </div>
                  <button
                    onClick={() => removeComponent(componentType)}
                    className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    <FaTimes className="w-4 h-4" />
                    Retirer
                  </button>
                </div>
                
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-red-200">
                  <span className="text-sm font-semibold text-gray-700">Quantité:</span>
                  <div className="flex items-center border-2 border-red-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => updateQuantity(componentType, quantities[componentType] - 1)}
                      className="px-4 py-2 bg-red-50 hover:bg-red-100 transition-colors text-red-600 font-bold"
                      disabled={quantities[componentType] <= 1}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={quantities[componentType]}
                      onChange={(e) => updateQuantity(componentType, parseInt(e.target.value) || 1)}
                      className="w-16 text-center bg-white text-black border-x-2 border-red-200 py-2 font-semibold"
                    />
                    <button
                      onClick={() => updateQuantity(componentType, quantities[componentType] + 1)}
                      className="px-4 py-2 bg-red-50 hover:bg-red-100 transition-colors text-red-600 font-bold"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm font-bold text-red-600 ml-auto">
                    Sous-total: {formatPriceDisplay((formatPrice(selectedComponent.unitprice) || 0) * quantities[componentType])} DZD
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <Select
                options={productOptions}
                onChange={handleProductSelect}
                placeholder={`Rechercher ${title.toLowerCase()}...`}
                isClearable
                isSearchable
                styles={customStyles}
                noOptionsMessage={() => "Aucun produit trouvé"}
                className="react-select-container"
                classNamePrefix="react-select"
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  // Note Section Component
  const NoteSection = () => (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-red-100 p-6 mt-6">
      <div className="flex items-center gap-3 mb-4">
        <FaStickyNote className="text-red-600 text-2xl" />
        <h3 className="text-xl font-bold text-red-800">Note</h3>
      </div>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Ajoutez une note à votre commande (optionnel)..."
        className="w-full h-32 px-4 py-3 border-2 border-red-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
        rows={4}
        maxLength={500}
      />
      <p className="text-sm text-gray-500 mt-2">
        {note.length}/500 caractères
      </p>
    </div>
  );

  // Compact Cart Display
  const CompactCart = () => (
    <div className="fixed top-16 right-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-red-200 p-4 min-w-[300px] transition-all duration-300">
        <div 
          className="flex items-center justify-between mb-3 cursor-pointer"
          onClick={() => setIsCartOpen(!isCartOpen)}
        >
          <h3 className="font-bold text-red-800 flex items-center gap-2">
            <MdOutlineShoppingCart className="text-red-600" />
            Votre Configuration
            <span className="bg-red-600 text-white text-sm px-2 py-1 rounded-full ml-2">
              {Object.values(pcBuild).filter(Boolean).length}
            </span>
          </h3>
          {isCartOpen ? (
            <FaChevronUp className="text-red-600 transition-transform" />
          ) : (
            <FaChevronDown className="text-red-600 transition-transform" />
          )}
        </div>
        
        {isCartOpen && (
          <>
            <div className="space-y-2 max-h-60 overflow-y-auto mb-3">
              {Object.entries(pcBuild).map(([type, component]) => {
                if (!component) return null;
                const Icon = getComponentIcon(type);
                const typeLabels = {
                  motherboard: 'Carte Mère',
                  cpu: 'Processeur',
                  ram: 'RAM',
                  storage: 'Stockage',
                  gpu: 'Carte Graphique',
                  powerSupply: 'Alimentation',
                  case: 'Boîtier',
                  cooling: 'Refroidissement',
                  clavier: 'Clavier',
                  ecrant: 'Écran'
                };
                return (
                  <div key={type} className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-2 flex-1">
                      <Icon className="text-red-600 w-3 h-3" />
                      <span className="text-xs font-medium text-gray-700">{typeLabels[type]}</span>
                    </div>
                    <span className="text-xs font-bold text-red-600 ml-2">{quantities[type]}x</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeComponent(type);
                      }}
                      className="ml-2 text-red-500 hover:text-red-700 text-xs"
                    >
                      <FaTimes />
                    </button>
                  </div>
                );
              })}
            </div>

            {Object.values(pcBuild).filter(Boolean).length > 0 && (
              <div className="pt-3 border-t border-red-200">
                <div className="flex justify-between items-center text-sm font-bold mb-3">
                  <span>Total Configuration:</span>
                  <span className="text-red-600">{formatPriceDisplay(calculateTotalPrice())} DZD</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearAllComponents();
                    }}
                    className="flex-1 px-3 py-2 bg-gray-600 text-white text-xs rounded-lg hover:bg-gray-700 transition-all"
                  >
                    Effacer
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addPcBuildToOrder();
                    }}
                    className="flex-1 px-3 py-2 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-all"
                  >
                    Ajouter au Panier
                  </button>
                </div>
              </div>
            )}

            {(orderItems && orderItems.length > 0) && (
              <div className="mt-3 pt-3 border-t border-red-200">
                <div className="flex justify-between items-center text-sm font-bold mb-2">
                  <span>Articles dans le panier:</span>
                  <span className="text-green-600">{orderItems.length}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOrderProducts();
                  }}
                  className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                >
                  <FaCheck className="w-4 h-4" />
                  Valider Bon de Commande
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  // Step Layout Components
  const Step1Layout = () => (
    <div className="space-y-6 w-full">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-red-800">Composants Principaux</h3>
        <p className="text-gray-600">Sélectionnez les composants essentiels de votre PC</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {getStepComponents(1).map(componentType => {
          const componentMap = {
            motherboard: { title: 'Carte Mère', products: pcComponents.motherboards },
            cpu: { title: 'Processeur', products: pcComponents.cpus },
            ram: { title: 'Mémoire RAM', products: pcComponents.rams }
          };
          const config = componentMap[componentType];
          if (!config) return null;
          return (
            <div key={componentType} className="w-full">
              <ComponentSelector
                title={config.title}
                componentType={componentType}
                products={config.products}
                selectedComponent={pcBuild[componentType]}
              />
            </div>
          );
        })}
      </div>

      {Object.values(pcBuild).filter(Boolean).length > 0 && (
        <div className="flex justify-center mt-6">
          <button
            onClick={addPcBuildToOrder}
            className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl font-semibold text-lg"
          >
            <FaPlus className="w-5 h-5" />
            Ajouter au panier
          </button>
        </div>
      )}
    </div>
  );

  const Step2Layout = () => (
    <div className="space-y-6 w-full">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-red-800">Stockage et Graphique</h3>
        <p className="text-gray-600">Choisissez votre stockage et carte graphique</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        {getStepComponents(2).map(componentType => {
          const componentMap = {
            storage: { title: 'Stockage', products: pcComponents.storages },
            gpu: { title: 'Carte Graphique', products: pcComponents.gpus }
          };
          const config = componentMap[componentType];
          if (!config) return null;
          return (
            <div key={componentType} className="w-full">
              <ComponentSelector
                title={config.title}
                componentType={componentType}
                products={config.products}
                selectedComponent={pcBuild[componentType]}
              />
            </div>
          );
        })}
      </div>

      {Object.values(pcBuild).filter(Boolean).length > 0 && (
        <div className="flex justify-center mt-6">
          <button
            onClick={addPcBuildToOrder}
            className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl font-semibold text-lg"
          >
            <FaPlus className="w-5 h-5" />
            Ajouter au panier
          </button>
        </div>
      )}
    </div>
  );

  const Step3Layout = () => (
    <div className="space-y-6 w-full">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-red-800">Alimentation et Boîtier</h3>
        <p className="text-gray-600">Complétez votre configuration avec l'alimentation et le boîtier</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {getStepComponents(3).map(componentType => {
          const componentMap = {
            powerSupply: { title: 'Alimentation', products: pcComponents.powerSupplies },
            case: { title: 'Boîtier', products: pcComponents.cases },
            cooling: { title: 'Refroidissement', products: pcComponents.coolings }
          };
          const config = componentMap[componentType];
          if (!config) return null;
          return (
            <div key={componentType} className="w-full">
              <ComponentSelector
                title={config.title}
                componentType={componentType}
                products={config.products}
                selectedComponent={pcBuild[componentType]}
              />
            </div>
          );
        })}
      </div>

      {Object.values(pcBuild).filter(Boolean).length > 0 && (
        <div className="flex justify-center mt-6">
          <button
            onClick={addPcBuildToOrder}
            className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl font-semibold text-lg"
          >
            <FaPlus className="w-5 h-5" />
            Ajouter au panier
          </button>
        </div>
      )}
    </div>
  );

  const Step4Layout = () => (
    <div className="space-y-6 w-full">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-red-800">Périphériques</h3>
        <p className="text-gray-600">Sélectionnez votre clavier et écran</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        {getStepComponents(4).map(componentType => {
          const componentMap = {
            clavier: { title: 'Clavier', products: pcComponents.claviers },
            ecrant: { title: 'Écran', products: pcComponents.ecrants }
          };
          const config = componentMap[componentType];
          if (!config) return null;
          return (
            <div key={componentType} className="w-full">
              <ComponentSelector
                title={config.title}
                componentType={componentType}
                products={config.products}
                selectedComponent={pcBuild[componentType]}
              />
            </div>
          );
        })}
      </div>

      <NoteSection />

      <div className="flex justify-center gap-4 mt-6">
        {Object.values(pcBuild).filter(Boolean).length > 0 && (
          <button
            onClick={addPcBuildToOrder}
            className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl font-semibold text-lg"
          >
            <FaPlus className="w-5 h-5" />
            Ajouter au panier
          </button>
        )}
         
      </div>
    </div>
  );

  return (
    <section className="min-h-screen bg-gradient-to-br from-red-50 to-white text-black w-full">
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
      
      <CompactCart />
      
      <div className="w-full px-4 py-8">
        <div className="text-center mb-12 w-full">
          <div className="flex items-center justify-center gap-4 mb-6">
            <MdOutlineShoppingCart className="text-red-600 text-6xl" />
            <div className="text-left">
              <h1 className="text-4xl font-bold text-red-800">Formulaire de Commande</h1>
              <p className="text-xl text-gray-600 mt-2">Configurer et Commander</p>
            </div>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Construisez votre PC sur mesure avec nos composants de qualité
          </p>
        </div>
        
        <div className="bg-white rounded-3xl shadow-2xl border-2 border-red-100 w-full">
          <div className="p-8 w-full">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6 w-full">
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-red-800 mb-2 flex items-center gap-3">
                  <FaDesktop className="text-red-600" />
                  Configurateur PC
                </h2>
                <p className="text-gray-600 text-lg">
                  Étape {currentStep} sur 4 - <span className="font-semibold text-red-700">{getStepTitle(currentStep)}</span>
                </p>
              </div>
              
              <div className="flex items-center gap-4 bg-red-50 rounded-2xl p-4">
                {[1, 2, 3, 4].map(step => (
                  <div key={step} className="flex items-center gap-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                      step === currentStep 
                        ? 'bg-red-600 text-white shadow-lg' 
                        : step < currentStep 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      {step < currentStep ? <FaCheckCircle className="w-5 h-5" /> : step}
                    </div>
                    {step < 4 && (
                      <div className={`w-8 h-1 rounded ${
                        step < currentStep ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full">
              <div className="mb-6 relative w-full">
                {currentStep === 1 && <Step1Layout />}
                {currentStep === 2 && <Step2Layout />}
                {currentStep === 3 && <Step3Layout />}
                {currentStep === 4 && <Step4Layout />}
              </div>

              <div className="flex justify-between items-center pt-6 border-t-2 border-red-100 w-full">
                <div className="flex gap-3">
                  {currentStep > 1 && (
                    <button
                      onClick={prevStep}
                      className="px-8 py-3 border-2 border-red-200 rounded-xl hover:bg-red-50 text-red-700 font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
                    >
                      <FaChevronLeft className="w-4 h-4" />
                      Précédent
                    </button>
                  )}
                </div>
                <div className="flex gap-3">
                  {currentStep < 4 ? (
                    <button
                      onClick={nextStep}
                      className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl font-semibold text-lg"
                    >
                      Suivant
                      <FaChevronRight className="w-4 h-4" />
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}