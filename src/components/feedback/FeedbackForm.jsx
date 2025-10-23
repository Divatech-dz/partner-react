import React from 'react';
import { useForm } from 'react-hook-form';
import PropTypes from 'prop-types';

export default function FeedbackForm({ 
  isOpen, 
  setIsOpen, 
  operation, 
  feedbackId, 
  addFeedback, 
  modifyFeedback 
}) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const handleFormSubmit = (data) => {
    if (operation === 'add') {
      addFeedback(data);
    } else if (operation === 'update') {
      modifyFeedback(data, feedbackId);
    }
    reset();
    setIsOpen(false);
  };

  const handleClose = () => {
    reset();
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {operation === 'add' ? 'Ajouter une réclamation' : 'Modifier la réclamation'}
        </h2>
        
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sujet
            </label>
            <input
              type="text"
              {...register('objet', { 
                required: 'Le sujet est requis',
                minLength: {
                  value: 3,
                  message: 'Le sujet doit contenir au moins 3 caractères'
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Entrez le sujet de votre réclamation"
            />
            {errors.objet && (
              <p className="text-red-500 text-sm mt-1">{errors.objet.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              rows={4}
              {...register('message', { 
                required: 'Le message est requis',
                minLength: {
                  value: 10,
                  message: 'Le message doit contenir au moins 10 caractères'
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Décrivez votre réclamation en détail..."
            />
            {errors.message && (
              <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition duration-200"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition duration-200"
            >
              {operation === 'add' ? 'Ajouter' : 'Modifier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

FeedbackForm.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  setIsOpen: PropTypes.func.isRequired,
  operation: PropTypes.string.isRequired, // Changed from function to string
  feedbackId: PropTypes.number,
  addFeedback: PropTypes.func.isRequired,
  modifyFeedback: PropTypes.func.isRequired
};