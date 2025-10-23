import {useState} from 'react';
import { useForm } from 'react-hook-form';
import {useLoginContext} from "../context/LoginContext.js";
import { FiEyeOff ,FiEye } from "react-icons/fi";
import loginImage from '../assets/images/02.png'
import bgImage from '../assets/images/BG123.png';

export default function LoginPage (){
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const {register, handleSubmit} = useForm();
    const {onLogin } = useLoginContext()

    const onSubmit = async (data) => {
        const response = await onLogin(data)
        if (!response) {
            setError(response)
        }
    }

    return (
       <section
  className="absolute top-0 h-screen w-screen flex items-center bg-center bg-no-repeat bg-cover"
  style={{ backgroundImage: `url(${bgImage})` }}
>
                <div className="w-1/3 mx-auto px-4 py-8">
                    <h2 className="text-center text-xl sm:text-4xl font-bold tracking-wide text-gray-800 uppercase">Authentification</h2>
                    {error && <p className="text-center py-4 font-bold text-red-500 mt-2">{error}</p>}
                    <form className="my-8 text-sm" onSubmit={handleSubmit(onSubmit)}>
                        <div className="flex flex-col my-4">
                            <label htmlFor="email" className="text-gray-700">Nom d&#39;utilisateur</label>
                            <input
                                type="text"
                                name="username"
                                id="username"
                                className="mt-2 py-2 pl-1 border-gray-800 border-b focus:outline-none focus:ring-0 focus:border-gray-800 text-sm text-gray-900"
                                placeholder="Enter your email"
                                {...register('username', {required: 'Veuillez entrer votre nom d&#39;utilisateur'})}
                            />
                        </div>
                        <div className="flex flex-col my-4">
                            <label htmlFor="password" className="text-gray-700">Mot de passe</label>
                            <div className="relative flex items-center mt-2">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    id="password"
                                    className="flex-1 py-2 pl-1 pr-10 border-b border-gray-800 focus:outline-none focus:ring-0 focus:border-gray-800 text-sm text-gray-900"
                                    placeholder="Enter your password"
                                    {...register('password', {required: 'Password is required'})}
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-2 bg-transparent flex items-center justify-center text-gray-700">
                                    {showPassword ? (
                                        <FiEyeOff   className="w-5 h-5" />
                                    ) : (
                                        <FiEye  className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>
                            <button type="submit"
                                    className="bg-[#EF0839] rounded-lg px-8 py-2 text-gray-100 hover:shadow-xl transition duration-150 uppercase">Authentifier
                            </button>
                    </form>
                    <hr className="my-4 "/>
                </div>
                <div className="mx-auto">
                    <img src={loginImage} alt="login" className="w-[605px] h-[550px]"/>
                </div>

        </section>
    );
};