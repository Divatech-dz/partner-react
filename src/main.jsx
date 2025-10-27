import React from 'react';
import ReactDOM from "react-dom/client";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { Provider } from 'react-redux';
import { store } from './store/index.js';
import './index.css';
import App from './App.jsx';
import SalesView from "./pages/SalesView.jsx";
import OrdersList from "./pages/OrdersList.jsx";
import ReturnsNote from "./pages/ReturnsNote.jsx";
import PaymentState from "./pages/PaymentState.jsx";
import Feedbacks from "./pages/Feedbacks.jsx";
import ClientsList from "./pages/ClientsList.jsx";
import ProductsList from "./pages/ProductsList.jsx";
import ProductsList1 from "./pages/ProductsList1.jsx";
import Remises from "./pages/Remises.jsx";
import WarrantiesList from "./pages/WarrantiesList.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import DeliveryList from "./pages/DeliveryList.jsx";
import RetourList from './pages/RetourList.jsx';
import LoginProviders from "./providers/LoginProviders.jsx";
import ProtectedRoute from './service/ProtectedRoute.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import TokenAuth from './service/TokenAuth.js';

// Simple wrapper for login (only LoginProviders)
function LoginWrapper({ children }) {
    return (
        <LoginProviders>
            {children}
        </LoginProviders>
    );
}

// Public route wrapper - redirect to home if already authenticated
function PublicRoute({ children }) {
    const { token } = TokenAuth();
    
    if (token) {
        return <Navigate to="/" replace />;
    }
    
    return children;
}

// Main router configuration
const router = createBrowserRouter([
    {
        path: "/login",
        element: (
            <PublicRoute>
                <LoginWrapper>
                    <LoginPage />
                </LoginWrapper>
            </PublicRoute>
        ),
    },
    {
        element: <App />,
        children: [
            {
                path: "/",
                element: (
                    <ProtectedRoute>
                        <SalesView />
                    </ProtectedRoute>
                ),
            },
            {
                path: "/commandes",
                element: (
                    <ProtectedRoute>
                        <OrdersList />
                    </ProtectedRoute>
                ),
            },
            {
                path: "/etat_retour",
                element: (
                    <ProtectedRoute>
                        <ReturnsNote />
                    </ProtectedRoute>
                ),
            },
            {
                path: "/paiements",
                element: (
                    <ProtectedRoute>
                        <PaymentState />
                    </ProtectedRoute>
                ),
            },
            {
                path: "/feedbacks",
                element: (
                    <ProtectedRoute>
                        <Feedbacks />
                    </ProtectedRoute>
                ),
            },
            {
                path: "/clients",
                element: (
                    <ProtectedRoute>
                        <ClientsList />
                    </ProtectedRoute>
                ),
            },
            {
                path: "/products",
                element: (
                    <ErrorBoundary>
                        <ProtectedRoute>
                            <ProductsList />
                        </ProtectedRoute>
                    </ErrorBoundary>
                ),
            },
             {
                path: "/products-list",
                element: (
                    <ErrorBoundary>
                        <ProtectedRoute>
                            <ProductsList1 />
                        </ProtectedRoute>
                    </ErrorBoundary>
                ),
            },
            {
                path: "/remises",
                element: (
                    <ProtectedRoute>
                        <Remises />
                    </ProtectedRoute>
                ),
            },
            {
                path: "/warranty",
                element: (
                    <ProtectedRoute>
                        <WarrantiesList />
                    </ProtectedRoute>
                ),
            },
            {
                path: "/bon_livraison",
                element: (
                    <ProtectedRoute>
                        <DeliveryList />
                    </ProtectedRoute>
                ),
            },
            {
                path: "/bon_retour",
                element: (
                    <ProtectedRoute>
                        <RetourList />
                    </ProtectedRoute>
                ),
            },
        ],
    },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>
);