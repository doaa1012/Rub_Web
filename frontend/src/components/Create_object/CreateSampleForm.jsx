import React, { useState, useEffect } from 'react';
import { PeriodicTable } from '../PeriodicTableElements/PeriodicTable';
import Modal from './Modal';
import { useLocation, useNavigate } from 'react-router-dom';
import config from '../../config_path';
function CreateSampleForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const [substrate, setSubstrate] = useState('');
  const [substrateOptions, setSubstrateOptions] = useState([]);
  const [type, setType] = useState('Materials Library (342-grid)');
  const [waferId, setWaferId] = useState('');
  const [airExposureTime, setAirExposureTime] = useState(''); // New state for float property
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [chemicalSystem, setChemicalSystem] = useState('');
  const [accessControl, setAccessControl] = useState('protected');
  const [selectedElements, setSelectedElements] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const typeOptions = [
    { id: 0, name: 'unknown' },
    { id: 1, name: 'Materials Library (342-grid)' },
    { id: 2, name: 'Stripe' },
    { id: 3, name: 'No Gradient' },
    { id: 4, name: 'Stress Chip' },
    { id: 5, name: 'Piece' },
  ];

  // Extract rubricnameurl from the URL
  const searchParams = new URLSearchParams(location.search);
  const rubricnameurl = searchParams.get('rubricnameurl');

  useEffect(() => {
    // Fetch substrate options from the backend
    fetch(`${config.BASE_URL}api/substrate-options/`)
      .then((response) => response.json())
      .then((data) => setSubstrateOptions(data))
      .catch((error) => console.error('Error fetching substrate options:', error));
  }, []);

  const handleElementSelect = (elements) => {
    setSelectedElements(elements);
  };
  useEffect(() => {
    // Update the chemical system whenever selectedElements change
    setChemicalSystem(selectedElements.join('-'));
  }, [selectedElements]);
  

  const handleConfirmElements = () => {
    setChemicalSystem(selectedElements.join('-'));
    setIsModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Map accessControl to numeric values
    const accessControlValue =
    accessControl === 'public'
      ? 0
      : accessControl === 'protected'
      ? 1
      : accessControl === 'protectednda'
      ? 2
      : 3; // For 'private'
  
    const payload = {
      typeId: type, // `type` now holds the id directly
      tenantId: 4,
      RubricNameUrl: rubricnameurl,
      waferId: waferId,
      name: name,
      description: description,
      chemicalSystem: selectedElements.join('-'),
      elemnumber: selectedElements.length,
      accessControl: accessControlValue,
      substrate: substrate,
      typename: 'Sample',
      intProperties: [
        {
          propertyName: 'Type',
          value: type, // Send the type id directly
          row: 0,
          comment: 'Type of the physical sample',
        },
        {
          propertyName: 'Wafer ID',
          value: parseInt(waferId, 10),
          row: 0,
          comment: 'As engraved on the wafer',
        },
      ],
      floatProperties: [
        {
          propertyName: 'Air exposure time',
          value: parseFloat(airExposureTime),
          row: 0,
          comment: 'minutes',
        },
      ],
    };
    

    try {
      const response = await fetch(`${config.BASE_URL}api/create_sample/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error:', errorData);
       
      } else {
        const data = await response.json();
        console.log('Success:', data);
     

        // Navigate back to the previous page
        navigate(-1); // Use -1 to go back to the previous page or specify a URL
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('An unexpected error occurred. Please try again later.');
    }
  };

  return (
    <div className="flex justify-center p-8 bg-blue-50 min-h-screen">
      <div className="bg-white p-10 rounded-lg shadow-md w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-blue-600">
            Create New Object (Sample)
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Substrate */}
          <div>
            <label className="block text-lg font-semibold text-blue-800">
              Substrate<span className="text-red-500">*</span>
            </label>
            <select
              value={substrate}
              onChange={(e) => setSubstrate(e.target.value)}
              className="w-full p-3 bg-blue-50 border border-blue-300 rounded focus:ring focus:ring-blue-300"
              required
            >
              <option value="">-= select the substrate =-</option>
              {substrateOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>

          {/* Type */}
          <div>
            <label className="block text-lg font-semibold text-blue-800">
              Type<span className="text-red-500">*</span>
            </label>
            <select
              value={type}
              onChange={(e) => setType(parseInt(e.target.value, 10))}
              className="w-full p-3 bg-blue-50 border border-blue-300 rounded focus:ring focus:ring-blue-300"
              required
            >
              <option value="">-= select the type =-</option>
              {typeOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>

          {/* Wafer ID */}
          <div>
            <label className="block text-lg font-semibold text-blue-800">
              Wafer ID<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Unique wafer ID as engraved by the wafer manufacturer (0 - old unmarked wafers)"
              value={waferId}
              onChange={(e) => setWaferId(e.target.value)}
              className="w-full p-3 bg-blue-50 border border-blue-300 rounded"
              required
            />
          </div>

          {/* Air Exposure Time */}
          <div>
            <label className="block text-lg font-semibold text-blue-800">
              Air exposure time (in total)
            </label>
            <input
              type="text"
              placeholder="Enter air exposure time in minutes"
              value={airExposureTime}
              onChange={(e) => setAirExposureTime(e.target.value)}
              className="w-full p-3 bg-blue-50 border border-blue-300 rounded"
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-lg font-semibold text-blue-800">
              Name<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Will be prefixed with '<id>'"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 bg-blue-50 border border-blue-300 rounded"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-lg font-semibold text-blue-800">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 bg-blue-50 border border-blue-300 rounded h-32"
              placeholder="Enter description (optional)"
            ></textarea>
          </div>

          {/* Chemical System */}
          <div>
            <label className="block text-lg font-semibold text-blue-800">
              Chemical System<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Chemical system: for example As-Ga"
              value={chemicalSystem}
              className="w-full p-2 bg-blue-50 border border-blue-300 rounded"
              readOnly
              required
              style={{ height: '2.5rem', fontSize: '0.875rem' }} // Adjust size
            />
            <button
              type="button"
              className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
              onClick={() => setIsModalOpen(true)}
            >
              Add Elements
            </button>
          </div>
          {/* Access Control */}
          <div>
            <label className="block text-lg font-semibold text-blue-800">
              Access Control<span className="text-red-500">*</span>
            </label>
            <select
              value={accessControl}
              onChange={(e) => setAccessControl(e.target.value)}
              className="w-full p-3 bg-blue-50 border border-blue-300 rounded"
              required
            >
              <option value="public">public</option>
              <option value="protected">protected</option>
              <option value="protectedNDA">protected NDA</option>
              <option value="private">private</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between mt-6">
            <button
              type="button"
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              onClick={() => navigate(-1)}
            >
              Close and Back to the Site
            </button>
            <button
              type="submit"
              className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
            >
              Save
            </button>
          </div>
        </form>

      {/* Modal for Periodic Table */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <h3 className="text-xl font-semibold mb-4">Select Elements</h3>
            <PeriodicTable
              onElementSelect={handleElementSelect}
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
    </div>
  );
};

export default CreateSampleForm;