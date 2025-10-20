
import {useEffect, useState} from "react";
import {Outlet, useNavigate, useLocation} from "react-router-dom";
import PropTypes from "prop-types";
import Navbar from "./components/Navbar.jsx";
import Sidebar from "./components/Sidebar.jsx";
import {Bounce, ToastContainer} from "react-toastify";

function App() {
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const isLoginPage = location.pathname === '/login';
        
        if (!token && !isLoginPage) {
            navigate('/login');
        } else if (token && isLoginPage) {
            // If user has token and tries to access login page, redirect to home
            navigate('/');
        }
    }, [navigate, location]);

    const isLoginPage = location.pathname === '/login';

    return (
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
    );
}

export default App