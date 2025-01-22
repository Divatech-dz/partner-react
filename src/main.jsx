import React from 'react'
import ReactDOM from "react-dom/client";
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import './index.css'
import App from './App.jsx'
import SalesView from "./pages/SalesView.jsx";
import OrdersList from "./pages/OrdersList.jsx";
import ReturnsNote from "./pages/ReturnsNote.jsx";
import PaymentState from "./pages/PaymentState.jsx";
import Feedbacks from "./pages/Feedbacks.jsx";
import ClientsList from "./pages/ClientsList.jsx";
import ProductsList from "./pages/ProductsList.jsx";
import Remises from "./pages/Remises.jsx";
import WarrantiesList from "./pages/WarrantiesList.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import DeliveryList from "./pages/DeliveryList.jsx";

const router = createBrowserRouter([
    {
        element: <App/>,
        children: [
            {
                path: "/login",
                element: <LoginPage/>
            },
            {
                path: "/",
                element: <SalesView/>
            },
            {
                path: "/commandes",
                element: <OrdersList/>
            },
            {
                path: "/etat_retour",
                element: <ReturnsNote/>
            },
            {
                path: "/paiements",
                element: <PaymentState/>
            },
            {
                path: "/feedbacks",
                element: <Feedbacks/>
            },
            {
                path: "/clients",
                element: <ClientsList/>
            },
            {
                path: "/products",
                element: <ProductsList/>
            },
            {
                path: "/remises",
                element: <Remises/>,
            },
             {
                path: "/warranty",
                element: <WarrantiesList/>,
            },
            {
                path: "/bon_livraison",
                element: <DeliveryList/>,
            }
            ]
    }
]);

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
    <React.StrictMode>
        <RouterProvider router={router}/>
    </React.StrictMode>
);


