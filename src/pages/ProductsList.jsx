import { useState, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useProductsContext } from "../context/ProductsContext.js";
import { useOrderContext } from "../context/OrderContext.js";
import { useClientContext } from "../context/ClientContext.js";
import ClientProviders from "../providers/ClientProviders.jsx";
import OrderProviders from "../providers/OrderProviders.jsx";
import ProductsProviders from "../providers/ProductsProviders.jsx";
import { 
  addPcBuildToCart,
  removePcBuildFromCart,
  clearCart 
} from '../store/slices/cartSlice';
import { FaTimes, FaChevronLeft, FaChevronRight, FaDesktop, FaPlus, FaMicrochip, FaMemory, FaHdd, FaGamepad, FaBolt, FaCube, FaFan, FaCheckCircle, FaKeyboard, FaTv, FaCheck, FaStickyNote, FaChevronDown, FaChevronUp, FaShoppingCart, FaTrash } from 'react-icons/fa';
import { MdOutlineShoppingCart } from 'react-icons/md';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Select from 'react-select';
import Swal from 'sweetalert2';

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
  const dispatch = useDispatch();
  const { pcBuilds, total } = useSelector(state => state.cart);
  
  const { products = [] } = useProductsContext();
  const { addOrder, modifyOrder } = useOrderContext();
  const { userClientId } = useClientContext();
  
  const itemToModify = JSON.parse(localStorage.getItem('order') || 'null');
  const isModify = localStorage.getItem('isModify') === 'true';
  const [note, setNote] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
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
  const [buildNote, setBuildNote] = useState(''); // Note for the current build

  const orderId = itemToModify?.id || null;

const formatPrice = (price) => {
  const num = parseFloat(price) || 0;
  return parseFloat(num.toFixed(2));
};

