import { useState } from 'react';
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import { 
  HiMenu, 
  HiShoppingCart, 
  HiUserGroup, 
  HiLogout 
} from 'react-icons/hi';
import TokenAuth from "../service/TokenAuth.js";
import CartDropdown from './CartDropdown.jsx';
import { toggleCart } from '../store/slices/pcBuildSlice';
import OrderProviders from '../providers/OrderProviders.jsx';
import ClientProviders from '../providers/ClientProviders.jsx';

export default function Navbar({ menuOpen, setMenuOpen}) {
    const [linkActive, setLinkActive] = useState(false);
    const navigate = useNavigate();
    const {isAdmin, username} = TokenAuth();
    
    const dispatch = useDispatch();
    const { items, pcBuilds, total } = useSelector(state => state.cart);
    const { isCartOpen } = useSelector(state => state.pcBuild);

    // Correct cart items count calculation
    const cartItemsCount = items.reduce((count, item) => count + item.qty, 0) + pcBuilds.length;

    return (
        <header className="flex justify-between items-center fixed top-0 left-0 right-0 z-50 bg-white rounded-md shadow-lg px-8 py-2">
            <div className="mr-8 cursor-pointer" onClick={() => setMenuOpen(!menuOpen)}>
                <HiMenu className="w-8 h-8" />
            </div>

            <div className="flex items-center gap-10">
                {/* Cart Icon */}
                <div className="relative">
                    <button
                        onClick={() => dispatch(toggleCart())}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <HiShoppingCart className="w-6 h-6 text-red-600" />
                        <span className="bg-red-600 text-white text-xs rounded-full px-2 py-1 min-w-6 text-center">
                            {cartItemsCount}
                        </span>
                        <span className="text-red-600 font-semibold">
                            {total.toFixed(2)} DZD
                        </span>
                    </button>
                    
                    {/* Cart Dropdown */}
                    {isCartOpen &&  <ClientProviders> <OrderProviders> <CartDropdown />   </OrderProviders> </ClientProviders>}
                </div>

                {isAdmin && (
                    <a href="/clients"
                       className="flex items-center justify-between py-2 px-3 rounded-full hover:bg-gray-100 bg-opacity-20">
                        <HiUserGroup className="w-6 h-6" />
                    </a>
                )}

                <div className="relative">
                    <div
                        onClick={() => setLinkActive(!linkActive)}
                        className="cursor-pointer text-red-700 font-bold p-2"
                    >
                       Bienvenue {username}
                    </div>

                    {linkActive && (
                        <div className="absolute right-0 w-40 top-10 border border-gray-300 z-20"
                             onClick={() => setLinkActive(!linkActive)}>
                            <div className="bg-white rounded">
                                <hr/>
                                    <div className="flex items-center gap-3 py-2 px-3 hover:bg-gray-100 bg-opacity-20 cursor-pointer">
                                        <HiLogout className="w-5 h-5 text-red-600" />
                                        <button type="button" onClick={() => {
                                            localStorage.removeItem('token');
                                            localStorage.removeItem('clients');
                                            localStorage.getItem('userClient') && localStorage.removeItem('userClient');
                                            localStorage.getItem('userClientId') && localStorage.removeItem('userClientId')
                                            navigate('/login');
                                        }}
                                                className="text-sm text-gray-600 font-bold capitalize">
                                            Déconnexion
                                        </button>
                                    </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

Navbar.propTypes = {
    username: PropTypes.string,
    role: PropTypes.string,
    menuOpen: PropTypes.bool,
    setMenuOpen: PropTypes.func,
};