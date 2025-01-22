import {useOrderContext} from "../context/OrderContext.js";
import TokenAuth from "../service/TokenAuth.js";
import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import bg_produits from '../../public/assets/images/bg_produits.png';
import openOrder from "../../public/assets/button/add.png";
import closeOrder from "../../public/assets/button/close.png";
import updateOrder from "../../public/assets/button/update.png";
import removeOrder from "../../public/assets/button/remove.png";
import exportExcel from "../../public/assets/button/excel.png";

export default function OrdersList() {
    const {deleteOrder, orderItems} = useOrderContext();
    const {isAdmin} = TokenAuth();
    const [selectedRow, setSelectedRow] = useState(null);
    const [search, setSearch] = useState("");
    const [date, setDate] = useState("");
    const [status, setStatus] = useState("");
    const navigate = useNavigate()

    const productsListCSS= "px-1 py-3 font-bold border-r-2 border-r-gray-200 uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70"

    const handleShowProducts = (index) => {
        setSelectedRow(selectedRow === index ? null : index);
    }

    const filteredOrders = orderItems.filter(order => {
        return order.clientName.toLowerCase().includes(search.toLowerCase())
            && order.dateCommande.includes(date)
            && (status === "" || order.etatCommande === status)
    })

    return (
        <section className="w-full overflow-hidden h-screen bg-white/50 bg-auto bg-no-repeat bg-center px-2">
            <div className="py-2 mt-4 flex flex-wrap flex-grow justify-between border-b px-2">
                <div>
                    <h3 className="text-3xl text-center font-bold ">LISTE DES COMMANDES</h3>
                </div>
                <a href="/products"
                   className="px-8 py-2 h-10 text-sm font-medium rounded-md hover:text-white hover:bg-red-700 hover:shadow-inner focus:outline-none focus:shadow-outline cursor-pointer">Nouvelle
                    Commande</a>
            </div>
            {isAdmin &&
                <div className="py-2 mt-4 flex justify-center items-center gap-4 border-b border-t px-2">
                    <div>
                        <input
                            type="text"
                            value={search}
                            placeholder="Rechercher un client"
                            onChange={(e) => setSearch(e.target.value)}
                            className="border-red-700 border rounded-md p-2 w-64"
                        />
                    </div>
                    <div>
                        <input
                            type="date"
                            value={date}
                            placeholder="Rechercher un client"
                            onChange={(e) => setDate(e.target.value)}
                            className="border-red-700 border rounded-md p-2 w-64"
                        />
                    </div>
                    <div>
                        <select
                            className="border-red-700 border rounded-md p-2"
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <option value="">Tous les états</option>
                            <option value="en-attente">En-attente</option>
                            <option value="validé">Validé</option>

                        </select>
                    </div>
                    <div className="size-10 cursor-pointer"
                         >
                        <img src={exportExcel} alt="exporter excel"/>
                    </div>
                </div>
            }
            <table className="w-full border-gray-200 text-black backdrop-blur-sm "
                   style={{backgroundImage: `url(${bg_produits})`}}>
                <thead className="bg-gray-100 text-gray-800 font-semibold">
                <tr>
                    <td className="py-2 pl-2 border-r border-r-black">N° commande</td>
                    <td className="py-2 pl-2 border-r border-r-black w-28">Date</td>
                    {isAdmin && <td className="py-2 pl-2 border-r border-r-black w-40">Client</td>}
                    <td className="py-2 pl-2 border-r border-r-black w-40">Note</td>
                    <td className="py-2 pl-2 w-32 border-r border-r-black">Statut</td>
                    <td className="py-2 pl-2 w-20">Actions</td>
                </tr>
                </thead>
                <tbody>
                {filteredOrders?.map((order, index) => (
                    <React.Fragment key={index}>
                        <tr key={index} className="hover:shadow-lg border transition duration-200">
                            <td className="py-3 pl-2 border-r border-r-black w-3">{index+1}</td>
                            <td className="py-3 pl-2 border-r border-r-black">{order.dateCommande}</td>
                            {isAdmin && <td className="py-3 pl-2 border-r border-r-black">{order.clientName}</td>}
                            <td className="py-3 pl-2 border-r border-r-black">{order.note || "Aucune note"}</td>
                            <td className="py-3 pl-2  border-r border-r-black rounded-lg"> {order.etatCommande}</td>
                            <td className="py-3 pl-2 cursor-pointer">
                                <div className="flex justify-evenly gap-2">
                                    <button type="button" onClick={() => handleShowProducts(index)}>
                                        {selectedRow === index ?
                                            <img src={closeOrder} alt="close" className="size-4"/> :
                                            <img src={openOrder} alt="open" className="size-5"/>
                                        }
                                    </button>
                                    <button type="button" onClick={() => {
                                        localStorage.setItem('order', JSON.stringify(order));
                                        localStorage.setItem('isModify', true);
                                        navigate("/products")
                                    }}>
                                        <img src={updateOrder} alt="remove" className="size-5"/>
                                    </button>
                                    <button type="button" onClick={()=>deleteOrder(order.id)}>
                                        <img src={removeOrder} alt="remove" className="size-5"/>
                                    </button>
                                </div>
                            </td>
                        </tr>
                        {selectedRow === index && (
                            <tr>
                                <td colSpan="8">
                                    <table className="w-full border-t-2 border-b-2 border-black">
                                        <thead>
                                        <tr className="bg-gray-100">
                                            <td className={productsListCSS}>Produit</td>
                                            <td className={productsListCSS}>Référence</td>
                                            <td className={productsListCSS}>Prix</td>
                                            <td className={productsListCSS}>Quantité</td>
                                            <td className={productsListCSS}>Prix
                                                total
                                            </td>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {order.produits.map((product, productIndex) => (
                                            <tr key={productIndex}>
                                                <td className={productsListCSS}>{product.name}</td>
                                                <td className={productsListCSS}>{product.reference}</td>
                                                <td className={productsListCSS}>{product.prixVente} dzd</td>
                                                <td className={productsListCSS}>{product.qty}</td>
                                                <td className={productsListCSS}>{product.prixVente * product.qty} dzd</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        )}
                    </React.Fragment>))}
                </tbody>
            </table>
        </section>);
};