const formatPriceDisplay = (price) => {
  const num = parseFloat(price) || 0;
  return num.toFixed(2);
};
  // Get component icon function
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
    return icons[type] || FaCheckCircle;
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
    setQuantities(prev => ({
      ...prev,
      [componentType]: 1
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
    setBuildNote('');
    toast.success('Configuration réinitialisée');
  };

  const updateComponentQuantity = (componentType, newQuantity) => {
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

  const handleAddPcBuildToCart = () => {
    const selectedComponents = Object.entries(pcBuild)
      .filter(([_, component]) => component !== null);

    if (selectedComponents.length === 0) {
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

    const totalPrice = calculateTotalPrice();
    const name = `PC Personnalisé ${pcBuilds.length + 1}`;
    
    dispatch(addPcBuildToCart({
      components: pcBuild,
      quantities: quantities,
      totalPrice: totalPrice,
      buildName: name,
      buildNote: buildNote
    }));

    toast.success('Configuration PC ajoutée au panier!');
    clearAllComponents();
  };

  const calculateTotalPrice = () => {
    return Object.entries(pcBuild).reduce((total, [type, component]) => {
      if (!component) return total;
      const quantity = quantities[type] || 1;
      return total + (formatPrice(component.unitprice) || 0) * quantity;
    }, 0);
  };

const handleOrderProducts = async () => {
  if (pcBuilds.length === 0) {
    await Swal.fire({
      title: 'Erreur',
      text: 'Veuillez ajouter au moins une configuration PC au panier',
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
    
    // Create separate orders for each PC build (each PC build gets its own bon de commande)
    const orderPromises = pcBuilds.map(async (build, index) => {
      // Prepare products for this specific PC build
      const buildProducts = Object.entries(build.components)
        .filter(([_, component]) => component !== null)
        .map(([type, component]) => ({
          name: `${build.buildName} - ${component.name}`,
          reference: component.reference,
          qty: build.quantities[type] || 1, // Use quantity from the build
          prixVente: component.unitprice || component.price || 0
        }));

      const orderData = {
        dateCommande: currentDate,
        note: `${build.buildNote || 'Configuration PC Personnalisé'} | ${note?.trim() || ''}`,
        etatCommande: "en-attente",
        client: userClientId,
        produits: buildProducts
      };

      if (isModify && orderId) {
        return await modifyOrder(orderData, orderId);
      } else {
        return await addOrder(orderData);
      }
    });

    // Execute all orders
    const results = await Promise.all(orderPromises);
    
    // Show success message
    toast.success(`${results.length} commande(s) créée(s) avec succès!`);

    dispatch(clearCart());
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
  // Component Selector Component for PC Building
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
                      onClick={() => updateComponentQuantity(componentType, quantities[componentType] - 1)}
                      className="px-4 py-2 bg-red-50 hover:bg-red-100 transition-colors text-red-600 font-bold"
                      disabled={quantities[componentType] <= 1}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={quantities[componentType]}
                      onChange={(e) => updateComponentQuantity(componentType, parseInt(e.target.value) || 1)}
                      className="w-16 text-center bg-white text-black border-x-2 border-red-200 py-2 font-semibold"
                    />
                    <button
                      onClick={() => updateComponentQuantity(componentType, quantities[componentType] + 1)}
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

  // Build Note Component for Step 1
  const BuildNoteSection = () => (
    <div className="bg-white rounded-2xl p-6 border-2 border-red-100">
      <div className="flex items-center gap-3 mb-4">
        <FaStickyNote className="text-red-600 text-2xl" />
        <h3 className="text-xl font-bold text-red-800">Note pour cette configuration</h3>
      </div>
      <textarea
        value={buildNote}
        onChange={(e) => setBuildNote(e.target.value)}
        placeholder="Ajoutez une note spécifique à cette configuration PC (optionnel)..."
        className="w-full h-32 px-4 py-3 border-2 border-red-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
        rows={4}
        maxLength={500}
      />
      <p className="text-sm text-gray-500 mt-2">
        {buildNote.length}/500 caractères
      </p>
    </div>
  );

  // PC Build Main Component
  const PcBuildConfigurator = () => {
    const getStepComponents = (step) => {
      switch(step) {
        case 1: return ['motherboard', 'cpu', 'ram'];
        case 2: return ['storage', 'gpu'];
        case 3: return ['powerSupply', 'case', 'cooling'];
        case 4: return ['clavier', 'ecrant'];
        default: return [];
      }
    };

    const getStepTitle = (step) => {
      switch(step) {
        case 1: return 'Composants Principaux';
        case 2: return 'Stockage et Graphique';
        case 3: return 'Alimentation et Boîtier';
        case 4: return 'Périphériques';
        default: return '';
      }
    };

    const StepLayout = ({ step }) => {
      const componentMap = {
        motherboard: { title: 'Carte Mère', products: pcComponents.motherboards },
        cpu: { title: 'Processeur', products: pcComponents.cpus },
        ram: { title: 'Mémoire RAM', products: pcComponents.rams },
        storage: { title: 'Stockage', products: pcComponents.storages },
        gpu: { title: 'Carte Graphique', products: pcComponents.gpus },
        powerSupply: { title: 'Alimentation', products: pcComponents.powerSupplies },
        case: { title: 'Boîtier', products: pcComponents.cases },
        cooling: { title: 'Refroidissement', products: pcComponents.coolings },
        clavier: { title: 'Clavier', products: pcComponents.claviers },
        ecrant: { title: 'Écran', products: pcComponents.ecrants }
      };

      const stepComponents = getStepComponents(step);
      const columns = stepComponents.length === 3 ? 'lg:grid-cols-3' : 
                     stepComponents.length === 2 ? 'lg:grid-cols-2' : 'lg:grid-cols-1';

      return (
        <div className="space-y-6 w-full">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-red-800">{getStepTitle(step)}</h3>
            <p className="text-gray-600">
              {step === 1 && "Sélectionnez les composants essentiels de votre PC"}
              {step === 2 && "Choisissez votre stockage et carte graphique"}
              {step === 3 && "Complétez votre configuration avec l'alimentation et le boîtier"}
              {step === 4 && "Sélectionnez votre clavier et écran"}
            </p>
          </div>
          
          <div className={`grid grid-cols-1 ${columns} gap-6 w-full`}>
            {stepComponents.map(componentType => {
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

          {/* Add Build Note Section to Step 1 */}
          {step === 1 && <BuildNoteSection />}
        </div>
      );
    };

    return (
      <div className="space-y-6">
        {/* Progress Steps */}
        <div className="bg-white rounded-2xl p-6 border-2 border-red-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-red-800 mb-2 flex items-center gap-3">
                <FaDesktop className="text-red-600" />
                Configurateur PC
              </h2>
              <p className="text-gray-600">
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

          {/* Step Content */}
          <div className="mb-6 relative w-full">
            {currentStep === 1 && <StepLayout step={1} />}
            {currentStep === 2 && <StepLayout step={2} />}
            {currentStep === 3 && <StepLayout step={3} />}
            {currentStep === 4 && <StepLayout step={4} />}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-6 border-t-2 border-red-100">
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
              <button
                onClick={clearAllComponents}
                className="px-8 py-3 border-2 border-red-200 rounded-xl hover:bg-red-50 text-red-700 font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                <FaTrash className="w-4 h-4" />
                Réinitialiser
              </button>
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
              ) : (
                <button
                  onClick={handleAddPcBuildToCart}
                  disabled={Object.values(pcBuild).filter(Boolean).length === 0}
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaPlus className="w-5 h-5" />
                  Ajouter au Panier
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Current Configuration Summary */}
        {Object.values(pcBuild).filter(Boolean).length > 0 && (
          <div className="bg-white rounded-2xl p-6 border-2 border-green-200">
            <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center gap-2">
              <FaCheckCircle className="text-green-600" />
              Configuration Actuelle - {`PC Personnalisé ${pcBuilds.length + 1}`}
            </h3>
            
            {/* Show build note if exists */}
            {buildNote && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-semibold text-blue-800 mb-1">Note:</p>
                <p className="text-sm text-blue-600">{buildNote}</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <div key={type} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Icon className="text-green-600" />
                      <div>
                        <p className="font-semibold text-gray-800">{typeLabels[type]}</p>
                        <p className="text-sm text-gray-600">{component.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-green-600 font-bold">
                        {formatPriceDisplay(component.unitprice)} DZD
                      </p>
                      <p className="text-sm text-gray-500">x{quantities[type]}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-green-200">
              <span className="text-lg font-bold text-gray-800">Total Configuration:</span>
              <span className="text-2xl font-bold text-green-600">
                {formatPriceDisplay(calculateTotalPrice())} DZD
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Order Note Section Component
  const OrderNoteSection = () => (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-red-100 p-6 mt-6">
      <div className="flex items-center gap-3 mb-4">
        <FaStickyNote className="text-red-600 text-2xl" />
        <h3 className="text-xl font-bold text-red-800">Note Générale de Commande</h3>
      </div>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Ajoutez une note générale à votre commande (optionnel)..."
        className="w-full h-32 px-4 py-3 border-2 border-red-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
        rows={4}
        maxLength={500}
      />
      <p className="text-sm text-gray-500 mt-2">
        {note.length}/500 caractères
      </p>
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
      

      
      <div className="w-full px-4 py-8 pt-20">
        <div className="text-center mb-8 w-full">
          <div className="flex items-center justify-center gap-4 mb-6">
            <FaDesktop className="text-red-600 text-6xl" />
            <div className="text-left">
              <h1 className="text-4xl font-bold text-red-800">Configurateur PC</h1>
              <p className="text-xl text-gray-600 mt-2">Construisez votre PC sur mesure</p>
            </div>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Configurez votre ordinateur personnalisé en sélectionnant chaque composant étape par étape
          </p>
        </div>
        
        {/* Main PC Configurator */}
        <div className="bg-white rounded-3xl shadow-2xl border-2 border-red-100 w-full">
          <div className="p-8 w-full">
            <PcBuildConfigurator />
          </div>
        </div>

        {/* Order Note Section - Only show when there are PC builds in cart */}
        {pcBuilds.length > 0 && <OrderNoteSection />}

        {/* Order Summary and Actions */}
        {pcBuilds.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border-2 border-red-100 p-6 mt-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-red-800 mb-2">Résumé de la Commande</h3>
                <p className="text-gray-600">
                  {pcBuilds.length} configuration(s) PC dans le panier
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-red-600 mb-2">
                  Total: {formatPriceDisplay(total)} DZD
                </p>
                <button
                  onClick={handleOrderProducts}
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl font-semibold text-lg"
                >
                  <FaCheck className="w-5 h-5" />
                  {isModify ? 'Modifier la Commande' : 'Valider la Commande'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}