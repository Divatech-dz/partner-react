import './App.css'
import {useEffect, useState} from "react";
import {Outlet, useNavigate, useLocation} from "react-router-dom";
import LoginProviders from "./providers/LoginProviders.jsx";
import ClientProviders from "./providers/ClientProviders.jsx";
import UsersProviders from "./providers/UsersProviders.jsx";
import PropTypes from "prop-types";
import Navbar from "./components/Navbar.jsx";
import Sidebar from "./components/Sidebar.jsx";
import ProductsProviders from "./providers/ProductsProviders.jsx";
import DeliveryProviders from "./providers/DeliveryProviders.jsx";
import WarrantiesProviders from "./providers/WarrantiesProviders.jsx";
import ReturnsProviders from "./providers/ReturnsProviders.jsx";
import OrderProviders from "./providers/OrderProviders.jsx";
import FeedbackProviders from "./providers/FeedbackProviders.jsx";
import {Bounce, ToastContainer} from "react-toastify";

function Providers({children}) {
    return (
        <LoginProviders>
            <UsersProviders>
                <ClientProviders>
                    <ReturnsProviders>
                        <ProductsProviders>
                            <DeliveryProviders>
                                <WarrantiesProviders>
                                    <OrderProviders>
                                        <FeedbackProviders>
                                            {children}
                                        </FeedbackProviders>
                                    </OrderProviders>
                                </WarrantiesProviders>
                            </DeliveryProviders>
                        </ProductsProviders>
                    </ReturnsProviders>
                </ClientProviders>
            </UsersProviders>
        </LoginProviders>
    )
}

function App() {
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
        }
    }, [navigate]);

    const isLoginPage = location.pathname === '/login';

    return (
        <Providers>
            <div>
                {!isLoginPage && <Sidebar menuOpen={menuOpen} setMenuOpen={setMenuOpen}/>}
                <div className="flex flex-col gap-1"
                     style={{
                         paddingTop: '4rem',
                         paddingLeft: menuOpen ? '19rem' : '0',
                     }}>
                    {!isLoginPage && <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen}/>}
                    <Outlet/>
                </div>
                <ToastContainer
                    position="top-right"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop={true}
                    closeOnClick={true}
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="light"
                    transition={Bounce}
                />
            </div>
        </Providers>
    );
}

Providers.propTypes = {
    children: PropTypes.node.isRequired
}

export default App