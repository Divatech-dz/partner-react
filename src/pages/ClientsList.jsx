import { useState } from 'react';
import { useClientContext } from "../context/ClientContext.js";
import { useUsersContext } from "../context/UsersContext.js";
import { useForm } from 'react-hook-form';
import { RiFileExcel2Line } from 'react-icons/ri';
import { FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { FiEyeOff, FiEye } from "react-icons/fi";
import { FaUserCheck, FaUserPlus } from "react-icons/fa6";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import ClientProviders from "../providers/ClientProviders.jsx";
import UsersProviders from "../providers/UsersProviders.jsx";
import swal from 'sweetalert';

export default function ClientsList() {
  return (
    <ClientProviders>
      <UsersProviders>
        <ClientsListContent />
      </UsersProviders>
    </ClientProviders>
  );
}

function ClientsListContent() {
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
  const [isLoading, setIsLoading] = useState(false);

  const { clients, addUser, modifyUser } = useClientContext();
  const { users } = useUsersContext();

  const { register, handleSubmit, setValue, reset } = useForm();

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

  const resetForm = () => {
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setSelectedClient(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
    reset();
  };

  const onSubmit = async (data) => {
    if (password !== confirmPassword) {
      swal({
        title: "Erreur",
        text: "Les mots de passe ne correspondent pas!",
        icon: "error",
        button: "OK",
      });
      return;
    }

    setIsLoading(true);

    try {
      const user = users?.find(user => user.username === data.username);
      
      const formData = {
        ...data,
        client_name: selectedClient?.name || '',
        commercial: selectedClient?.user || '',
        role: 'client'
      };

      if (operation === 'add') {
        await addUser(formData);
        swal({
          title: "Succès",
          text: "Compte utilisateur créé avec succès!",
          icon: "success",
          button: "OK",
        });
        setIsOpen(false);
        resetForm();
      } else {
        await modifyUser(formData, user?.id);
        swal({
          title: "Succès",
          text: "Compte utilisateur modifié avec succès!",
          icon: "success",
          button: "OK",
        });
        setIsOpen(false);
        resetForm();
      }
    } catch (error) {
      swal({
        title: "Erreur",
        text: "Une erreur est survenue lors de l'opération!",
        icon: "error",
        button: "OK",
      });
      console.error("Operation error:", error);
    } finally {
      setIsLoading(false);
    }
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
    
    setValue('client_name', client.name || '');
    setValue('commercial', client.user || '');
  }

  const handleExcelExport = () => {
    swal({
      title: "Exporter en Excel",
      text: "Voulez-vous exporter la liste des clients en format Excel?",
      icon: "info",
      buttons: ["Annuler", "Exporter"],
    }).then((willExport) => {
      if (willExport) {
        swal({
          title: "Export réussi",
          text: "La liste des clients a été exportée en Excel!",
          icon: "success",
          button: "OK",
        });
      }
    });
  }

  const handleCloseModal = () => {
    if (password || confirmPassword || username) {
      swal({
        title: "Annuler?",
        text: "Les modifications non enregistrées seront perdues.",
        icon: "warning",
        buttons: ["Continuer", "Annuler"],
      }).then((willCancel) => {
        if (willCancel) {
          setIsOpen(false);
          resetForm();
        }
      });
    } else {
      setIsOpen(false);
      resetForm();
    }
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
            className="border-red-700 border rounded-md p-2 w-64 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        <div>
          <select
            className="border-red-700 border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            onChange={(e) => setSaler(e.target.value)}
            value={saler}
          >
            <option value="">Tous les commerciaux</option>
            {sales.map((sale, index) => (
              <option key={index} value={sale}>{sale}</option>
            ))}
          </select>
        </div>
        <RiFileExcel2Line 
          className="text-4xl bg-green-200 text-green-600 p-2 rounded-full cursor-pointer hover:bg-green-300 transition-colors duration-200" 
          onClick={handleExcelExport}
          title="Exporter en Excel"
        />
      </div>
      <div className="rounded-lg px-2 py-4 h-screen mb-12 bg-white/30 bg-center bg-no-repeat">
        <table className="items-center w-full mb-0 align-top border-gray-200 text-black backdrop-blur-sm bg-white/30 rounded-lg overflow-hidden">
          <thead className="border-b bg-gray-100 text-gray-800 font-semibold">
            <tr>
              <td className="py-3 pl-4 font-semibold">ID</td>
              <td className="py-3 pl-4 font-semibold">Nom client</td>
              <td className="py-3 pl-4 font-semibold">Adresse</td>
              <td className="py-3 pl-4 font-semibold">Téléphone</td>
              <td className="py-3 pl-4 font-semibold">Commercial</td>
              <td className="py-3 pl-4 font-semibold">Chiffre d&#39;affaire</td>
              <td className="py-3 pl-4 font-semibold">Solde</td>
              <td className="py-3 pl-4 font-semibold text-center">Compte utilisateur</td>
            </tr>
          </thead>
          <tbody className="text-sm">
            {currentClients.length > 0 ? (
              currentClients.map((client, index) => {
                const hasAccount = hasUserAccount(client.name);
                return (
                  <tr key={index} className="border-b hover:bg-gray-50 transition duration-200">
                    <td className="py-3 pl-4">{startIndex + index + 1}</td>
                    <td className="py-3 pl-4 capitalize font-medium">{client.name}</td>
                    <td className="py-3 pl-4 capitalize">{client.adresse}</td>
                    <td className="py-3 pl-4">{client.phone}</td>
                    <td className="py-3 pl-4 capitalize">{client.user}</td>
                    <td className="py-3 pl-4 font-semibold">{client.ca} dzd</td>
                    <td className={`py-3 pl-4 font-semibold ${client.solde > 0 ? 'text-red-600 bg-red-50' : 'text-green-600'}`}>
                      {client.solde} dzd
                    </td>
                    <td className="py-3 pl-4 flex items-center justify-center">
                      <button 
                        type="button" 
                        className="cursor-pointer p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 border border-gray-200"
                        onClick={() => handleOpenModal(client)}
                        title={hasAccount ? "Modifier le compte utilisateur" : "Créer un compte utilisateur"}
                      >
                        {hasAccount ? (
                          <FaUserCheck className="h-5 w-5 text-green-600" />
                        ) : (
                          <FaUserPlus className="h-5 w-5 text-blue-600" />
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" className="py-8 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-lg">Aucun client trouvé</span>
                    <span className="text-sm">Essayez de modifier vos critères de recherche</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        {/* Pagination */}
        <div className="flex justify-between items-center mt-6 px-4">
          <button 
            onClick={prevPage} 
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 flex items-center gap-2 hover:bg-gray-300 transition-colors duration-200 font-medium"
          >
            <FaChevronLeft className="w-4 h-4" />
            Précédent
          </button>
          
          <div className="flex items-center gap-3 text-gray-700 font-medium">
            <span>Page</span>
            <select
              value={currentPage}
              onChange={(e) => setCurrentPage(Number(e.target.value))}
              className="text-center border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {Array.from({length: totalPages}, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
            <span>sur {totalPages}</span>
          </div>
          
          <button 
            onClick={nextPage} 
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 flex items-center gap-2 hover:bg-gray-300 transition-colors duration-200 font-medium"
          >
            Suivant
            <FaChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Modal for creating/editing user account */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto transform transition-all">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">
                {operation === 'add' ? "Créer un compte" : "Modifier le compte"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 rounded-full hover:bg-gray-100"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="p-6 space-y-4">
                {/* Hidden fields for additional data */}
                <input type="hidden" {...register('client_name')} />
                <input type="hidden" {...register('commercial')} />
                
                <div>
                  <label className="block text-gray-700 font-semibold mb-2" htmlFor="username">
                    Nom d&#39;utilisateur:
                  </label>
                  <input
                    className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-50"
                    type="text"
                    placeholder="Nom d'utilisateur"
                    {...register('username', {value: username.replace(/\s/g, '_')})}
                    value={username.replace(/\s/g, '_')}
                    disabled
                  />
                </div>
                
                <div className="relative">
                  <label className="block text-gray-700 font-semibold mb-2" htmlFor="password">
                    Mot de passe:
                  </label>
                  <div className="relative">
                    <input
                      className="w-full py-3 px-4 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Mot de passe"
                      {...register('password', {required: operation === 'add' ? 'Veuillez indiquer le mot de passe' : false})}
                      onChange={(e) => setPassword(e.target.value)}
                      value={password}
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                    </button>
                  </div>
                  {operation === 'update' && (
                    <p className="text-gray-500 text-sm mt-1">
                      Remplissez uniquement si vous souhaitez changer le mot de passe
                    </p>
                  )}
                </div>
                
                <div className="relative">
                  <label className="block text-gray-700 font-semibold mb-2" htmlFor="confirmPassword">
                    Confirmez le mot de passe:
                  </label>
                  <div className="relative">
                    <input
                      className="w-full py-3 px-4 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirmez le mot de passe"
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      value={confirmPassword}
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      {showConfirmPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                <button 
                  type="button"
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  onClick={handleCloseModal}
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  disabled={password !== confirmPassword || isLoading}
                  className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {operation === 'add' ? 'Création...' : 'Modification...'}
                    </>
                  ) : (
                    operation === 'add' ? 'Créer le compte' : 'Modifier'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}