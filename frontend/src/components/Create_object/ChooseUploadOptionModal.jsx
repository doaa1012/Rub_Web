import React from 'react';

const ChooseUploadOptionModal = ({ onClose, onSelectOption }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-96 p-6 border border-blue-300">
        {/* Modal Title */}
        <h2 className="text-2xl font-bold text-blue-600 mb-6 text-center">
          Choose Upload Option
        </h2>

        {/* Option Buttons */}
        <div className="space-y-4">
          {/* Go to List Editor */}
          <button
            className="w-full bg-blue-500 text-white py-3 rounded-lg text-lg font-semibold hover:bg-blue-600 transition"
            onClick={() => onSelectOption('ListEditor')}
          >
            Go to List Editor
          </button>

          {/* Drag and Drop Upload */}
          <button
            className="w-full bg-green-400 text-white py-3 rounded-lg text-lg font-semibold hover:bg-green-500 transition"
            onClick={() => onSelectOption('DragDropUpload')}
          >
            Drag and Drop Upload
          </button>

          {/* Add Object from Saved Objects */}
          <button
            className="w-full bg-purple-500 text-white py-3 rounded-lg text-lg font-semibold hover:bg-purple-600 transition"
            onClick={() => onSelectOption('AddFromSaved')}
          >
            Add Object from Saved Objects
          </button>
        </div>

        {/* Cancel Button */}
        <button
          className="w-full mt-6 bg-red-400 text-white py-3 rounded-lg text-lg font-semibold hover:bg-red-500 transition"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ChooseUploadOptionModal;
