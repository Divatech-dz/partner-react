import React from 'react';
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import './index.css';
import App from './App.jsx';
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
import RetourList from './pages/RetourList.jsx';
import LoginProviders from "./providers/LoginProviders.jsx";
import ClientProviders from "./providers/ClientProviders.jsx";
import UsersProviders from "./providers/UsersProviders.jsx";
import ProductsProviders from "./providers/ProductsProviders.jsx";
import DeliveryProviders from "./providers/DeliveryProviders.jsx";
import WarrantiesProviders from "./providers/WarrantiesProviders.jsx";
import ReturnsProviders from "./providers/ReturnsProviders.jsx";
import OrderProviders from "./providers/OrderProviders.jsx";
import FeedbackProviders from "./providers/FeedbackProviders.jsx";
import ProtectedRoute from './service/ProtectedRoute.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

// Simple wrapper for login (only LoginProviders)
function LoginWrapper({ children }) {
    return (
        <LoginProviders>
            {children}
        </LoginProviders>
    );
}

// Main router configuration
const router = createBrowserRouter([
    {
        path: "/login",
        element: (
            <LoginWrapper>
                <LoginPage />
            </LoginWrapper>
        ),
    },
    {
        element: <App />,
        children: [
            {
                path: "/",
                element: (
                    <ClientProviders>
                        <DeliveryProviders>
                            <WarrantiesProviders>
                                <ReturnsProviders>
                                    <OrderProviders>
                                        <SalesView />
                                    </OrderProviders>
                                </ReturnsProviders>
                            </WarrantiesProviders>
                        </DeliveryProviders>
                    </ClientProviders>
                ),
            },
            {
                path: "/commandes",
                element: (
                    <ProtectedRoute>
                        <ClientProviders>
                            <OrderProviders>
                                <OrdersList />
                            </OrderProviders>
                        </ClientProviders>
                    </ProtectedRoute>
                ),
            },
            {
                path: "/etat_retour",
                element: (
                    <ProtectedRoute>
                        <ClientProviders>
                            <ReturnsProviders>
                                <ReturnsNote />
                            </ReturnsProviders>
                        </ClientProviders>
                    </ProtectedRoute>
                ),
            },
            {
                path: "/paiements",
                element: <PaymentState />,
            },
            {
                path: "/feedbacks",
                element: (
                    <ProtectedRoute>
                        <ClientProviders>
                            <FeedbackProviders>
                                <Feedbacks />
                            </FeedbackProviders>
                        </ClientProviders>
                    </ProtectedRoute>
                ),
            },
            {
                path: "/clients",
                element: (
                    <ProtectedRoute>
                        <ClientProviders>
                            <UsersProviders>
                                <ClientsList />
                            </UsersProviders>
                        </ClientProviders>
                    </ProtectedRoute>
                ),
            },
            {
                path: "/products",
                element: (
                    <ErrorBoundary>
                        <ProtectedRoute>
                            <ClientProviders>
                                <OrderProviders>
                                    <ProductsProviders>
                                        <ProductsList />
                                    </ProductsProviders>
                                </OrderProviders>
                            </ClientProviders>
                        </ProtectedRoute>
                    </ErrorBoundary>
                ),
            },
            {
                path: "/remises",
                element: <Remises />,
            },
            {
                path: "/warranty",
                element: (
                    <ProtectedRoute>
                        <ClientProviders>
                            <WarrantiesProviders>
                                <WarrantiesList />
                            </WarrantiesProviders>
                        </ClientProviders>
                    </ProtectedRoute>
                ),
            },
      {
    path: "/bon_livraison",
    element: (
        <ProtectedRoute>
            <ClientProviders>
                <DeliveryProviders>
                    <ReturnsProviders>
                        <DeliveryList />
                    </ReturnsProviders>
                </DeliveryProviders>
            </ClientProviders>
        </ProtectedRoute>
    ),
},
{
    path: "/bon_retour",
    element: (
        <ProtectedRoute>
            <ClientProviders>
                <ReturnsProviders>
                    <RetourList />
                </ReturnsProviders>
            </ClientProviders>
        </ProtectedRoute>
    ),
},
        ],
    },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
);