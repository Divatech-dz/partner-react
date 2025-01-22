import {useState, useEffect, useRef} from 'react';
import PropTypes from "prop-types";
import Chart from 'chart.js/auto';

export default function SalesView () {
    const [dataArry] = useState([
        {date: '2024-04-01', codeBl: 'BL001', percentage: '10%', montantBl: 100, solde_note: 10},
        {date: '2024-04-02', codeBl: 'BL002', percentage: '15%', montantBl: 150, solde_note: 133.50},
        {date: '2024-04-03', codeBl: 'BL003', percentage: '25%', montantBl: 200, solde_note: 190.00},
        {date: '2024-04-03', codeBl: 'BL003', percentage: '30%', montantBl: 200, solde_note: 850.00},
        {date: '2024-04-03', codeBl: 'BL003', percentage: '15%', montantBl: 200, solde_note: 250.00},
        {date: '2024-04-03', codeBl: 'BL003', percentage: '80%', montantBl: 200, solde_note: 1986.00},
        {date: '2024-04-03', codeBl: 'BL003', percentage: '20%', montantBl: 200, solde_note: 125.00},
    ]);

     const chartRef = useRef(null);

    useEffect(() => {
        createLineChart();
    }, [dataArry]);

    const createLineChart = () => {
        const codeBlArray = dataArry.map(item => item.codeBl);
        const soldeNoteArray = dataArry.map(item => parseFloat(item.solde_note));

        const ctx = document.getElementById('lineChart').getContext('2d');

        if (chartRef.current) {
            chartRef.current.destroy();
        }

        chartRef.current = new Chart(ctx, {
            type: 'line',
            data: {
                labels: codeBlArray,
                datasets: [{
                    label: 'Solde Note',
                    data: soldeNoteArray,
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 2
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    };

    return (
        <div className="w-full">
            <div className="w-full flex flex-row">
                <div className="h-screen w-full">
                    <main className="w-full px-4 h-full overflow-hidden">
                        <section className="sales" id="sales-view">
                            <div className="w-full px-8 bg-auto bg-no-repeat bg-center">
                                <div className="">
                                    <div className="flex py-2 mt-4 mb-2 items-center border-b justify-between">
                                        <h3 className="text-3xl uppercase font-bold text-primary">Tableau De Bord
                                            Solde</h3>
                                    </div>
                                    <div className="flex flex-wrap -mx-3">
                                        <div className="flex-none w-full max-w-full px-3">
                                            <div
                                                className="relative flex flex-col min-w-0 mb-6 break-words bg-white border-0 border-transparent border-solid shadow-soft-xl rounded-2xl bg-clip-border">
                                                <div className="flex-auto px-0 pt-0 pb-2">
                                                    <div
                                                        className="flex justify-between space-x-2 flex-col sm:flex-row w-full">
                                                        <div className="bg-gray-100 relative w-full sm:w-3/4">
                                                            <canvas id="lineChart"></canvas>
                                                        </div>
                                                        <div
                                                            className="w-full sm:w-1/4 flex flex-col backdrop-blur-sm bg-white text-gray-700 rounded-md justify-center text-center">
                                                            <div className="border-b-2 mb-3">
                                                                <div className="font-bold text-center uppercase">Total
                                                                    TTC
                                                                </div>
                                                                <div className="text-center">91 647,77 DZD</div>
                                                            </div>
                                                            <div className="border-b-2 mb-3">
                                                                <div className="font-bold text-center uppercase">Bonus
                                                                    converti
                                                                </div>
                                                                <div className="text-center">0 DZD</div>
                                                            </div>
                                                            <div className="text-green-500 border-green-500 border-b-2">
                                                                <div className="font-bold text-center uppercase">Total
                                                                    Remise
                                                                </div>
                                                                <div className="text-center">91 647,77 DZD</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="p-0 overflow-x-auto">
                                                        <table
                                                            className="items-center mt-4 w-full mb-0 align-top border-gray-200 text-slate-500">
                                                            <thead className="align-bottom bg-gray-100">
                                                            <tr>
                                                                <th className="px-6 py-3 font-bold text-left uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70">CODE
                                                                    BL
                                                                </th>
                                                                <th className="px-6 py-3 pl-2 font-bold text-left uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70">Date
                                                                    BL
                                                                </th>
                                                                <th className="px-6 py-3 font-bold text-center uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70">Montant
                                                                    BL
                                                                </th>
                                                                <th className="px-6 py-3 font-bold text-center uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70">Pourcentage
                                                                    Remise
                                                                </th>
                                                                <th className="px-6 py-3 font-bold text-center uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70">Montant
                                                                    Remise
                                                                </th>
                                                            </tr>
                                                            </thead>
                                                            <tbody>
                                                            {dataArry.map((invoice, index) => (
                                                                <tr key={index}
                                                                    className="hover:bg-gray-50 hover:shadow-lg">
                                                                    <td className="p-2 align-middle bg-transparent border-b whitespace-nowrap shadow-transparent">
                                                                        <div className="flex px-2 py-1">
                                                                            <div
                                                                                className="flex flex-col justify-center">
                                                                                <h6 className="mb-0 leading-normal text-sm">{invoice.codeBl}</h6>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td className="p-2 align-middle bg-transparent border-b whitespace-nowrap shadow-transparent">
                                                                        <p className="mb-0 font-semibold leading-tight text-xs">{invoice.date}</p>
                                                                    </td>
                                                                    <td className="p-2 text-center align-middle bg-transparent border-b whitespace-nowrap shadow-transparent">
                                                                        <p className="mb-0 font-semibold leading-tight text-xs">{invoice.montantBl}</p>
                                                                    </td>
                                                                    <td className="p-2 leading-normal text-center align-middle bg-transparent border-b text-sm whitespace-nowrap shadow-transparent">
                                                                        <span
                                                                            className="px-3.6 text-xs rounded-1.8 py-2.2 inline-block whitespace-nowrap text-center align-baseline font-bold uppercase leading-none">{invoice.percentage}</span>
                                                                    </td>
                                                                    <td className="p-2 align-middle text-center bg-transparent border-b whitespace-nowrap shadow-transparent">
                                                                        <a href="javascript"
                                                                           className="font-semibold leading-tight text-xs text-slate-400">{invoice.solde_note}</a>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </main>
                </div>
            </div>
        </div>
    );
};

SalesView.propTypes = {
    dataArry: PropTypes.array
};
