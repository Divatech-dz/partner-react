import React from 'react';
import exportExcel from "../../public/assets/button/excel.png";

export default function Filtering() {

    return (
        <section className="py-2 mt-4 flex justify-center items-center gap-4 border-b border-t px-2">
            <div>
                <input
                    type="text"
                    value={search}
                    placeholder="Rechercher un client"
                    onChange={(e) => setSearch(e.target.value)}
                    className="border-red-700 border rounded-md p-2 w-64"
                />
            </div>
            <div>
                <input
                    type="date"
                    value={date}
                    placeholder="Rechercher un client"
                    onChange={(e) => setDate(e.target.value)}
                    className="border-red-700 border rounded-md p-2 w-64"
                />
            </div>
            <div>
                <select
                    className="border-red-700 border rounded-md p-2"
                    onChange={(e) => setStatus(e.target.value)}
                >
                    <option value="">Tous les états</option>
                    <option value="en-attente">En-attente</option>
                    <option value="validé">Validé</option>

                </select>
            </div>
            <div className="size-10 cursor-pointer"
                 onClick={exportExcelStock}>
                <img src={exportExcel} alt="exporter excel"/>
            </div>
        </section>
    );
}