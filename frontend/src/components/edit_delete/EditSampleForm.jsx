import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Modal from '../Create_object/Modal';
import { PeriodicTable } from '../PeriodicTableElements/PeriodicTable';
import config from '../../config_path';
const EditSampleForm = () => {
  const { objectId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    type: '0', // Default to the first type option
    waferId: '',
    airExposureTime: '0',
    name: '',
    description: '',
    chemicalSystem: '',
    elemnumber: 0,
    substrate: '',
    accessControl: 'protected',
  });

  const [substrateOptions, setSubstrateOptions] = useState([]);
  const [selectedElements, setSelectedElements] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const typeOptions = [
    { id: 0, name: 'unknown' },
    { id: 1, name: 'Materials Library (342-grid)' },
    { id: 2, name: 'Stripe' },
    { id: 3, name: 'No Gradient' },
    { id: 4, name: 'Stress Chip' },
    { id: 5, name: 'Piece' },
  ];

  const mapAccessControl = (value) => {
    switch (value) {
      case 0:
        return 'public';
      case 1:
        return 'protected';
      case 2:
        return 'protectedNDA';
      case 3:
        return 'private';
      default:
        return 'protected';
    }
  };

  useEffect(() => {
    // Fetch sample data

    fetch(`${config.BASE_URL}api/object/${objectId}/`)
      .then((response) => {
        if (!response.ok) throw new Error('Failed to fetch sample data');
        return response.json();
      })
      .then((data) => {
        console.log('Fetched Data:', data);

        const elements = data.Sample?.Elements ? data.Sample.Elements.split('-') : [];
        const typeProperty = data.Properties.find((prop) => prop.propertyname === 'Type');
        const waferIdProperty = data.Properties.find((prop) => prop.propertyname === 'Wafer ID');
        const airExposureTimeProperty = data.Properties.find(
          (prop) => prop.propertyname === 'Air exposure time'
        );

        setFormData({
          typename: data.Type?.TypeName || '',
          name: data.ObjectName || '',
          description: data.Description || '',
          chemicalSystem: elements.join('-'),
          elemnumber: elements.length,
          substrate: data.Substrate || '',
          accessControl: mapAccessControl(data.Access),
          type: typeProperty?.value || '',
          waferId: waferIdProperty?.value || '',
          airExposureTime: airExposureTimeProperty?.value || '',
        });

        setSelectedElements(elements);
      })
      .catch((error) => {
        console.error('Error fetching sample data:', error);
        setErrorMessage('Failed to load sample details.');
      });

    fetch(`${config.BASE_URL}api/substrate-options/`)
      .then((response) => response.json())
      .then((data) => setSubstrateOptions(data))
      .catch((error) => console.error('Error fetching substrates:', error));
  }, [objectId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleElementSelect = (elements) => {
    setSelectedElements(elements);
  };

  const handleConfirmElements = () => {
    setFormData((prevState) => ({
      ...prevState,
      chemicalSystem: selectedElements.join('-'),
      elemnumber: selectedElements.length,
    }));
    setIsModalOpen(false);
  };

  const validatePayload = () => {
    if (!formData.type || isNaN(parseInt(formData.type, 10))) {
      setErrorMessage('Type is required and must be a valid number.');
      return false;
    }
    if (!formData.waferId || isNaN(parseInt(formData.waferId, 10))) {
      setErrorMessage('Wafer ID is required and must be a valid number.');
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validatePayload()) return;

    const token = localStorage.getItem('token');
    const payload = {
      typename: formData.typename,
      name: formData.name,
      description: formData.description,
      chemicalSystem: selectedElements.join('-'),
      elemnumber: selectedElements.length,
      substrate: formData.substrate,
      accessControl: formData.accessControl,
      intProperties: [
        {
          propertyName: 'Type',
          value: parseInt(formData.type, 10),
          comment: 'Type of the physical sample',
        },
        {
          propertyName: 'Wafer ID',
          value: parseInt(formData.waferId, 10),
          comment: 'As engraved on the wafer',
        },
      ].filter((prop) => prop.value !== null),
      floatProperties: [
        {
          propertyName: 'Air exposure time',
          value: parseFloat(formData.airExposureTime),
          comment: 'Air exposure time in minutes',
        },
      ].filter((prop) => prop.value !== null),
    };

    console.log('Payload being sent:', payload);

    fetch(`${config.BASE_URL}api/edit_sample/${objectId}/`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((err) => {
            throw new Error(err.error || 'Failed to update sample');
          });
        }
        return response.json();
      })
      .then(() => {
        setSuccessMessage('Sample updated successfully!');
        setTimeout(() => navigate(-1), 2000);
      })
      .catch((error) => {
        console.error('Error updating sample:', error);
        setErrorMessage(error.message || 'Failed to update sample.');
      });
  };

  return (
    <div className="flex justify-center p-8 bg-blue-50 min-h-screen">
      <div className="bg-white p-10 rounded-lg shadow-md w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-blue-600">Edit Sample</h1>
        </div>
        {errorMessage && <div className="text-red-600 mb-4">{errorMessage}</div>}
        {successMessage && <div className="text-green-600 mb-4">{successMessage}</div>}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Type */}
          <div>
            <label className="block text-lg font-semibold text-blue-800">
              Type<span className="text-red-500">*</span>
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full p-3 bg-blue-50 border border-blue-300 rounded focus:ring focus:ring-blue-300"
            >
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
              name="waferId"
              value={formData.waferId}
              onChange={handleInputChange}
              className="w-full p-3 bg-blue-50 border border-blue-300 rounded"
              required
            />
          </div>
          {/* Air Exposure Time */}
          <div>
            <label className="block text-lg font-semibold text-blue-800">
              Air exposure time (minutes)
            </label>
            <input
              type="text"
              name="airExposureTime"
              value={formData.airExposureTime}
              onChange={handleInputChange}
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
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full p-3 bg-blue-50 border border-blue-300 rounded"
              required
            />
          </div>
          {/* Description */}
          <div>
            <label className="block text-lg font-semibold text-blue-800">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full p-3 bg-blue-50 border border-blue-300 rounded h-32"
            ></textarea>
          </div>
          <div>
          <label className="block text-lg font-semibold text-blue-800">
              Chemical System<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.chemicalSystem}
              readOnly
              className="w-full p-3 bg-blue-50 border border-blue-300 rounded"
            />
            <button
              type="button"
              className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              onClick={() => setIsModalOpen(true)}
            >
              Edit Elements
            </button>
          </div>

          <div>
          <label className="block text-lg font-semibold text-blue-800">
              Substrate<span className="text-red-500">*</span>
            </label>
            <select
              name="substrate"
              value={formData.substrate}
              onChange={handleInputChange}
              className="w-full p-3 bg-blue-50 border border-blue-300 rounded"
            >
              <option value="">-- select substrate --</option>
              {substrateOptions.map((substrate) => (
                <option key={substrate.id} value={substrate.id}>
                  {substrate.name}
                </option>
              ))}
            </select>
          </div>

          <div>
          <label className="block text-lg font-semibold text-blue-800">
              Access Control<span className="text-red-500">*</span>
            </label>
            <select
              name="accessControl"
              value={formData.accessControl}
              onChange={handleInputChange}
              className="w-full p-3 bg-blue-50 border border-blue-300 rounded"
            >
              <option value="public">Public</option>
              <option value="protected">Protected</option>
              <option value="protectednda">Protected NDA</option>
              <option value="private">Private</option>
            </select>
          </div>

          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg"
            >
              Cancel
            </button>
            <button type="submit" className="bg-blue-500 text-white px-5 py-2 rounded-lg">
              Save Changes
            </button>
          </div>
        </form>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <h3 className="text-xl font-semibold mb-4">Select Elements</h3>
          <PeriodicTable
            onElementSelect={handleElementSelect}
            selectedElements={selectedElements}
          />
          <button
            className="mt-4 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
            onClick={handleConfirmElements}
          >
            Confirm Selection
          </button>
        </Modal>
      </div>
    </div>
  );
};

export default EditSampleForm;
