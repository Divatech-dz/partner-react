import {useCallback, useEffect, useRef} from 'react';
import PropTypes from "prop-types";
import Chart from 'chart.js/auto';

export default function PaymentState({
                                         montantSolde,
                                         chiffreAffaire,
                                         montantPayed,
                                         montantAnnule,
                                         paiementPerm,
                                         listeRegs
                                     }) {

    const chartRef = useRef(null);

    const createLineChart = useCallback(() => {
        const dateArray = paiementPerm?.map(item => item.date);
        const montantArray = paiementPerm?.map(item => parseFloat(item.montantBl));
        const chartData = {
            labels: dateArray,
            datasets: [{
                label: 'Sales',
                borderColor: '#ff0c3b',
                backgroundColor: 'rgba(241, 144, 163, 0.5)',
                fill: true,
                tension: 0.4,
                borderWidth: 2,
                data: montantArray
            }]
        };

        const config = {
            type: 'line',
            data: chartData,
            options: {
                plugins: {
                    legend: {
                        display: false
                    }
                },
                elements: {
                    line: {
                        borderWidth: 2
                    }
                }
            }
        };

        if (chartRef.current) {
            chartRef.current.destroy();
        }

        chartRef.current = new Chart(document.getElementById('myChart'), config);

    }, [paiementPerm]);

    useEffect(() => {
        createLineChart();
    }, [createLineChart]);

    return (
        <section className="w-full bg-center overflow-hidden bg-white/50">
            <div className="mb-4 pt-6 px-4 w-full grid grid-cols-1 md:grid-cols-4 gap-4">
                <div
                    className="flex items-center flex-shrink-0 bg-gradient-to-t from-white shadow rounded-lg p-4 sm:p-6 xl:p-8">
                    <div className="">
                                            <span
                                                className="text-2xl sm:text-3xl leading-none font-bold TextGradient">{montantSolde}</span>
                        <h3 className="text-base font-normal TextGradient">Solde</h3>
                    </div>
                </div>
                <div
                    className="flex items-center flex-shrink-0 bg-gradient-to-t from-white shadow rounded-lg p-4 sm:p-6 xl:p-8">
                                            <span
                                                className="text-2xl sm:text-3xl leading-none font-bold TextGradient">{chiffreAffaire}</span>
                    <h3 className="text-base font-normal TextGradient">Chiffre Affaire</h3>
                </div>
                <div
                    className="flex items-center flex-shrink-0 bg-gradient-to-t from-white shadow rounded-lg p-4 sm:p-6 xl:p-8">
                                            <span
                                                className="text-2xl sm:text-3xl leading-none font-bold TextGradient">{montantPayed}</span>
                    <h3 className="text-base font-normal TextGradient">Montant Réglé</h3>
                </div>
                <div
                    className="flex items-center flex-shrink-0 bg-gradient-to-t from-white shadow rounded-lg p-4 sm:p-6 xl:p-8">
                                            <span
                                                className="text-2xl sm:text-3xl leading-none font-bold TextGradient">{montantAnnule}</span>
                    <h3 className="text-base font-normal TextGradient">Montant Annulé</h3>
                </div>
            </div>
            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white shadow rounded-lg p-4 sm:p-6 xl:p-8 md:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex-shrink-0">
                            <span className="text-2xl sm:text-3xl leading-none font-bold text-gray-900">Evolution de Chiffre d&#39;affaire</span>
                            <h3 className="text-base font-normal text-gray-500">Evolution
                                temporelle</h3>
                        </div>
                    </div>
                    <div className="container mx-auto mt-8">
                        <canvas id="myChart"></canvas>
                    </div>
                </div>
                <div className="bg-white shadow rounded-lg p-4 sm:p-6 xl:p-8">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Les reglements
                                éffectués</h3>
                            <span className="text-base font-normal text-gray-500">La liste des règlements déposé</span>
                        </div>
                        <div className="flex-shrink-0">
                            <a href="#"
                               className="text-sm font-medium TextGradient hover:bg-gray-100 rounded-lg p-2">Voir
                                tout</a>
                        </div>
                    </div>
                    <table className="flex flex-col mt-8 min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th scope="col"
                                className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date
                            </th>
                            <th scope="col"
                                className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white">
                        {listeRegs?.map((item, index) => (
                            <tr key={index}>
                                <td className="p-4 whitespace-nowrap text-sm font-normal text-gray-500">{item.dateReglement}</td>
                                <td className="p-4 whitespace-nowrap text-sm font-semibold text-gray-900">{item.montant}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
};

PaymentState.propTypes = {
    montantSolde: PropTypes.number,
    chiffreAffaire: PropTypes.number,
    montantPayed: PropTypes.number,
    montantAnnule: PropTypes.number,
    paiementPerm: PropTypes.array,
    listeRegs: PropTypes.array
};