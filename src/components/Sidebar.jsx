import {Link, NavLink} from 'react-router-dom';
import PropTypes from "prop-types";
import links from "../data/SidebarLinks.json";
import logo from "../assets/images/logodiva.png"

export default function Sidebar({menuOpen, setMenuOpen}) {
    const {pathname} = location;

    return (
        menuOpen &&
        <aside
            className='fixed flex h-screen w-72.5 mt-14 flex-col bg-black'
            style={{transition: 'transform 0.3s ease-in-out', transform: menuOpen ? 'translateX(0)' : 'translateX(50%)'}}
        >
            <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5">
                <div className="flex items-center justify-center p-5 h-10">
                    <Link to="/"><img src={logo} alt="Logo"/></Link>
                </div>

                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-controls="sidebar"
                    aria-expanded={menuOpen}
                    className="block lg:hidden"
                >
                    <svg
                        className="fill-current"
                        width="20"
                        height="18"
                        viewBox="0 0 20 18"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M19 8.175H2.98748L9.36248 1.6875C9.69998 1.35 9.69998 0.825 9.36248 0.4875C9.02498 0.15 8.49998 0.15 8.16248 0.4875L0.399976 8.3625C0.0624756 8.7 0.0624756 9.225 0.399976 9.5625L8.16248 17.4375C8.31248 17.5875 8.53748 17.7 8.76248 17.7C8.98748 17.7 9.17498 17.625 9.36248 17.475C9.69998 17.1375 9.69998 16.6125 9.36248 16.275L3.02498 9.8625H19C19.45 9.8625 19.825 9.4875 19.825 9.0375C19.825 8.55 19.45 8.175 19 8.175Z"
                            fill=""
                        />
                    </svg>
                </button>
            </div>

            <nav className="flex flex-col mt-5 py-4 px-4 lg:mt-9 lg:px-6">
                <div>
                    <h3 className="mb-4 ml-4 text-sm font-semibold text-bodydark2">
                        MENU
                    </h3>
                    <ul className="mb-6 flex flex-col gap-1.5">
                        {links.map((link) => (
                            <li key={link.id}>
                                <NavLink
                                    to={link.path}
                                    className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${
                                        pathname.includes(link.path) &&
                                        'bg-graydark dark:bg-meta-4'
                                    }`}
                                >
                                    {link.title}
                                </NavLink>
                            </li>
                        ))
                        }
                    </ul>
                </div>
            </nav>
        </aside>
    )
        ;
};

Sidebar.propTypes = {
    menuOpen: PropTypes.bool,
    setMenuOpen: PropTypes.func,
};