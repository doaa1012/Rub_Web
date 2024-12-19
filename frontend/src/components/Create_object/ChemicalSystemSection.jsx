import React from "react";
import { PeriodicTable } from "../PeriodicTableElements/PeriodicTable";
import Modal from "./Modal";

const ChemicalSystemSection = ({
  chemicalSystem,
  selectedElements,
  isModalOpen,
  setChemicalSystem,
  setIsModalOpen,
  setSelectedElements,
  setElementData,
  showPercentage, // Determines whether to show the Absolute and Percentage columns
  isSpecialType, // Determines if the type requires additional user/email input
  users = [], // List of users for dropdown
  elementData = {},
  selectedUser,
  handleUserChange,
}) => {
  const handleConfirmElements = () => {
    setChemicalSystem(selectedElements.join("-")); // Update the chemical system
    setIsModalOpen(false); // Close the modal
  };

  const handleDeleteElement = (element) => {
    setSelectedElements((prev) => {
      const updatedElements = prev.filter((el) => el !== element);
      setChemicalSystem(updatedElements.join("-")); // Update the chemical system
      return updatedElements;
    });
    setElementData((prevData) => {
      const updatedData = { ...prevData };
      delete updatedData[element];
      return updatedData;
    });
  };

  return (
    <div>
      <label className="block text-lg font-semibold text-blue-800">
        Chemical System<span className="text-red-500">*</span>
      </label>
      <input
        type="text"
        placeholder="Chemical system: for example Co-Ni-Cu"
        value={chemicalSystem}
        className="w-full p-3 border border-blue-300 rounded-lg bg-blue-50 focus:outline-none"
        readOnly
        required
      />
      <button
        type="button"
        className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
        onClick={() => setIsModalOpen(true)}
      >
        Add Elements
      </button>

      {selectedElements.length > 0 && (
        <div className="mt-4">
          <h3 className="block text-lg font-semibold text-blue-800 mb-4">
            Selected Elements
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {selectedElements.map((element) => (
              <div
                key={element}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-200 to-blue-100 rounded-lg shadow hover:shadow-md transition"
              >
                <div>
                  <h4 className="text-xl font-bold text-blue-800">{element}</h4>
                  {showPercentage && (
                    <div className="mt-2">
                      <label className="block text-sm text-blue-600">
                        Absolute Content
                      </label>
                      <input
                        type="number"
                        className="w-full p-2 mt-1 border border-blue-300 rounded focus:outline-none focus:ring focus:ring-blue-400"
                        placeholder="Enter percentage"
                        value={elementData[element]?.percentage || ""}
                        onChange={(e) =>
                          setElementData((prevData) => ({
                            ...prevData,
                            [element]: {
                              ...prevData[element],
                              percentage: e.target.value
                                ? parseFloat(e.target.value)
                                : null,
                            },
                          }))
                        }
                      />
                      <label className="block mt-2 text-sm text-blue-600">
                        Percentage
                      </label>
                      <input
                        type="number"
                        className="w-full p-2 mt-1 border border-blue-300 rounded focus:outline-none focus:ring focus:ring-blue-400"
                        placeholder="Enter percentage"
                        onChange={(e) =>
                          setElementData((prevData) => ({
                            ...prevData,
                            [element]: {
                              ...prevData[element],
                              percentage: e.target.value
                                ? parseFloat(e.target.value)
                                : null,
                            },
                          }))
                        }
                      />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteElement(element)}
                  className="text-red-500 hover:text-red-700 font-semibold ml-4"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {isSpecialType && (
        <div className="mt-6">
          <h3 className="block text-lg font-semibold text-blue-800 mb-4">
            Notify User for Synthesis
          </h3>
          <label className="block text-sm text-blue-600">
            Select User to Notify
          </label>
          <select
            value={selectedUser}
            onChange={handleUserChange}
            className="w-full p-3 mt-2 bg-blue-50 border border-blue-300 rounded focus:outline-none focus:ring focus:ring-blue-400"
          >
            <option value="">-- Select User --</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.username}
              </option>
            ))}
          </select>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h3 className="text-xl font-semibold mb-4">Select Elements</h3>
        <PeriodicTable
          onElementSelect={setSelectedElements}
          selectedElements={selectedElements}
        />
        <button
          type="button"
          className="mt-4 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
          onClick={handleConfirmElements}
        >
          Confirm Selection
        </button>
      </Modal>
    </div>
  );
};

export default ChemicalSystemSection;
