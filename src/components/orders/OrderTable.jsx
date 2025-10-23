import PropTypes from "prop-types";
import {useOrderContext} from "../../context/OrderContext";
import remove from "../../assets/button/delete.png";
import {useState, useEffect} from "react";

export default function OrderTable({ 
    showSummary, 
    setShowSummary, 
    note, 
    setNote, 
    deleteItem, 
    orderItems = [], 
    orderId, 
    isModify 
}) {
    const { addOrder, modifyOrder } = useOrderContext();
    const [quantities, setQuantities] = useState([]);

    // Initialize quantities safely
    useEffect(() => {
        if (orderItems && orderItems.length > 0) {
            const initialQuantities = orderItems.map(item => 1);
            setQuantities(initialQuantities);
        } else {
            setQuantities([]);
        }
    }, [orderItems]);

  // In OrderTable.jsx, update the totalSum function:
const totalSum = () => {
    if (!orderItems || orderItems.length === 0) {
        return "0";
    }
    
    try {
        const sum = orderItems.reduce((accumulator, currentItem, index) => {
            const quantity = quantities[index] || 1;
            // Ensure price is a valid number
            const price = parseFloat(currentItem?.prixVente) || 0;
            return accumulator + (price * quantity);
        }, 0);
        
        // Ensure we're calling toFixed on a valid number
        return isNaN(sum) ? "0" : sum.toFixed(0);
    } catch (error) {
        console.error('Error calculating total sum:', error);
        return "0";
    }
};

    const handleQuantityChange = (index, newQuantity) => {
        try {
            const newQuantities = [...quantities];
            const maxQuantity = orderItems[index]?.qty || 1;
            
            // Validate quantity
            let validatedQuantity = parseInt(newQuantity);
            if (isNaN(validatedQuantity) || validatedQuantity < 1) {
                validatedQuantity = 1;
            }
            if (validatedQuantity > maxQuantity) {
                validatedQuantity = maxQuantity;
            }
            
            newQuantities[index] = validatedQuantity;
            setQuantities(newQuantities);
        } catch (error) {
            console.error('Error handling quantity change:', error);
        }
    };

    const handleSubmitOrder = () => {
        if (!orderItems || orderItems.length === 0) {
            alert("Veuillez ajouter des produits à la commande");
            return;
        }

        try {
            const orderData = {
                produits: orderItems.map((item, index) => ({
                    ...item,
                    qty: quantities[index] || 1
                })),
                note: note || "",
                prixVente: parseInt(totalSum()) || 0
            };

            if (isModify && orderId) {
                modifyOrder(orderData, orderId);
            } else {
                addOrder(orderData);
            }
        } catch (error) {
            console.error("Error submitting order:", error);
            alert("Erreur lors de la soumission de la commande");
        }
    };

    return (
        <section className="rounded-lg bg-white/30 shadow-lg w-full px-3 py-2">
            <div>
                <div className="flex justify-between py-4">
                    <h1 className="font-bold uppercase text-2xl">Formulaire de commande</h1>
                    <div className="flex space-x-2 items-center">
                        <h2 className={`font-semibold text-lg ${orderItems.length > 0 ? 'block' : 'hidden'}`}>
                            {orderItems.length} produit{orderItems.length !== 1 ? 's' : ''}
                        </h2>
                        <button 
                            type="button" 
                            onClick={() => setShowSummary(!showSummary)}
                            className="text-gray-700 cursor-pointer p-1 hover:bg-gray-100 rounded"
                            disabled={orderItems.length === 0}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                                 viewBox="0 0 24 24" strokeWidth="1.5"
                                 stroke="currentColor" className="w-6 h-6">
                                <path style={{display: !showSummary ? 'block' : 'none'}}
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M19.5 8.25l-7.5 7.5-7.5-7.5"/>
                                <path style={{display: showSummary ? 'block' : 'none'}}
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M4.5 15.75l7.5-7.5 7.5 7.5"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
            
            <div className={`${showSummary && orderItems.length > 0 ? 'block' : 'hidden'}`}>
                <table className="w-full border-collapse">
                    <thead>
                    <tr className="border-b-2">
                        <td className="font-semibold text-md uppercase py-3">Produit</td>
                        <td className="font-semibold text-md uppercase py-3">Référence</td>
                        <td className="text-center font-semibold text-md uppercase py-3">Prix unitaire</td>
                        <td className="text-center font-semibold text-md uppercase py-3">Quantité</td>
                        <td className="text-center font-semibold text-md uppercase py-3">Prix Total</td>
                        <td className="text-center font-semibold text-md uppercase py-3">Action</td>
                    </tr>
                    </thead>
                    <tbody>
                    {orderItems.map((item, index) => (
                        <tr key={`${item.reference}-${index}`} className="border-b hover:bg-gray-50">
                            <td className="font-semibold text-md py-3">{item?.name || 'Produit sans nom'}</td>
                            <td className="font-semibold text-md py-3">{item?.reference || 'N/A'}</td>
                            <td className="text-center font-semibold text-md py-3">
                                {(item?.prixVente || 0).toFixed(2)} dzd
                            </td>
                            <td className="text-center font-semibold text-md py-3">
                                <input 
                                    type="number" 
                                    value={quantities[index] || 1}
                                    max={item?.qty || 1} 
                                    min={1}
                                    onChange={(e) => handleQuantityChange(index, e.target.value)}
                                    className="w-20 border rounded px-2 py-1 text-black text-center"
                                />
                                <div className="text-xs text-gray-500 mt-1">
                                    Max: {item?.qty || 1}
                                </div>
                            </td>
                            <td className="text-center font-semibold text-md py-3">
                                {((item?.prixVente || 0) * (quantities[index] || 1)).toFixed(2)} dzd
                            </td>
                            <td className="text-center py-3">
                                <button 
                                    type="button" 
                                    onClick={() => deleteItem(item.reference)}
                                    className="font-semibold text-red-500 hover:text-red-700 text-xs cursor-pointer p-1 hover:bg-red-50 rounded"
                                >
                                    <img src={remove} alt="Supprimer produit" className="size-5"/>
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                <div className="border-t mt-8">
                    <div className="flex font-semibold justify-end py-6 border-b uppercase text-lg text-red-500">
                        <span className="font-bold mr-4">TOTAL TTC :</span>
                        <span>{totalSum()} DZD</span>
                    </div>
                    
                    <div className="flex flex-col py-4 border-b uppercase text-lg">
                        <span className="font-bold mb-2">Note :</span>
                        <textarea 
                            value={note} 
                            onChange={(e) => setNote(e.target.value)}
                            className="px-3 py-2 bg-white border border-gray-300 rounded min-h-[80px] text-base font-normal"
                            placeholder="Laisser une note ..."
                        ></textarea>
                    </div>
                    
                    <button
                        className={`w-full font-semibold text-white uppercase p-3 my-2 rounded-lg transition duration-200 ${
                            orderItems.length === 0 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-red-600 hover:bg-red-700'
                        }`}
                        onClick={handleSubmitOrder}
                        disabled={orderItems.length === 0}
                    >
                        {isModify ? "Modifier la commande" : "Valider la commande"}
                    </button>
                </div>
            </div>

            {orderItems.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    <p>Ajoutez des produits depuis la liste pour créer une commande</p>
                </div>
            )}
        </section>
    );
}

OrderTable.propTypes = {
    showSummary: PropTypes.bool,
    setShowSummary: PropTypes.func,
    note: PropTypes.string,
    setNote: PropTypes.func,
    deleteItem: PropTypes.func,
    orderItems: PropTypes.array,
    isModify: PropTypes.bool,
    orderId: PropTypes.number
};