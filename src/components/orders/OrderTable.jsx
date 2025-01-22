import PropTypes from "prop-types";
import {useOrderContext} from "../../context/OrderContext";
import remove from "../../../public/assets/button/delete.png"
import {useState} from "react";

export default function OrderTable({ showSummary, setShowSummary, note, setNote, deleteItem, orderItems, orderId,isModify}) {
    const {addOrder, modifyOrder} = useOrderContext()
    const [quantities, setQuantities] = useState(orderItems.map(() => 1));


     const totalSum = () => {
        const sum = orderItems?.reduce((accumulator, currentItem) => {
            return accumulator + parseFloat(currentItem.prixVente * quantities[orderItems.indexOf(currentItem)]);
        }, 0);
        return sum.toFixed(0);
    };

    return (
        <section className="rounded-lg bg-white/30 shadow-lg w-full px-3 py-2">
            <div>
                <div className="flex justify-between py-4">
                    <h1 className="font-bold uppercase text-2xl">Formulaire de commande</h1>
                    <div className="flex space-x-2 items-center">
                        <h2 className={`font-semibold text-lg ${orderItems?.length > 0 ? 'block' : 'hidden'}`}>{orderItems?.length} produits</h2>
                        <button type="button" onClick={() => setShowSummary(!showSummary)}
                                className="text-gray-700 cursor-pointer">
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
            <div className={`${showSummary ? 'block' : 'hidden'}`}>
                <table className="w-full">
                    <thead>
                    <tr>
                        <td className="font-semibold text-md uppercase">Produit</td>
                        <td className="font-semibold text-md uppercase">Référence</td>
                        <td className="text-center font-semibold text-md uppercase">Prix unitaire</td>
                        <td className="text-center font-semibold text-md uppercase">Quantité</td>
                        <td className="text-center font-semibold text-md uppercase">Prix Total</td>
                        <td className="text-center font-semibold text-md uppercase">Commande</td>
                    </tr>
                    </thead>
                    <tbody>
                    {orderItems?.map((item, index) => (
                        <tr key={index}>
                            <td className="font-semibold text-md">{item?.name}</td>
                            <td className="font-semibold text-md">{item?.reference}</td>
                            <td className="text-center font-semibold text-md">{item?.prixVente} dzd</td>
                            <td className="text-center font-semibold text-md">
                                <input type="number" value={quantities[index]}
                                       max={item?.qty} min={1}
                                       onChange={(e) => {
                                    const newQuantities = [...quantities];
                                    newQuantities[index] = e.target.value;
                                    setQuantities(newQuantities);
                                    totalSum();
                                }} className="w-20 border rounded px-2 text-black"/>
                            </td>
                            <td className="text-center font-semibold text-md">{(item?.prixVente * quantities[orderItems.indexOf(item)]).toFixed(2)} dzd
                            </td>
                            <td className="text-center">
                            <button type="button" onClick={() => deleteItem(item.reference)}
                                        className="font-semibold text-red-500 hover:text-red-700 text-xs cursor-pointer">
                                    <img src={remove} alt="Supprimer produit" className="size-5"/>
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                <div className="border-t mt-8">
                    <div
                        className="flex font-semibold justify-end py-6 border-b uppercase text-lg text-red-500">
                        <span className="font-bold mr-4">TOTAL TTC :</span>
                        <span>{totalSum()} DZD</span>
                    </div>
                    <div className="flex flex-col py-2 pb-4 border-b uppercase text-lg">
                        <span className="font-bold">Note :</span>
                        <textarea value={note} onChange={(e) => setNote(e.target.value)}
                                  className="px-2 bg-white border"
                                  placeholder="Laisser une note ..."></textarea>
                    </div>
                    <button
                        className="bg-red-600 font-semibold text-white uppercase p-2 my-2 rounded-lg hover:bg-red-700"
                        onClick={() => {
                            isModify ?
                            modifyOrder({produits: [
                                ...orderItems.map((item, index) => ({...item, qty: quantities[index]}))
                                ], note, prixVente: parseInt(totalSum())}, orderId) :
                            addOrder({produits: [
                                ...orderItems.map((item, index) => ({...item, qty: quantities[index]}))
                                ], note, prixVente: parseInt(totalSum())})
                        }}
                    >
                        {isModify ? "Modifer la commande" : "Valider la commande"}
                    </button>
                </div>
            </div>
        </section>
    )
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
}