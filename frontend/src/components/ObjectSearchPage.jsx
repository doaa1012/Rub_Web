import React, { useState, useEffect } from "react";
import { PeriodicTable } from "./PeriodicTableElements/PeriodicTable";
import Modal from "./Create_object/Modal";
import Select from 'react-select';
import config from "../config_path";
const ObjectSearchPage = () => {
  const [typenames, setTypenames] = useState([]);
  const [query, setQuery] = useState({
    typename: "", // String
    associatedTypes: [], // Array of strings
    chemicalSystem: "", // String
    createdFrom: "", // Date string
    createdTo: "", // Date string
});

  const [selectedElements, setSelectedElements] = useState([]);
  const [elementDetails, setElementDetails] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [results, setResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

// Custom styles for react-select to match other inputs
const customSelectStyles = {
  control: (provided) => ({
    ...provided,
    backgroundColor: 'rgb(240, 245, 255)', // Match the input background
    border: '1px solid rgb(190, 190, 250)', // Match the border
    borderRadius: '0.375rem', // Match rounded corners
    padding: '0.5rem', // Add padding for better appearance
    boxShadow: 'none',
    '&:hover': {
      borderColor: 'rgb(110, 110, 220)', // Hover effect
    },
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: 'rgb(240, 245, 255)', // Match the dropdown background
    zIndex: 999, // Ensure it's above other components
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? 'rgb(110, 110, 220)' : 'rgb(240, 245, 255)',
    color: state.isSelected ? 'white' : 'black',
    '&:hover': {
      backgroundColor: 'rgb(190, 190, 250)',
    },
  }),
};
  // Fetch available typenames from the backend
  useEffect(() => {
    fetch(`${config.BASE_URL}api/list_editor/`)
      .then((response) => response.json())
      .then((data) => {
        const sortedTypenames = data.map((item) => item.typeid.typename).sort();
        setTypenames(sortedTypenames);
      })
      .catch((error) => console.error("Error fetching typenames:", error));
  }, []);

  // Update the chemical system whenever selected elements change
  useEffect(() => {
    setQuery((prevQuery) => ({
      ...prevQuery,
      chemicalSystem: selectedElements.join("-"),
    }));
  }, [selectedElements]);

  const handleInputChange = (field, value) => {
    setQuery((prevQuery) => ({
      ...prevQuery,
      [field]: value,
    }));
  };

  const handleSearch = (page = 1) => {
    const queryPayload = {
        typename: query.typename,
        associatedTypes: query.associatedTypes,
        chemicalSystem: query.chemicalSystem,
        createdFrom: query.createdFrom,
        createdTo: query.createdTo,
        elements: Object.entries(elementDetails).map(([element, details]) => ({
            element,
            percentage: details.percentage || null,
        })),
        page, // Include the current page
        pageSize: 10, // Set the page size
    };

    fetch(`${config.BASE_URL}api/object_search/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(queryPayload), // Only plain data here
    })
        .then((response) => response.json())
        .then((data) => {
            setResults(data.results);
            setTotalPages(data.totalPages);
            setCurrentPage(data.currentPage);
        })
        .catch((error) => console.error("Error fetching search results:", error));
};


  const handleDownloadObject = (objectId) => {
    fetch(`${config.BASE_URL}api/download_dataset/${objectId}/`, {
        method: "GET",
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Failed to download dataset");
            }
            return response.blob(); // Convert response to blob
        })
        .then((blob) => {
            // Create a URL for the blob
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `dataset_${objectId}.zip`; // Name of the downloaded file
            document.body.appendChild(link);
            link.click();
            link.remove(); // Clean up
        })
        .catch((error) => console.error("Error downloading dataset:", error));
};

  
  
  return (
    <div className="flex flex-col items-center p-8 bg-gradient-to-r from-blue-50 via-indigo-50 to-indigo-100 min-h-screen">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-5xl">
        <h1 className="text-3xl font-bold text-indigo-600 text-center mb-8">
          Advanced Object Search
        </h1>

        {/* Search Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Typename Selection */}
          <div>
            <label className="block text-lg font-medium text-indigo-800">Looking for</label>
            <select
              value={query.typename}
              onChange={(e) => handleInputChange("typename", e.target.value)}
              className="w-full p-3 bg-indigo-50 border border-indigo-300 rounded focus:ring focus:ring-indigo-300"
            >
              <option value="">-= Select typename =-</option>
              {typenames.map((typename, index) => (
                <option key={index} value={typename}>
                  {typename}
                </option>
              ))}
            </select>
          </div>

        {/* Associated Type Selection */}
        <div>
  <label className="block text-lg font-medium text-indigo-800">Which has</label>
  <Select
    isMulti
    options={typenames.map((typename) => ({
      value: typename,
      label: typename,
    }))}
    onChange={(selectedOptions) =>
      handleInputChange(
        'associatedTypes',
        selectedOptions ? selectedOptions.map((option) => option.value) : []
      )
    }
    styles={customSelectStyles} // Apply custom styles
    className="react-select-container"
    classNamePrefix="react-select"
  />
  {query.associatedTypes.length > 0 && (
    <div className="mt-2 text-indigo-700">
      <strong>Selected Types:</strong> {query.associatedTypes.join(', ')}
    </div>
  )}
</div>
          {/* Date Range */}
          <div>
            <label className="block text-lg font-medium text-indigo-800">Created From</label>
            <input
              type="date"
              value={query.createdFrom}
              onChange={(e) => handleInputChange("createdFrom", e.target.value)}
              className="w-full p-3 bg-indigo-50 border border-indigo-300 rounded focus:ring focus:ring-indigo-300"
            />
          </div>

          <div>
            <label className="block text-lg font-medium text-indigo-800">Created To</label>
            <input
              type="date"
              value={query.createdTo}
              onChange={(e) => handleInputChange("createdTo", e.target.value)}
              className="w-full p-3 bg-indigo-50 border border-indigo-300 rounded focus:ring focus:ring-indigo-300"
            />
          </div>

          {/* Chemical System Selection */}
          <div className="col-span-2">
            <label className="block text-lg font-medium text-indigo-800">Including Elements</label>
            <button
              type="button"
              className="mt-2 bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 transition"
              onClick={() => setIsModalOpen(true)}
            >
              Add Elements
            </button>
          </div>
        </div>

        {/* Element Grid */}
        {selectedElements.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-indigo-800 mb-4">Element Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedElements.map((element) => (
                <div
                  key={element}
                  className="p-4 bg-indigo-50 border border-indigo-300 rounded-lg shadow-sm"
                >
                  <h4 className="text-lg font-semibold text-indigo-800">{element}</h4>
                  <label className="block text-sm text-indigo-600 mt-2">Percentage</label>
                  <input
                    type="number"
                    placeholder="Enter percentage"
                    value={elementDetails[element]?.percentage || ""}
                    onChange={(e) =>
                      setElementDetails((prevDetails) => ({
                        ...prevDetails,
                        [element]: {
                          percentage: e.target.value,
                        },
                      }))
                    }
                    className="w-full p-2 border border-indigo-300 rounded focus:ring focus:ring-indigo-400"
                  />
                  <button
                    className="mt-2 text-red-500 hover:text-red-700 font-medium"
                    onClick={() =>
                      setSelectedElements((prev) => prev.filter((el) => el !== element))
                    }
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search Button */}
        <div className="text-center mt-8">
        <button
    onClick={() => handleSearch()} // Do not pass the event object
    className="bg-green-500 text-white px-8 py-3 rounded-lg shadow hover:bg-green-600 transition"
>
    Search
</button>

        </div>
      </div>

      {/* Search Results */}
      {results.length > 0 && (
        <div className="mt-10 bg-white p-6 rounded-lg shadow-lg w-full max-w-5xl">
          <h2 className="text-2xl font-semibold text-indigo-800 mb-4">Search Results</h2>
          <ul className="space-y-4">
  {results.map((result, index) => (
    <li
      key={index}
      className="p-4 bg-indigo-50 border border-indigo-300 rounded hover:bg-indigo-100 transition"
    >
      <p>
        <strong>Object Name:</strong>{" "}
        <a
          href={`/object/${result.objectid}`}
          className="text-blue-500 hover:underline"
        >
          {result.objectname || "Unnamed Object"}
        </a>
      </p>
      <p>
        <strong>Typename:</strong> {result.typename}
      </p>
      <AssociatedTypesDisplay associatedTypes={result.associatedTypes} />
      <p>
        <strong>Created:</strong> {result.created}
      </p>
      <p>
        <strong>Elements:</strong> {result.elements}
      </p>
      <p>
        <strong>Compositions:</strong>{" "}
        {result.compositions
          .map((comp) => `${comp.element}: ${comp.percentage}%`)
          .join(", ")}
      </p>
      {/* Add Download Button */}
      <button
        onClick={() => handleDownloadObject(result.objectid)}
        className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
      >
        Download Dataset
      </button>
    </li>
  ))}
</ul>

{/* Pagination Controls */}
<div className="flex justify-between items-center mt-8">
        <button
            onClick={() => handleSearch(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded ${currentPage === 1 ? 'bg-gray-300' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
        >
            Previous
        </button>
        <p>
            Page {currentPage} of {totalPages}
        </p>
        <button
            onClick={() => handleSearch(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded ${currentPage === totalPages ? 'bg-gray-300' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
        >
            Next
        </button>
    </div>
        </div>
        
      )}


      {/* Modal for Periodic Table */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h3 className="text-xl font-semibold mb-4">Select Elements</h3>
        <PeriodicTable
          onElementSelect={setSelectedElements}
          selectedElements={selectedElements}
        />
        <button
          className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
          onClick={() => setIsModalOpen(false)}
        >
          Confirm Selection
        </button>
      </Modal>
    </div>
  );
};

// Subcomponent for Associated Types with Show More/Less
const AssociatedTypesDisplay = ({ associatedTypes }) => {
  const [showAll, setShowAll] = useState(false);

  const displayedTypes = showAll ? associatedTypes : associatedTypes.slice(0, 5);

  return (
    <div>
      <p>
        <strong>Associated Types:</strong>{" "}
        {displayedTypes.join(", ")}
      </p>
      {associatedTypes.length > 5 && (
        <button
          onClick={() => setShowAll((prev) => !prev)}
          className="text-blue-500 hover:underline"
        >
          {showAll ? "Show Less" : `Show More (${associatedTypes.length - 5})`}
        </button>
      )}
    </div>
  );
};

export default ObjectSearchPage;
