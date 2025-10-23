import {useState} from "react";
import {Outlet, useLocation} from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Sidebar from "./components/Sidebar.jsx";
import {Bounce, ToastContainer} from "react-toastify";

function App() {
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();

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

export default App;