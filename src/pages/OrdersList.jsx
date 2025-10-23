  // OrdersList.jsx
  import { useOrderContext } from "../context/OrderContext.js";
  import TokenAuth from "../service/TokenAuth.js";
  import React, { useState, useRef } from "react";
  import { useNavigate } from "react-router-dom";
  import bg_produits from '../assets/images/bg_produits.png';
  import ClientProviders from "../providers/ClientProviders.jsx";
  import OrderProviders from "../providers/OrderProviders.jsx";
  import { FaChevronDown, FaChevronUp, FaEdit, FaTrash, FaPrint, FaFilePdf } from "react-icons/fa";

  export default function OrdersList() {
    return (
      <ClientProviders>
        <OrderProviders>
          <OrdersListContent />
        </OrderProviders>
      </ClientProviders>
    );
  }

  function OrdersListContent() {
    const {  orderItems } = useOrderContext();
    const { isAdmin } = TokenAuth();
    const [selectedRow, setSelectedRow] = useState(null);
    const [search, setSearch] = useState("");
    const [date, setDate] = useState("");
    const [status, setStatus] = useState("");
    const [commercialSearch, setCommercialSearch] = useState("");
    const navigate = useNavigate();
    const printRef = useRef();
    


    const productsListCSS = "px-1 py-3 font-bold border-r-2 border-r-gray-200 uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70"

    const handleShowProducts = (index) => {
      setSelectedRow(selectedRow === index ? null : index);
    }

    // FIXED: Use client_name instead of clientName
    const filteredOrders = orderItems.filter(order => {
      return (order.client_name?.toLowerCase().includes(search.toLowerCase()) ||
              order.clientName?.toLowerCase().includes(search.toLowerCase()))
        && order.dateCommande?.includes(date)
        && (status === "" || order.etatCommande === status)
        && order.commercial?.toLowerCase().includes(commercialSearch.toLowerCase())
    })

    // Helper function to get products from order (handles both 'produits' and 'products')
    const getOrderProducts = (order) => {
      return order.produits || order.products || [];
    }

    // Helper function to calculate total price
    const calculateTotalPrice = (product) => {
      return (product.prixVente * product.qty).toFixed(2);
    }

    // FIXED: Get client name with fallbacks
    const getClientName = (order) => {
      return order.client_name || order.clientName || "Unknown Client";
    }

    const handlePrint = (order) => {
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Bon de Commande - ${order.id}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 10px; }
            .info-section { margin-bottom: 20px; }
            .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
            .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .table th, .table td { border: 1px solid #000; padding: 8px; text-align: left; }
            .table th { background-color: #f0f0f0; }
            .total { text-align: right; font-weight: bold; font-size: 1.2em; margin-top: 20px; }
            .footer { margin-top: 30px; text-align: center; font-style: italic; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>BON DE COMMANDE</h1>
            <h2>N° ${order.id}</h2>
          </div>
          
          <div class="info-section">
            <div class="info-row">
              <div>
                <strong>Date:</strong> ${order.dateCommande}
              </div>
              <div>
                <strong>Commercial:</strong> ${order.commercial || "Non spécifié"}
              </div>
            </div>
            <div class="info-row">
              <div>
                <strong>Client:</strong> ${getClientName(order)}
              </div>
              <div>
                <strong>Statut:</strong> ${order.etatCommande}
              </div>
            </div>
          </div>

          <table class="table">
            <thead>
              <tr>
                <th>Produit</th>
                <th>Référence</th>
                <th>Prix unitaire</th>
                <th>Quantité</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${getOrderProducts(order).map(product => `
                <tr>
                  <td>${product.name}</td>
                  <td>${product.reference}</td>
                  <td>${product.prixVente?.toFixed(2)} dzd</td>
                  <td>${product.qty}</td>
                  <td>${calculateTotalPrice(product)} dzd</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="total">
            TOTAL: ${getOrderProducts(order).reduce((sum, product) => sum + (product.prixVente * product.qty), 0).toFixed(2)} dzd
          </div>

          ${order.note ? `
          <div class="info-section">
            <strong>Note:</strong> ${order.note}
          </div>
          ` : ''}

          <div class="footer">
            <p>Document généré le ${new Date().toLocaleDateString()}</p>
          </div>
        </body>
        </html>
      `;

      const printWindow = window.open('', '_blank');
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    };


    return (
      <section className="w-full h-screen bg-white/50 bg-auto bg-no-repeat bg-center px-2">
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
                type="text"
                value={commercialSearch}
                placeholder="Rechercher un commercial"
                onChange={(e) => setCommercialSearch(e.target.value)}
                className="border-red-700 border rounded-md p-2 w-64"
              />
            </div>
            <div>
              <input
                type="date"
                value={date}
                placeholder="Rechercher par date"
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
          </div>
        }
        <div ref={printRef}>
          <table className="w-full border-gray-200 text-black backdrop-blur-sm">
            <thead className="bg-gray-100 text-gray-800 font-semibold">
              <tr>
                <td className="py-2 pl-2 border-r border-r-black">N° commande</td>
                <td className="py-2 pl-2 border-r border-r-black w-28">Date</td>
                {/* CHANGED: Always show client column, not just for admin */}
                <td className="py-2 pl-2 border-r border-r-black w-40">Client</td>
                <td className="py-2 pl-2 border-r border-r-black w-40">Commercial</td>
                <td className="py-2 pl-2 border-r border-r-black w-40">Note</td>
                <td className="py-2 pl-2 w-32 border-r border-r-black">Statut</td>
                <td className="py-2 pl-2 w-28">Actions</td>
              </tr>
            </thead>
            <tbody>
              {filteredOrders?.map((order, index) => (
                <React.Fragment key={order.id || index}>
                  <tr className="hover:shadow-lg border transition duration-200">
                    <td className="py-3 pl-2 border-r border-r-black w-3">{order.id || index + 1}</td>
                    <td className="py-3 pl-2 border-r border-r-black">{order.dateCommande}</td>
                    {/* CHANGED: Always show client name, not just for admin */}
                    <td className="py-3 pl-2 border-r border-r-black">{getClientName(order)}</td>
                    <td className="py-3 pl-2 border-r border-r-black">{order.commercial || "Non spécifié"}</td>
                    <td className="py-3 pl-2 border-r border-r-black">{order.note || "Aucune note"}</td>
                    <td className="py-3 pl-2 border-r border-r-black rounded-lg">{order.etatCommande}</td>
                    <td className="py-3 pl-2 cursor-pointer">
                      <div className="flex justify-evenly gap-2">
                        <button type="button" onClick={() => handleShowProducts(index)} className="p-1 hover:bg-gray-100 rounded">
                          {selectedRow === index ? <FaChevronUp className="text-gray-600" /> : <FaChevronDown className="text-gray-600" />}
                        </button>
                       
                       
                        <button type="button" onClick={() => handlePrint(order)} className="p-1 hover:bg-gray-100 rounded" title="Imprimer commande">
                          <FaPrint className="text-green-600" />
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
                              <td className={productsListCSS}>Prix unitaire</td>
                              <td className={productsListCSS}>Quantité</td>
                              <td className={productsListCSS}>Prix total</td>
                            </tr>
                          </thead>
                          <tbody>
                            {getOrderProducts(order).length > 0 ? (
                              getOrderProducts(order).map((product, productIndex) => (
                                <tr key={productIndex}>
                                  <td className={productsListCSS}>{product.name}</td>
                                  <td className={productsListCSS}>{product.reference}</td>
                                  <td className={productsListCSS}>{product.prixVente?.toFixed(2)} dzd</td>
                                  <td className={productsListCSS}>{product.qty}</td>
                                  <td className={productsListCSS}>{calculateTotalPrice(product)} dzd</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="5" className={productsListCSS + " text-center"}>
                                  Aucun produit dans cette commande
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    );
  }