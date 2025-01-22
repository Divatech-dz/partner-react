import {useState,} from 'react';
import {useProductsContext} from "../context/ProductsContext";
import OrderTable from "../components/orders/OrderTable.jsx";
import logoHeader from '../../public/assets/images/logos_header.png';
import bgProducts from '../../public/assets/images/bg_produits.png';
import print from '../../public/assets/button/print.png';
import exportExcel from '../../public/assets/button/excel.png';
import previous from "../../public/assets/button/previous.png";
import next from "../../public/assets/button/next.png";

export default function ProductsList() {
    const itemToModify = JSON.parse(localStorage.getItem('order'));
    const isModify = localStorage.getItem('isModify') === 'true';
    const [showSummary, setShowSummary] = useState(false)
    const [orderItems, setOrderItems] = useState(itemToModify?.produits ?? []);
    const [openPreview, setOpenPreview] = useState(false);
    const [note, setNote] = useState('');
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(20);
    const [category, setCategory] = useState("");
    const {products} = useProductsContext();
    let orderId = null;
    if(itemToModify) {
       orderId= itemToModify?.id
    }

    let displayedCategories = new Set();

    const filteredProducts = () => {
        return products.filter(product => {
            const nameMatch = product?.name.toLowerCase().includes(search?.toLowerCase());
            const referenceMatch = product?.reference.toLowerCase().includes(search?.toLowerCase());
            const categoryMatch = category === 'all' || category === '' || product?.category === category;
            return (search === '' && categoryMatch) || (nameMatch || referenceMatch) && categoryMatch;
        });
    };

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentProducts = filteredProducts().slice(startIndex, endIndex);

    const totalPages = Math.max(1, Math.ceil(filteredProducts().length / pageSize));

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

    const deleteItem = (reference) => {
        setOrderItems(orderItems?.filter(item => item.reference !== reference));
    }

    const addItem = (name, reference, price, quantity) => {
        setOrderItems(prevState => [...prevState, {name, reference, prixVente:price, qty:quantity}]);
};

    const printInvoice = () => {
        const printContents = this.printTemplateRef.current.innerHTML;
        const originalContents = document.body.innerHTML;
        document.body.innerHTML = printContents;
        window.print();
        window.location.reload();
        document.body.innerHTML = originalContents;
    };

    return (
        <section className="px-5 bg-auto bg-no-repeat bg-center">
            <div className="bg-white/30 bg-center bg-no-repeat ">
                <h1 className="text-3xl text-center uppercase font-bold p-y2">Liste des produits</h1>
                <OrderTable showSummary={showSummary} setShowSummary={setShowSummary}
                            note={note} setNote={setNote} deleteItem={deleteItem} orderItems={orderItems} orderId={orderId} isModify={isModify}/>
                <div
                    className="my-2 backdrop-blur-md">
                    <div className="flex py-2 border-b">
                        <div className="flex flex-col w-screen">
                            <div className="flex justify-between py-4">
                                <div className="flex gap-5">
                                    <div className="size-10 cursor-pointer"
                                         >
                                        <img src={exportExcel} alt="exporter excel"/>
                                    </div>

                                    <div className="size-10 cursor-pointer" onClick={printInvoice}>
                                        <img src={print} alt="Imprimer"/>
                                    </div>
                                </div>
                                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                                    <option
                                        value="all"
                                        className={`p-1 w-60 uppercase text-md font-semibold ${category === 'all' ? 'text-[#ff0c3b] border-b-2 border-[#ff0c3b]' : 'border-b-2 border-black'}`}
                                    >
                                        Tous les Produits
                                    </option>
                                    {
                                        products.map((item, index) => {
                                            if (displayedCategories.has(item.category)) {
                                                return null
                                            }
                                            switch (true) {
                                                case item.category.toLowerCase().includes("clavier"):
                                                    item.category = "clavier"
                                                    break;
                                                case item.category.toLowerCase().includes("souris"):
                                                    item.category = "souris"
                                                    break;
                                                case item.category.toLowerCase().includes("carte mere"):
                                                    item.category = "carte mere"
                                                    break;
                                                case item.category.toLowerCase().includes("processeur"):
                                                    item.category = "processeur"
                                                    break;
                                                case item.category.toLowerCase().includes("ssd"):
                                                    item.category = "ssd"
                                                    break;
                                                case item.category.toLowerCase().includes("ram"):
                                                    item.category = "ram"
                                                    break;
                                                case item.category.toLowerCase().includes("ecran"):
                                                    item.category = "ecran"
                                                    break;
                                                case item.category.toLowerCase().includes("tower") || item.category.toLowerCase().includes("botier"):
                                                    item.category = "boitier"
                                                    break;
                                                default:
                                                    break;
                                            }
                                            displayedCategories.add(item.category);
                                            return (
                                                <option
                                                    key={index}
                                                    value={item.category}
                                                    className={`p-1 w-60 uppercase text-md font-semibold ${item.category === category ? 'text-[#ff0c3b] border-b-2 border-[#ff0c3b]' : 'border-b-2 border-black'}`}
                                                >
                                                    {item.category}
                                                </option>
                                            )
                                        })}
                                </select>

                                <div className="border rounded overflow-hidden flex">
                                    <input
                                        type="text"
                                        className="px-4 py-2"
                                        placeholder="Rechercher un produit"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                            </div>
                            <table
                                className="border-gray-200 text-black bg-center"
                                style={{backgroundImage: `url(${bgProducts})`}}>
                                <thead className="border-b-2 bg-gray-100">
                                <tr>
                                    <td className=" px-1 py-3 font-bold uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-sm border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70">
                                        Designation
                                    </td>
                                    <td className="px-1 py-3 font-bold uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-sm border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70">
                                        Référence
                                    </td>
                                    <td className="px-1 py-3 font-bold uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-sm border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70">
                                        Prix Vente TTC
                                    </td>
                                    <td className="px-1 py-3 font-bold uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-sm border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70">
                                        Quantité
                                    </td>
                                    <td className="px-1 py-3 text-center font-bold uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-sm border-b-solid tracking-none whitespace-nowrap text-gray-800 opacity-70">
                                        Commander
                                    </td>
                                </tr>
                                </thead>
                                <tbody className="text-md">
                                {currentProducts?.map((product, index) => (
                                    <tr key={index}
                                        className="hover:shadow-lg border-b transition duration-200">
                                        <td className="pl-2">{product.name}</td>
                                        <td className="pl-2">{product.reference}</td>
                                        <td className="py-4 pl-2">{product.unitprice.toFixed(0)} Dzd</td>
                                        <td className={`px-2 text-center ${product.quantity === 0 && 'bg-red-500'}`}>{product.quantity}</td>
                                        <td className="flex justify-center items-center gap-2 mt-3">
                                            <button type="button"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        if (product.quantity === 0) {
                                                            alert('Veuillez sélectionner une quantité supérieure à la quantité minimal');
                                                        } else {
                                                            addItem(product.name, product.reference, (product.unitprice).toFixed(2), product.quantity);
                                                        }
                                                    }}
                                                    disabled={product.quantity === 0}
                                                    className="px-5 py-1 rounded-md cursor-pointer text-[#ff0c3b] hover:text-white hover:bg-gradient-to-t to-[#ff0c3b] from-[#93291E] focus:outline-none border border-solid text-sm text-center font-semibold uppercase tracking-widest overflow-hidden"
                                            >
                                                Ajouter le produit
                                            </button>
                                        </td>
                                    </tr>))}
                                </tbody>
                            </table>
                            <div className="flex justify-between py-4">
                                <button disabled={currentPage === 1} onClick={prevPage}>
                                    <img src={previous} alt="previous" className="size-10"/>
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
                                    <img src={next} alt="next" className="size-10"/>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div
                            style={{backgroundColor: 'rgba(0, 0, 0, 0.8)'}}
                            className={`fixed z-40 top-0 overflow-y-scroll right-0 left-0 bottom-0 h-full w-full py-8 ${openPreview ? 'block' : 'hidden'}`}
                        >
                            <div
                                className="shadow absolute -right-0 top-0 w-10 h-10 rounded-full bg-white text-gray-500 hover:text-gray-800 inline-flex items-center justify-center cursor-pointer"
                                onClick={() => setOpenPreview(!openPreview)}
                            >
                                <svg className="fill-current w-6 h-6"
                                     xmlns="http://www.w3.org/2000/svg"
                                     viewBox="0 0 24 24">
                                    <path
                                        d="M16.192 6.344L11.949 10.586 7.707 6.344 6.293 7.758 10.535 12 6.293 16.242 7.707 17.656 11.949 13.414 16.192 17.656 17.606 16.242 13.364 12 17.606 7.758z"/>
                                </svg>
                            </div>
                        </div>

                        {/* Print Template */}
                        <div id="print-template" className="hidden">
                            <div
                                className="p-4 w-full relative left-0 right-0 overflow-hidden bg-white h-full"
                                onClick={() => setOpenPreview(!openPreview)}>
                                <div className="py-4 border-b-2 border-gray-100">
                                    <img src={logoHeader} alt="logo"
                                         style={{width: '793.7px'}}/>
                                </div>
                                <div className="py-1 border-b border-stone-500">
                                    <h2 className="text-3xl font-bold text-center pb-2 tracking-wider uppercase">Catalogue
                                        des produits</h2>
                                </div>
                                <div className="container grid grid-cols-2 space-x-2 px-2"
                                     style={{cursor: 'auto'}}>
                                    {products?.map((item) => (
                                        <div key={item.id}
                                             className="w-full flex flex-col px-1 border-red-600">
                                            <div className="flex items-center space-x-1">
                                                <img alt="Product"
                                                     className="object-cover object-center rounded"
                                                     src={item.image1}
                                                     style={{
                                                         cursor: 'auto',
                                                         width: '150px',
                                                         height: '150px'
                                                     }}/>
                                                <img alt="Product"
                                                     className="object-cover object-center rounded"
                                                     src={item.image2}
                                                     style={{
                                                         cursor: 'auto',
                                                         width: '150px',
                                                         height: '150px'
                                                     }}/>
                                            </div>
                                            <h2 className="bgGradient w-fit top-4 p-2 text-sm title-font text-white tracking-widest"
                                                style={{cursor: 'auto'}}>Disponible en
                                                configuration</h2>
                                            <div className="w-full mt-6 lg:mt-0"
                                                 style={{cursor: 'auto'}}>
                                                <h1 className="text-gray-900 text-md title-font font-medium mb-1"
                                                    style={{cursor: 'auto'}}>{item.name}</h1>
                                                <p className="leading-relaxed">{item.description}</p>
                                                <div
                                                    className="flex mt-6 items-center pb-5 border-b-2 border-gray-100 mb-5">
                                                    <div className="flex">
                                              <span
                                                  className="title-font font-medium text-2xl TextGradient">{item.prix} DZD</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

