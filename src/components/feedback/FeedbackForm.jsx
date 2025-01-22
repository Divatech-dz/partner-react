import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import PropTypes from "prop-types";

function FeedbackForm({ setIsOpen, operation, onSubmit }) {
    const { register, handleSubmit, formState: { errors } } = useForm();

    const handleFormSubmit = (data) => {
        if (Object.keys(errors).length > 0) {
            Object.values(errors).forEach(error => {
                toast.error(error.message);
            });
        } else {
            onSubmit(data);
        }
    };

    return (
        <div className="fixed top-60 bottom-0 left-0 right-0 z-40 w-fit mx-auto">
            <div
                className="shadow absolute right-0 top-0 w-10 h-10 rounded-full z-20 backdrop-blur-md bg-white/30 text-gray-500 hover:text-gray-800 inline-flex items-center justify-center cursor-pointer"
                onClick={() => setIsOpen(false)}>
                <svg className="fill-current w-6 h-6" xmlns="http://www.w3.org/2000/svg"
                     viewBox="0 0 24 24">
                    <path
                        d="M16.192 6.344L11.949 10.586 7.707 6.344 6.293 7.758 10.535 12 6.293 16.242 7.707 17.656 11.949 13.414 16.192 17.656 17.606 16.242 13.364 12 17.606 7.758z"/>
                </svg>
            </div>
            <form onSubmit={handleSubmit(handleFormSubmit)}>
                <div
                    className="shadow w-full rounded-lg backdrop-blur-md bg-white/80 overflow-hidden block p-8">
                    <h2 className="text-2xl mb-6 text-gray-800 uppercase border-b pb-2">{operation === "add" ? "Ajouter" : "Modifier"} un
                        FeedBack</h2>
                    <div className="form-input">
                        <div className="mb-4">
                            <label className="block text-gray-800 font-semibold mb-2"
                                   htmlFor="phone">Objet :</label>
                            <input
                                className="appearance-none w-full py-2 px-1 border text-gray-800 leading-tight focus:outline-none"
                                type="text"
                                placeholder="Objet feedBack"
                                defaultValue={operation === 'add' ? '' : "message"}
                                {...register('objet', {
                                    required: 'Veuillez saisir l&#39;objet de votre feedback',
                                    maxLength: { value: 10, message: 'Objet trop long' }
                                })}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-800 font-semibold mb-2">Message
                                :</label>
                            <textarea
                                className="appearance-none border w-full py-2 px-1 text-gray-800 leading-tight focus:outline-none"
                                placeholder="Message feedBack" rows="6" cols="50"
                                defaultValue={operation === 'add' ? '' : "message"}
                                {...register('message', {
                                    required: 'Veuillez saisir votre message',
                                    minLength: { value: 5, message: 'message trop court' },
                                    maxLength: { value: 250, message: 'Message trop long' }
                                })}
                            ></textarea>
                        </div>
                    </div>
                    <div className="mt-8 text-right">
                        <button type="button"
                                className="bg-white hover:bg-gray-100 text-[#EF0839] font-semibold py-2 px-4 border border-gray-300 rounded shadow-sm mr-2"
                                onClick={() => setIsOpen(false)}>Annuler
                        </button>
                        <button type="submit"
                                className="bg-[#EF0839] hover:bg-[#EF0839] text-white font-semibold py-2 px-4 border border-[#EF0839] rounded shadow-sm"
                        >
                            {operation === 'add' ? 'Envoyer' : 'Modifier'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

FeedbackForm.propTypes = {
    setIsOpen: PropTypes.func,
    operation: PropTypes.func,
    onSubmit: PropTypes.func
}

export default FeedbackForm;