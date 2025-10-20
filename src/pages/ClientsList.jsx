import {useState} from 'react';
import {useClientContext} from "../context/ClientContext.js";
import {useUsersContext} from "../context/UsersContext.js";
import {useForm} from 'react-hook-form';
import exportExcel from "../assets/button/excel.png";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

export default function ClientsList() {
    const [isOpen, setIsOpen] = useState(false);
    const [operation, setOperation] = useState('add');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [search, setSearch] = useState('');
    const [saler, setSaler] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(14);
    const [selectedClient, setSelectedClient] = useState(null);

    const {clients, addUser, modifyUser} = useClientContext();
    const {users} = useUsersContext();

    const {register, handleSubmit, setValue} = useForm();

    // Safe array access with fallback
    const clientsArray = Array.isArray(clients) ? clients : [];
    
    const sales = [...new Set(clientsArray.map(client => client.user))];

    const filteredClients = () => {
        return clientsArray.filter(client => {
            return client.name?.toLowerCase().includes(search.toLowerCase()) && 
                   (saler === '' || client.user === saler);
        });
    }

    const totalPages = Math.max(1, Math.ceil(clientsArray.length / pageSize));

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

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentClients = filteredClients().slice(startIndex, endIndex);

    const onSubmit = (data) => {
        const user = users?.find(user => user.username === data.username);
        
        // Prepare the data with all required fields
        const formData = {
            ...data,
           
            client_name: selectedClient?.name || '',
            commercial: selectedClient?.user || ''
        };

        operation === 'add' ? addUser(formData) : modifyUser(formData, user?.id);
        setIsOpen(false);
        setUsername('');
        setPassword('');
        setConfirmPassword('');
        setSelectedClient(null);
    }

    const hasUserAccount = (clientName) => {
        return users?.find(user => 
            user.username?.toLowerCase() === clientName?.toLowerCase().replace(/\s/g, '_')
        );
    }

    const handleOpenModal = (client) => {
        setSelectedClient(client);
        setUsername(client.name);
        setOperation(hasUserAccount(client.name) ? 'update' : 'add');
        setIsOpen(true);
        
        // Set form values for the additional fields
      
        setValue('client_name', client.name || '');
        setValue('commercial', client.user || '');
    }

    // Add loading state
    if (!clients) {
        return <LoadingSpinner />;
    }

    return (
        <section className="w-full bg-white/50 bg-auto bg-no-repeat bg-center">
            <div>
                <h3 className="text-3xl text-center py-2 uppercase font-bold text-primary">Liste des clients</h3>
            </div>
            <div className="py-2 mt-4 flex justify-center items-center gap-4 border-b border-t px-2">
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
                    <select
                        className="border-red-700 border rounded-md p-2"
                        onChange={(e) => setSaler(e.target.value)}
                    >
                        <option value="">Tous les clients</option>
                        {sales.map((sale, index) => (
                            <option key={index} value={sale}>{sale}</option>
                        ))}
                    </select>
                </div>
                <div className="size-10 cursor-pointer">
                    <img src={exportExcel} alt="exporter excel"/>
                </div>
            </div>
            <div className="rounded-lg px-2 py-4 h-screen mb-12 bg-white/30 bg-center bg-no-repeat">
                <table className="items-center w-full mb-0 align-top border-gray-200 text-black backdrop-blur-sm bg-white/30">
                    <thead className="border-b bg-gray-100 text-gray-800 font-semibold">
                    <tr>
                        <td className="py-2 pl-2">ID</td>
                        <td className="py-2 pl-2">Nom client</td>
                        <td className="py-2 pl-2">Adresse</td>
                        <td className="py-2 pl-2">Téléphone</td>
                        <td className="py-2 pl-2">Commercial</td>
                        <td className="py-2 pl-2">Chiffre d&#39;affaire</td>
                        <td className="py-2 pl-2">Solde</td>
                        <td className="py-2 pl-2">Compte utilisateur</td>
                    </tr>
                    </thead>
                    <tbody className="text-sm">
                    {currentClients.length > 0 ? (
                        currentClients.map((client, index) => {
                            const hasAccount = hasUserAccount(client.name);
                            return (
                                <tr key={index} className="hover:shadow-lg border transition duration-200">
                                    <td className="py-3 pl-2">{startIndex + index + 1}</td>
                                    <td className="py-3 pl-2 capitalize">{client.name}</td>
                                    <td className="py-3 pl-2 capitalize">{client.adresse}</td>
                                    <td className="py-3 pl-2 capitalize">{client.phone}</td>
                                    <td className="py-3 pl-2 capitalize">{client.user}</td>
                                    <td className="py-3 pl-2 capitalize">{client.ca} dzd</td>
                                    <td className={`py-3 pl-2 capitalize ${client.solde > 0 && 'bg-red-400'}`}>{client.solde} dzd</td>
                                    <td className="py-3 pl-2 flex items-center justify-center">
                                        <button 
                                            type="button" 
                                            className="cursor-pointer p-1 rounded-full hover:bg-gray-100 transition-colors"
                                            onClick={() => handleOpenModal(client)}
                                            title={hasAccount ? "Modifier le compte utilisateur" : "Créer un compte utilisateur"}
                                        >
                                            {hasAccount ? (
                                                // Check icon for existing account
                                                <svg xmlns="http://www.w3.org/2000/svg" 
                                                     className="h-5 w-5 text-green-600" 
                                                     viewBox="0 0 20 20" 
                                                     fill="currentColor">
                                                    <path fillRule="evenodd" 
                                                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                                                          clipRule="evenodd" />
                                                </svg>
                                            ) : (
                                                // Plus icon for no account
                                                <svg xmlns="http://www.w3.org/2000/svg" 
                                                     x="0px" y="0px" 
                                                     viewBox="0,0,256,256" 
                                                     className="h-5 w-5 text-blue-600">
                                                    <g fill="none" fillRule="nonzero" strokeWidth="1"
                                                       strokeLinecap="butt" strokeLinejoin="miter" strokeMiterlimit="10"
                                                       strokeDashoffset="0">
                                                        <g transform="scale(5.33333,5.33333)">
                                                            <path
                                                                d="M44,24c0,11.045 -8.955,20 -20,20c-11.045,0 -20,-8.955 -20,-20c0,-11.045 8.955,-20 20,-20c11.045,0 20,8.955 20,20z"
                                                                fill="#3b82f6"></path>
                                                            <path d="M22,15h4v18h-4z" fill="#ffffff"></path>
                                                            <path d="M15,22h18v4h-18z" fill="#ffffff"></path>
                                                        </g>
                                                    </g>
                                                </svg>
                                            )}
                                        </button>
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan="8" className="py-4 text-center">
                                Aucun client trouvé
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
                <div className="flex justify-between items-center mt-4">
                    <button onClick={prevPage} disabled={currentPage === 1}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50">Previous
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
                    <button onClick={nextPage} disabled={currentPage === totalPages}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50">Next
                    </button>
                </div>
            </div>
               {isOpen && (<div
                className="fixed z-40 top-0 right-0 left-0 bottom-0 h-full w-full p-4 max-w-xl mx-auto overflow-hidden mt-0 md:mt-12">
                <div
                    className="shadow absolute right-0 top-0 w-10 h-10 rounded-full z-20 backdrop-blur-md bg-white/30 text-gray-500 hover:text-gray-800 inline-flex items-center justify-center cursor-pointer"
                    onClick={() => {
                        setIsOpen(false);
                        setUsername('');
                        setPassword('');
                        setConfirmPassword('');
                        setSelectedClient(null);
                    }}>
                    <svg className="fill-current w-6 h-6" xmlns="http://www.w3.org/2000/svg"
                         viewBox="0 0 24 24">
                        <path
                            d="M16.192 6.344L11.949 10.586 7.707 6.344 6.293 7.758 10.535 12 6.293 16.242 7.707 17.656 11.949 13.414 16.192 17.656 17.606 16.242 13.364 12 17.606 7.758z"/>
                    </svg>
                </div>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div
                        className="shadow w-full rounded-lg backdrop-blur-md bg-white/80 overflow-hidden block p-8">
                        <h2 className="text-2xl mb-6 text-gray-800 uppercase border-b pb-2">{operation === 'add' ? "Ajouter un utilisateur client" : "Modifier un utilisateur client"}</h2>
                        
                        {/* Hidden fields for additional data */}

                        <input type="hidden" {...register('client_name')} />
                        <input type="hidden" {...register('commercial')} />
                        
                        <div>
                            <div className="mb-4">
                                <label className="block text-gray-800 font-semibold mb-2"
                                       htmlFor="username">Nom d&#39;utilisateur:</label>
                                <input
                                    className="appearance-none w-full py-2 px-1 border text-gray-800 leading-tight focus:outline-none"
                                    type="text"
                                    placeholder="Nom d'utilisateur"
                                    {...register('username', {value: username.replace(/\s/g, '_')})}
                                    value={username.replace(/\s/g, '_')}
                                    disabled
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-800 font-semibold mb-2"
                                       htmlFor="password">Mot de passe:</label>
                                <input
                                    className="appearance-none w-full py-2 px-1 border text-gray-800 leading-tight focus:outline-none"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Mot de passe"
                                    {...register('password', {required: operation === 'add' ? 'Veuillez indiquer le mot de passe' : false})}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-10 top-56 bg-transparent flex items-center justify-center text-gray-700">
                                    {showPassword ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                             xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                             xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                                        </svg>
                                    )}
                                </button>
                                {operation === 'update' &&
                                    <p className="text-red-500">Veuillez le nouveau mot de passe qu&#39;en cas de
                                        changement.</p>}
                            </div>
                            <div className='mb-4'>
                                <label className="block text-gray-800 font-semibold mb-2"
                                       htmlFor="confirmPassword">Confirmez le mot de passe:</label>
                                <input
                                    className="appearance-none w-full py-2 px-1 border text-gray-800 leading-tight focus:outline-none"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder="Confirmez le mot de passe"
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-10 bottom-28 bg-transparent flex items-center justify-center text-gray-700">
                                    {showConfirmPassword ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                             xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                             xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                                        </svg>
                                    )}
                                </button>
                                {password !== confirmPassword &&
                                    <span className="text-red-500">Les mots de passe ne correspondent pas</span>}
                            </div>

                        </div>
                        <div className="mt-8 text-right">
                            <button type="button"
                                    className="bg-white hover:bg-gray-100 text-[#EF0839] font-semibold py-2 px-4 border border-gray-300 rounded shadow-sm mr-2"
                                    onClick={() => {
                                        setIsOpen(false);
                                        setUsername('');
                                        setPassword('');
                                        setConfirmPassword('');
                                        setSelectedClient(null);
                                    }}>Annuler
                            </button>
                            <button type="submit"
                                    disabled={password !== confirmPassword}
                                    className="bg-[#EF0839] hover:bg-[#EF0839] text-white font-semibold py-2 px-4 border border-[#EF0839] rounded shadow-sm"
                            >
                                {operation === 'add' ? 'Enregistrer' : 'Modifier'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>)}
   
        </section>
    );
}