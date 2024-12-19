import React from 'react';

const AddPropertyModal = ({ onClose, onSelectOption }) => {
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-4">
          Add Property
        </h2>
        <p className="text-gray-600 text-center mb-6">
          Choose how you want to add properties.
        </p>
        <div className="flex flex-col space-y-4">
          <button
            onClick={() => onSelectOption('manual')}
            className="bg-blue-500 text-white py-2 px-4 rounded-lg shadow hover:bg-blue-600 transition-transform transform hover:scale-105"
          >
            Add Manually
          </button>
          <button
            onClick={() => onSelectOption('file')}
            className="bg-green-500 text-white py-2 px-4 rounded-lg shadow hover:bg-green-600 transition-transform transform hover:scale-105"
          >
            Upload File
          </button>
        </div>
        <button
          onClick={onClose}
          className="mt-6 bg-red-500 text-white py-2 px-4 rounded-lg shadow hover:bg-red-600 transition-transform transform hover:scale-105 w-full"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AddPropertyModal;
