import {useState} from 'react';
import { useForm } from 'react-hook-form';
import {useLoginContext} from "../context/LoginContext.js";
import  loginImage from '../../public/assets/images/02.png'

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
        <section className="absolute top-0 h-screen w-screen flex items-center bg-bg_login bg-center">
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