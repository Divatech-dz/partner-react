import { useRef, useState, useContext, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { removeFromCart, updateQuantity, removePcBuildFromCart, clearCart, updatePcBuildQuantity, updatePcBuildComponentQuantity } from '../store/slices/cartSlice';
import { setCartOpen, togglePcBuildExpansion } from '../store/slices/pcBuildSlice';
import { useClickOutside } from '../hooks/useClickOutside';
import OrderContext from '../context/OrderContext';
import ClientContext from '../context/ClientContext';
import TokenAuth from "../service/TokenAuth.js";
import { 
  FaTimes, 
  FaPlus, 
  FaMinus, 
  FaDesktop, 
  FaChevronDown, 
  FaChevronUp,
  FaShoppingBag,
  FaTrash,
  FaCreditCard,
  FaCog,
  FaMicrochip,
  FaMemory,
  FaHdd,
  FaGamepad,
  FaBolt,
  FaCube,
  FaFan,
  FaKeyboard,
  FaTv,
  FaEdit,
  FaSpinner,
  FaExclamationTriangle,
  FaLaptop,
  FaWrench
} from 'react-icons/fa';

export default function CartDropdown() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  
  const { items, pcBuilds, total } = useSelector(state => state.cart);
  const { expandedPcBuilds } = useSelector(state => state.pcBuild);

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);
  const [isLoadingClient, setIsLoadingClient] = useState(true);

  const { addOrder, addMultipleOrders } = useContext(OrderContext);
  const { userClientId, clients } = useContext(ClientContext);
  
  const tokenAuthData = TokenAuth();
  const { isAdmin, username, commercial } = tokenAuthData;

  useClickOutside(dropdownRef, () => {
    dispatch(setCartOpen(false));
  });

  useEffect(() => {
    const checkClientIdAvailable = () => {
      const hasValidClientId = 
        (userClientId && userClientId !== 0) ||
        (clients && clients.length > 0 && username) ||
        (localStorage.getItem('userClientId') && localStorage.getItem('userClientId') !== '0' && localStorage.getItem('userClientId') !== 'null');

      if (hasValidClientId) {
        setIsLoadingClient(false);
      } else {
        const timer = setTimeout(() => {
          setIsLoadingClient(false);
        }, 2000);

        return () => clearTimeout(timer);
      }
    };

    checkClientIdAvailable();
  }, [userClientId, clients, username]);

  const getClientId = () => {
    if (userClientId && userClientId !== 0) {
      return userClientId;
    }
    
    if (clients && clients.length > 0 && username) {
      const userClient = clients.find(client => {
        const formattedUsername = username?.replace(/\s/g, '_').toLowerCase();
        const formattedClientName = client.name?.replace(/\s/g, '_').toLowerCase();
        return formattedUsername === formattedClientName;
      });
      
      if (userClient) {
        return userClient.id;
      }
    }
    
    const storedClientId = localStorage.getItem('userClientId');
    if (storedClientId && storedClientId !== '0' && storedClientId !== 'null') {
      return parseInt(storedClientId);
    }
    
    const storedClients = localStorage.getItem('clients');
    if (storedClients && username) {
      try {
        const clientsData = JSON.parse(storedClients);
        if (clientsData && clientsData.length > 0) {
          const userClient = clientsData.find(client => {
            const formattedUsername = username?.replace(/\s/g, '_').toLowerCase();
            const formattedClientName = client.name?.replace(/\s/g, '_').toLowerCase();
            return formattedUsername === formattedClientName;
          });
          if (userClient) {
            localStorage.setItem('userClientId', userClient.id.toString());
            return userClient.id;
          }
        }
      } catch (error) {}
    }
    
    if (isAdmin || commercial) {
      if (clients && clients.length > 0) {
        return clients[0]?.id;
      }
    }
    
    return 0;
  };

  const getCommercial = () => {
    return commercial || username || 'default_commercial';
  };

  const formatPrice = (price) => {
    const num = parseFloat(price) || 0;
    return parseFloat(num.toFixed(2));
  };

  const handleQuantityChange = (reference, newQty) => {
    if (newQty < 1) return;
    dispatch(updateQuantity({ reference, qty: newQty }));
  };

  const handlePcBuildQuantityChange = (buildId, newQty) => {
    if (newQty < 1) return;
    const pcBuild = pcBuilds.find(build => build.id === buildId);
    if (pcBuild && pcBuild.buildType === 'preconfigure') {
      dispatch(updatePcBuildQuantity({ buildId, quantity: newQty }));
    }
  };

  const handleComponentQuantityChange = (buildId, componentType, newQty) => {
    if (newQty < 1) return;
    const pcBuild = pcBuilds.find(build => build.id === buildId);
    if (pcBuild && pcBuild.buildType !== 'preconfigure') {
      dispatch(updatePcBuildComponentQuantity({ 
        buildId, 
        componentType, 
        quantity: newQty 
      }));
    }
  };

  const handleRemoveItem = (reference) => {
    dispatch(removeFromCart(reference));
  };

  const handleRemovePcBuild = (buildId) => {
    dispatch(removePcBuildFromCart(buildId));
  };

  const handleClearAll = () => {
    dispatch(clearCart());
  };

  const handleTogglePcBuild = (buildId) => {
    dispatch(togglePcBuildExpansion(buildId));
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
    return icons[type] || FaCog;
  };

  const getComponentLabel = (type) => {
    const labels = {
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
    return labels[type] || type;
  };

  const isPriceHidden = (componentType) => {
    const hiddenComponents = [
      'motherboard', 'cpu', 'ram', 'storage', 'gpu', 'powerSupply', 'case'
    ];
    return hiddenComponents.includes(componentType);
  };

  const getPcBuildType = (pcBuild) => {
    return pcBuild.buildType || 'custom';
  };

  const cartItemsCount = items.reduce((count, item) => count + item.qty, 0) + 
    pcBuilds.reduce((count, pcBuild) => {
      if (pcBuild.buildType === 'preconfigure') {
        return count + (pcBuild.quantity || 1);
      } else {
        return count + 1;
      }
    }, 0);

  const handleCheckout = async () => {
    if (isLoadingClient) {
      setCheckoutError('Chargement des informations client en cours...');
      return;
    }

    setIsCheckingOut(true);
    setCheckoutError(null);

    try {
      const clientId = getClientId();
      const commercialName = getCommercial();

      if (clientId === 0) {
        setCheckoutError('Impossible de trouver le client associé. Veuillez vous reconnecter ou contacter l\'administrateur.');
        setIsCheckingOut(false);
        return;
      }
      
      const orders = [];
      const preConfiguredPcs = pcBuilds.filter(pc => pc.buildType === 'preconfigure');
      const personalizedPcs = pcBuilds.filter(pc => pc.buildType !== 'preconfigure');

      if (items.length > 0 || preConfiguredPcs.length > 0) {
        const orderProducts = [
          ...items.map(item => ({
            name: item.name,
            reference: item.reference,
            qty: item.qty,
            prixVente: parseFloat((item.prixVente).toFixed(2))
          })),
          ...preConfiguredPcs.map(pcBuild => ({
            name: pcBuild.name || pcBuild.buildName || 'PC Pré-configuré',
            reference: `PC-${pcBuild.id}`,
            qty: pcBuild.quantity || 1,
            prixVente: parseFloat((pcBuild.totalPrice).toFixed(2))
          }))
        ];

        if (orderProducts.length > 0) {
          orders.push({
            dateCommande: new Date().toISOString().split('T')[0],
            note: `Commande produits individuels${preConfiguredPcs.length > 0 ? ` et ${preConfiguredPcs.length} PC(s) pré-configuré(s)` : ''}`,
            etatCommande: "en-attente",
            produits: orderProducts,
            client: clientId,
            commercial: commercialName
          });
        }
      }

      personalizedPcs.forEach((pcBuild, index) => {
        const pcProducts = Object.entries(pcBuild.components)
          .filter(([_, component]) => component !== null && component !== undefined)
          .map(([type, component]) => {
            const componentQuantity = pcBuild.quantities?.[type] || 1;
            return {
              name: component.name,
              reference: component.reference,
              qty: componentQuantity,
              prixVente: parseFloat((component.prixVente || component.price || 0).toFixed(2))
            };
          });

        if (pcProducts.length > 0) {
          orders.push({
            dateCommande: new Date().toISOString().split('T')[0],
            note: `PC Personnalisé: ${pcBuild.name || pcBuild.buildName || `Configuration PC ${index + 1}`}${pcBuild.buildNote ? ` | ${pcBuild.buildNote}` : ''}`,
            etatCommande: "en-attente",
            produits: pcProducts,
            client: clientId,
            commercial: commercialName
          });
        }
      });

      const results = await addMultipleOrders(orders);

      const successfulOrders = results.filter(result => result && !result.error);
      const failedOrders = results.filter(result => !result || result.error);

      const successfulOrderIds = successfulOrders
        .map(order => order.orderId || order.id)
        .filter(id => id);

      if (failedOrders.length > 0) {
        if (successfulOrders.length === 0) {
          setCheckoutError(`Toutes les commandes ont échoué. Veuillez réessayer.`);
          return;
        } else {
          const errorMessage = `${failedOrders.length} commande(s) sur ${orders.length} ont échoué. ${successfulOrders.length} commande(s) ont été créées avec succès.`;
          
          dispatch(clearCart());
          dispatch(setCartOpen(false));
          
          navigate('/commandes', { 
            state: { 
              orderSuccess: true, 
              orderCount: successfulOrders.length,
              orderIds: successfulOrderIds,
              partialSuccess: true,
              failedCount: failedOrders.length,
              warning: errorMessage
            } 
          });
          return;
        }
      }

      dispatch(clearCart());
      dispatch(setCartOpen(false));
      
      navigate('/commandes', { 
        state: { 
          orderSuccess: true, 
          orderCount: successfulOrderIds.length,
          orderIds: successfulOrderIds
        } 
      });

    } catch (error) {
      if (error.response) {
        if (error.response.status === 400) {
          const validationErrors = error.response.data;
          let errorMessage = 'Erreur de validation: ';
          
          if (validationErrors.name) {
            errorMessage += `Nom: ${validationErrors.name[0]} `;
          }
          if (validationErrors.prixVente) {
            errorMessage += `Prix: ${validationErrors.prixVente[0]} `;
          }
          if (validationErrors.reference) {
            errorMessage += `Référence: ${validationErrors.reference[0]} `;
          }
          
          setCheckoutError(errorMessage.trim());
        } else if (error.response.status === 401) {
          setCheckoutError('Session expirée. Veuillez vous reconnecter.');
        } else {
          setCheckoutError(`Erreur serveur: ${error.response.status} - ${error.response.data?.message || 'Une erreur est survenue'}`);
        }
      } else if (error.request) {
        setCheckoutError('Aucune réponse du serveur. Vérifiez votre connexion.');
      } else {
        setCheckoutError(error.message || 'Une erreur est survenue lors de la commande');
      }
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div ref={dropdownRef} className="absolute right-0 top-12 w-[600px] bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
      <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg">
              <FaShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Votre Panier</h3>
              <p className="text-red-100 text-sm">
                {cartItemsCount} article{cartItemsCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          {cartItemsCount > 0 && (
            <button
              onClick={handleClearAll}
              className="p-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition-all duration-200"
              title="Vider le panier"
            >
              <FaTrash className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {isLoadingClient && (
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaSpinner className="w-8 h-8 text-red-500 animate-spin" />
          </div>
          <p className="text-gray-500 font-medium mb-2">Chargement...</p>
          <p className="text-gray-400 text-sm">Récupération des informations client</p>
        </div>
      )}

      {!isLoadingClient && (
        <div className="max-h-96 overflow-y-auto">
          {pcBuilds.length > 0 && (
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <FaDesktop className="text-red-500 w-4 h-4" />
                <h4 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">
                  Configurations PC
                </h4>
                <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full font-medium">
                  {pcBuilds.length}
                </span>
              </div>
              
              <div className="space-y-3">
                {pcBuilds.map((pcBuild) => {
                  const isPreConfigured = getPcBuildType(pcBuild) === 'preconfigure';
                  const pcQuantity = pcBuild.quantity || 1;
                  
                  return (
                    <div key={pcBuild.id} className="bg-gradient-to-br from-red-50 to-white rounded-xl border border-red-200 overflow-hidden transition-all duration-200 hover:border-red-300 hover:shadow-md">
                      <div className="p-3 bg-white">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`p-2 rounded-lg ${isPreConfigured ? 'bg-green-100' : 'bg-blue-100'}`}>
                              {isPreConfigured ? 
                                <FaLaptop className="text-green-600 w-4 h-4" /> : 
                                <FaWrench className="text-blue-600 w-4 h-4" />
                              }
                            </div>
                            <div>
                              <span className={`text-xs font-medium px-2 py-1 rounded-full ${isPreConfigured ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                {isPreConfigured ? 'PC Pré-configuré' : 'PC Personnalisé'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {isPreConfigured && (
                              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePcBuildQuantityChange(pcBuild.id, pcQuantity - 1);
                                  }}
                                  className="p-1 hover:bg-gray-100 transition-colors text-gray-600"
                                  disabled={pcQuantity <= 1}
                                >
                                  <FaMinus className="w-2 h-2" />
                                </button>
                                <span className="px-2 py-1 text-xs font-bold bg-white text-gray-800 min-w-8 text-center border-l border-r border-gray-300">
                                  {pcQuantity}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePcBuildQuantityChange(pcBuild.id, pcQuantity + 1);
                                  }}
                                  className="p-1 hover:bg-gray-100 transition-colors text-gray-600"
                                >
                                  <FaPlus className="w-2 h-2" />
                                </button>
                              </div>
                            )}
                            <span className="text-red-600 font-bold text-sm whitespace-nowrap">
                              {formatPrice(pcBuild.totalPrice * (isPreConfigured ? pcQuantity : 1))} DZD
                              {isPreConfigured && pcQuantity > 1 && (
                                <div className="text-gray-500 text-xs font-normal">
                                  ({formatPrice(pcBuild.totalPrice)} × {pcQuantity})
                                </div>
                              )}
                            </span>
                          </div>
                        </div>

                        <div 
                          className="flex items-center justify-between cursor-pointer"
                          onClick={() => handleTogglePcBuild(pcBuild.id)}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-800 text-sm truncate">
                              {pcBuild.name || pcBuild.buildName}
                            </p>
                            <p className="text-gray-500 text-xs">
                              {Object.values(pcBuild.components).filter(Boolean).length} composant{Object.values(pcBuild.components).filter(Boolean).length !== 1 ? 's' : ''}
                              {isPreConfigured && ` • Quantité PC: ${pcQuantity}`}
                            </p>
                            {pcBuild.buildNote && (
                              <p className="text-blue-600 text-xs truncate mt-1">
                                {pcBuild.buildNote}
                              </p>
                            )}
                          </div>
                          <div className="text-red-500 transition-transform duration-200 ml-2">
                            {expandedPcBuilds[pcBuild.id] ? 
                              <FaChevronUp className="w-3 h-3" /> : 
                              <FaChevronDown className="w-3 h-3" />
                            }
                          </div>
                        </div>
                      </div>
                      
                      {expandedPcBuilds[pcBuild.id] && (
                        <div className="bg-white border-t border-red-100 animate-slideDown">
                          <div className="p-3 space-y-2 max-h-60 overflow-y-auto">
                            {Object.entries(pcBuild.components)
                              .filter(([_, component]) => component !== null && component !== undefined)
                              .map(([type, component], compIndex) => {
                                const IconComponent = getComponentIcon(type);
                                const hidePrice = isPriceHidden(type) || isPreConfigured;
                                const componentQuantity = pcBuild.quantities?.[type] || 1;
                                
                                return (
                                  <div key={compIndex} className="flex justify-between items-start py-2 px-3 bg-white rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                                    <div className="flex-1 min-w-0">
                                      <span className="text-gray-600 text-xs truncate block">
                                        {component.name}
                                      </span>
                                      <span className="text-gray-400 text-xs block">
                                        {component.reference}
                                      </span>
                                    </div>
                                    
                                    <div className="text-right flex-shrink-0 flex items-center gap-3">
                                      {!isPreConfigured && (
                                        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleComponentQuantityChange(pcBuild.id, type, componentQuantity - 1);
                                            }}
                                            className="p-1 hover:bg-gray-100 transition-colors text-gray-600"
                                            disabled={componentQuantity <= 1}
                                          >
                                            <FaMinus className="w-2 h-2" />
                                          </button>
                                          <span className="px-2 py-1 text-xs font-bold bg-white text-gray-800 min-w-8 text-center border-l border-r border-gray-300">
                                            {componentQuantity}
                                          </span>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleComponentQuantityChange(pcBuild.id, type, componentQuantity + 1);
                                            }}
                                            className="p-1 hover:bg-gray-100 transition-colors text-gray-600"
                                          >
                                            <FaPlus className="w-2 h-2" />
                                          </button>
                                        </div>
                                      )}
                                      
                                      <div>
                                        {!hidePrice ? (
                                          <>
                                            <span className="text-red-500 font-bold text-xs whitespace-nowrap">
                                              {formatPrice(component.unitprice || component.prixVente || component.price || 0)} DZD
                                            </span>
                                            {!isPreConfigured && (
                                              <div className="text-gray-400 text-xs mt-1">
                                                Sous-total: {formatPrice((component.unitprice || component.prixVente || component.price || 0) * componentQuantity)} DZD
                                              </div>
                                            )}
                                          </>
                                        ) : (
                                          <div className="text-gray-400 text-xs italic">
                                            {isPreConfigured ? '' : 'Inclus'}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                          
                          <div className="px-3 py-3 border-t border-gray-100 bg-gradient-to-r from-red-50 to-white">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-bold text-gray-800">
                                {isPreConfigured ? 'Total PC Pré-configuré' : 'Total PC Personnalisé'}:
                              </span>
                              <span className="text-red-600 font-bold text-lg">
                                {formatPrice(pcBuild.totalPrice * (isPreConfigured ? pcQuantity : 1))} DZD
                              </span>
                            </div>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemovePcBuild(pcBuild.id);
                              }}
                              className="w-full py-2 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 font-medium mt-2"
                            >
                              <FaTimes className="w-3 h-3" />
                              Supprimer cette configuration
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {items.length > 0 && (
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <FaShoppingBag className="text-blue-500 w-4 h-4" />
                <h4 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">
                  Produits Individuels
                </h4>
                <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full font-medium">
                  {items.reduce((count, item) => count + item.qty, 0)}
                </span>
              </div>
              
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 hover:border-blue-200 transition-all duration-200">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 text-sm truncate">{item.name}</p>
                      <p className="text-gray-500 text-xs truncate">{item.reference}</p>
                      <p className="text-blue-600 font-bold text-sm mt-1">
                        {formatPrice(item.prixVente)} DZD
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                        <button
                          onClick={() => handleQuantityChange(item.reference, item.qty - 1)}
                          className="p-2 hover:bg-gray-100 transition-colors text-gray-600"
                          disabled={item.qty <= 1}
                        >
                          <FaMinus className="w-3 h-3" />
                        </button>
                        <span className="px-4 py-2 text-sm font-bold bg-white text-blue-600 min-w-12 text-center border-l border-r border-gray-300">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.reference, item.qty + 1)}
                          className="p-2 hover:bg-gray-100 transition-colors text-gray-600"
                        >
                          <FaPlus className="w-3 h-3" />
                        </button>
                      </div>
                      
                      <button
                        onClick={() => handleRemoveItem(item.reference)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <FaTimes className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {items.length === 0 && pcBuilds.length === 0 && (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaShoppingBag className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium mb-2">Panier vide</p>
              <p className="text-gray-400 text-sm">Ajoutez des produits ou configurations pour commencer</p>
            </div>
          )}
        </div>
      )}

      {!isLoadingClient && (items.length > 0 || pcBuilds.length > 0) && (
        <div className="border-t border-gray-100 bg-gray-50 p-4">
          {checkoutError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
              <FaExclamationTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{checkoutError}</span>
            </div>
          )}

          <div className="flex justify-between items-center mb-4">
            <div>
              <span className="font-bold text-gray-800 text-lg">Total Général</span>
            </div>
            <span className="text-red-600 font-bold text-xl">
              {formatPrice(total)} DZD
            </span>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleClearAll}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-all duration-200 font-medium flex items-center justify-center gap-2"
              disabled={isCheckingOut}
            >
              <FaTrash className="w-4 h-4" />
              Vider
            </button>
            <button
              onClick={handleCheckout}
              disabled={isCheckingOut || isLoadingClient}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCheckingOut ? (
                <>
                  <FaSpinner className="w-4 h-4 animate-spin" />
                  Traitement...
                </>
              ) : (
                <>
                  <FaCreditCard className="w-4 h-4" />
                  Commander
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}