import React, {useEffect, useState} from 'react';
import {useWarrantiesContext} from "../context/WarrantiesContext.js";
import TokenAuth from "../service/TokenAuth.js";
import erase from "../../public/assets/button/delete.png";
import openProduct from "../../public/assets/button/add.png";
import closeProduct from "../../public/assets/button/close.png";


export default function WarrantiesList() {
    const {warranties} = useWarrantiesContext();
    const {isAdmin} = TokenAuth();
    const [search, setSearch] = useState('');
    const [pickDate, setPickDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [selectedRow, setSelectedRow] = useState(null);

    const filteredWarraties = () => {
        return warranties
            .filter(option =>
                (option.idBon.toLowerCase().includes(search.toLowerCase()) ||
                    option.client.toLowerCase().includes(search.toLowerCase()) ||
                    option.idBonLivrison.toLowerCase().includes(search.toLowerCase())) &&
                option.date >= pickDate
            )
            .sort((a, b) => new Date(a.date) - new Date(b.date))
    };

    useEffect(() => {
        currentPage !== 1 && setCurrentPage(1);
    }, [search, pickDate]);

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentWarraties = filteredWarraties().slice(startIndex, endIndex);

    const totalPages = Math.max(1, Math.ceil(filteredWarraties().length / pageSize));

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handleShowProducts = (index) => {
        setSelectedRow(selectedRow === index ? null : index);
    }

    return (
        <section className="flex flex-col gap-4 w-full overflow-hidden px-4 bg-auto bg-no-repeat bg-center">
            <h1 className="text-3xl text-center uppercase font-bold">Bon de garanties</h1>
            <div className="py-2 flex justify-center gap-6 border-b px-2">
                    <div className="relative">
                        <input type="text" placeholder="Rechercher un bon"
                               className="px-4 py-3 rounded-lg shadow-sm focus:outline-none focus:shadow-outline bg-gray-50 text-gray-600 font-medium w-full"
                               value={search} onChange={(e) => setSearch(e.target.value)}
                        />
                        <button type="button" onClick={() => setSearch('')}
                                className="absolute top-1/2 right-3 transform -translate-y-1/2">
                            <img src={erase} alt="erase" className="size-4"/>
                        </button>
                    </div>
                    <input type='date' value={pickDate} onChange={event => setPickDate(event.target.value)}/>
            </div>
            <table className="items-center overflow-hidden w-full mb-0 align-top border-gray-200 text-black">
                <thead className="align-bottom border-b-2 bg-gray-100">
                <tr>
                    <td className="px-1 py-3 font-bold uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70">Bon
                        de garantie
                    </td>
                    <td className="px-1 py-3 font-bold uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70">Date
                        de bon
                    </td>
                    <td className="px-1 py-3 font-bold uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70">Bon
                        associé
                    </td>
                    {isAdmin && <td
                        className="px-1 py-3 font-bold uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70">Client</td>}
                    <td className="px-1 py-3 font-bold uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70">temps
                        écoulé
                    </td>
                    <td className="px-6 py-3 font-bold text-center uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70">Actions</td>
                </tr>
                </thead>
                <tbody className="text-sm bg-center py-4">
                {currentWarraties?.map((waranty, index) => (
                    <React.Fragment key={index}>
                        <tr className="hover:shadow-lg border-b transition duration-200">
                            <td className="py-3 pl-2">{waranty.idBon}</td>
                            <td className="py-3 pl-2">{waranty.date}</td>
                            <td className="py-3 pl-2">{waranty.idBonLivrison}</td>
                            {isAdmin && <td className="py-3 pl-2">{waranty.client}</td>}
                            <td className="py-3 pl-2"> {waranty.tps_ecoule > 0 && `${waranty.tps_ecoule} jours`}</td>
                            <td className="py-3 pl-2 flex justify-center items-center space-x-2">
                                <button type="button" onClick={() => handleShowProducts(index)}>
                                    {selectedRow === index ?
                                        <img src={closeProduct} alt="close" className="size-4"/> :
                                        <img src={openProduct} alt="open" className="size-6"/>
                                    }
                                </button>
                            </td>
                        </tr>
                        {selectedRow === index && (
                            <tr>
                                <td colSpan="8">
                                    <table className="w-full border-2">
                                        <thead>
                                        <tr className="bg-gray-100">
                                            <td className="px-1 py-3 w-10 font-bold border-r-2 border-r-gray-200 uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70">Produit</td>
                                            <td className="px-1 py-3 w-20 font-bold border-r-2 border-r-gray-200 uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70">Référence</td>
                                            <td className="px-1 py-3 w-10 font-bold border-r-2 border-r-gray-200 uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70">Quantité</td>
                                            <td className="px-1 py-3 w-40 font-bold border-r-2 border-r-gray-200 uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70">Numéros
                                                de série
                                            </td>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {waranty.produits.map((product, productIndex) => (
                                            <tr key={productIndex}>
                                                <td className="px-1 py-3 font-bold border-r-2 border-r-gray-200 uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70">{product.name}</td>
                                                <td className="px-1 py-3 font-bold border-r-2 border-r-gray-200 uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70">{product.reference}</td>
                                                <td className="px-1 py-3 font-bold border-r-2 border-r-gray-200 uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70">{product.quantity}</td>
                                                <td className="px-1 py-3 font-bold border-r-2 border-r-gray-200 uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70">
                                                    {
                                                        product.NumeroSeries.split(",").map((num, index) => (
                                                            <div key={index}>{num.replace(/['[\]]/g, "")}</div>
                                                        ))
                                                    }
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        )}
                    </React.Fragment>
                ))}
                </tbody>
            </table>
            <div className="flex justify-between py-4">
                <button disabled={currentPage === 1} onClick={prevPage}>
                    <svg id="chevrons-left_24" width="24" height="24"
                         viewBox="0 0 24 24"
                         xmlns="http://www.w3.org/2000/svg"
                         xmlnsXlink="http://www.w3.org/1999/xlink">
                        <rect width="24" height="24" stroke="none"
                              fill="#000000" opacity="0"/>
                        <g transform="matrix(1 0 0 1 12 12)">
                            <g>
                                <g transform="matrix(1 0 0 1 0 0)">
                                    <path
                                        style={{
                                            stroke: 'none',
                                            strokeWidth: 2,
                                            strokeDasharray: 'none',
                                            strokeLinecap: 'round',
                                            strokeDashoffset: 0,
                                            strokeLinejoin: 'round',
                                            strokeMiterlimit: 4,
                                            fill: 'none',
                                            fillRule: 'nonzero',
                                            opacity: 1
                                        }}
                                        transform="translate(-12, -12)"
                                        d="M 0 0 L 24 0 L 24 24 L 0 24 z"
                                        strokeLinecap="round"
                                    />
                                </g>
                                <g transform="matrix(1 0 0 1 -3.75 -0.25)">
                                    <polyline
                                        style={{
                                            stroke: 'rgb(0,0,0)',
                                            strokeWidth: 1.5,
                                            strokeDasharray: 'none',
                                            strokeLinecap: 'round',
                                            strokeDashoffset: 0,
                                            strokeLinejoin: 'round',
                                            strokeMiterlimit: 4,
                                            fill: 'none',
                                            fillRule: 'nonzero',
                                            opacity: 1
                                        }}
                                        points="2.5,-5 -2.5,0 2.5,5"
                                    />
                                </g>
                                <g transform="matrix(1 0 0 1 2.25 -0.25)">
                                    <polyline
                                        style={{
                                            stroke: 'rgb(0,0,0)',
                                            strokeWidth: 1.5,
                                            strokeDasharray: 'none',
                                            strokeLinecap: 'round',
                                            strokeDashoffset: 0,
                                            strokeLinejoin: 'round',
                                            strokeMiterlimit: 4,
                                            fill: 'none',
                                            fillRule: 'nonzero',
                                            opacity: 1
                                        }}
                                        points="2.5,-5 -2.5,0 2.5,5"
                                    />
                                </g>
                            </g>
                        </g>
                    </svg>
                </button>
                <div>
                    Page
                    <select
                        value={currentPage}
                        onChange={(e) => setCurrentPage(Number(e.target.value))}
                        className="text-center w-16"
                    >
                        {Array.from({length: totalPages}, (_, i) => (<option key={i + 1} value={i + 1}>
                            {i + 1}
                        </option>))}
                    </select>
                    of {totalPages}
                </div>
                <button disabled={currentPage === totalPages}
                        onClick={nextPage}>
                    <svg id="chevrons-right_24" width="24" height="24"
                         viewBox="0 0 24 24"
                         xmlns="http://www.w3.org/2000/svg"
                         xmlnsXlink="http://www.w3.org/1999/xlink">
                        <rect width="24" height="24" stroke="none"
                              fill="#000000" opacity="0"/>
                        <g transform="matrix(1 0 0 1 12 12)">
                            <g>
                                <g transform="matrix(1 0 0 1 0 0)">
                                    <path
                                        style={{
                                            stroke: 'none',
                                            strokeWidth: 2,
                                            strokeDasharray: 'none',
                                            strokeLinecap: 'round',
                                            strokeDashoffset: 0,
                                            strokeLinejoin: 'round',
                                            strokeMiterlimit: 4,
                                            fill: 'none',
                                            fillRule: 'nonzero',
                                            opacity: 1
                                        }}
                                        transform="translate(-12, -12)"
                                        d="M 0 0 L 24 0 L 24 24 L 0 24 z"
                                        strokeLinecap="round"
                                    />
                                </g>
                                <g transform="matrix(1 0 0 1 -2.75 -0.25)">
                                    <polyline
                                        style={{
                                            stroke: 'rgb(0,0,0)',
                                            strokeWidth: 1.5,
                                            strokeDasharray: 'none',
                                            strokeLinecap: 'round',
                                            strokeDashoffset: 0,
                                            strokeLinejoin: 'round',
                                            strokeMiterlimit: 4,
                                            fill: 'none',
                                            fillRule: 'nonzero',
                                            opacity: 1
                                        }}
                                        points="-2.5,-5 2.5,0 -2.5,5"
                                    />
                                </g>
                                <g transform="matrix(1 0 0 1 3.25 -0.25)">
                                    <polyline
                                        style={{
                                            stroke: 'rgb(0,0,0)',
                                            strokeWidth: 1.5,
                                            strokeDasharray: 'none',
                                            strokeLinecap: 'round',
                                            strokeDashoffset: 0,
                                            strokeLinejoin: 'round',
                                            strokeMiterlimit: 4,
                                            fill: 'none',
                                            fillRule: 'nonzero',
                                            opacity: 1
                                        }}
                                        points="-2.5,-5 2.5,0 -2.5,5"
                                    />
                                </g>
                            </g>
                        </g>
                    </svg>
                </button>
            </div>
        </section>
    );
};

