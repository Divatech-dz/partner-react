import {useState} from 'react';
import PropTypes from "prop-types";
import {useNavigate} from "react-router-dom";
import TokenAuth from "../service/TokenAuth.js";

export default function Navbar({ menuOpen, setMenuOpen}) {
    const [linkActive, setLinkActive] = useState(false);
    const navigate = useNavigate();
    const {isAdmin, username} = TokenAuth();

    return (
        <header className="flex justify-between items-center fixed top-0 left-0 right-0 z-20 bg-white rounded-md shadow-lg px-8 py-2">
                <div className="mr-8 cursor-pointer" onClick={() => setMenuOpen(!menuOpen)}>
                    <svg className="w-8 h-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                         stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
                    </svg>
                </div>

                <div className="flex items-center gap-10">
                    {isAdmin &&
                        <a href="/clients"
                        className="flex items-center justify-between py-2 px-3 rounded-full hover:bg-gray-100 bg-opacity-20">
                        <svg id="People_24" width="24" height="24" viewBox="0 0 24 24"
                             xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
                            <rect width="24" height="24" stroke="none" fill="#000000" opacity="0"/>
                            <g transform="matrix(0.83 0 0 0.83 12 12)">
                                <path
                                    style={{
                                        stroke: 'none',
                                        strokeWidth: 1,
                                        fill: 'rgb(0,0,0)',
                                        fillRule: 'nonzero',
                                        opacity: 1
                                    }}
                                    transform="translate(-12, -12)"
                                    d="M 12 4 C 10.067003375592222 4 8.5 5.567003375592223 8.5 7.5 C 8.5 9.432996624407778 10.067003375592222 11 12 11 C 13.932996624407778 11 15.5 9.432996624407778 15.5 7.5 C 15.5 5.567003375592223 13.932996624407778 4 12 4 z M 4.5 7 C 3.1192881254230165 7 2 8.119288125423017 2 9.5 C 2 10.880711874576983 3.1192881254230165 12 4.5 12 C 5.880711874576983 12 7 10.880711874576983 7 9.5 C 7 8.119288125423017 5.880711874576983 7 4.5 7 z M 19.5 7 C 18.119288125423015 7 17 8.119288125423017 17 9.5 C 17 10.880711874576983 18.119288125423015 12 19.5 12 C 20.880711874576985 12 22 10.880711874576983 22 9.5 C 22 8.119288125423017 20.880711874576985 7 19.5 7 z M 12 13 C 9.664 13 5 14.173 5 16.5 L 5 20 L 19 20 L 19 16.5 C 19 14.173 14.336 13 12 13 z M 3.8984375 14.052734 C 2.3174375 14.296734 0 15.389078 0 16.705078 L 0 20 L 3 20 L 3 16.5 C 3 15.539 3.3454375 14.732734 3.8984375 14.052734 z M 20.101562 14.052734 C 20.654563 14.732734 21 15.539 21 16.5 L 21 20 L 24 20 L 24 16.705078 C 24 15.389078 21.682562 14.296734 20.101562 14.052734 z"
                                    strokeLinecap="round"
                                />
                            </g>
                        </svg>
                    </a>}

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
                                            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor"
                                                 viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                                            </svg>
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