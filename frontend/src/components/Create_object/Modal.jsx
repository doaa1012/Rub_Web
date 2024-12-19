import React from 'react';

const Modal = ({ isOpen, onClose, children }) => {
  // Debug to ensure `isOpen` is received correctly
  console.log('Modal isOpen:', isOpen);

  if (!isOpen) {
    return null; // Do not render the modal if it's not open
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-5xl max-h-screen overflow-auto relative">
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 text-2xl font-bold"
          onClick={onClose}
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
