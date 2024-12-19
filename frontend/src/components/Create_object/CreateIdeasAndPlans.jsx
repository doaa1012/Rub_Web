import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import config from '../../config_path';
const CreateIdeasAndPlans = () => {
  const { typeName } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const rubricnameurl = queryParams.get('rubricnameurl');
  const objectId = queryParams.get('objectId');

  const [formData, setFormData] = useState({
    type: typeName,
    rubricId: '',
    sortCode: 0,
    accessControl: '', // Default to 'protected'
    name: '',
    url: '',
    filePath: null, // Change to null for file handling
    description: '',
    measurements: {},
  });

  const [rubrics, setRubrics] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState(''); // Add this line
  const ACCESS_CONTROL_MAP = {
    public: 0,
    protected: 1,
    protectednda: 2,
    private: 3,
  };

  const measurementDetails = {
    EDX: {
      comment: 'TypeIds CSV to include in the report column (1 - include to report):, 13, 15, 19, 53, 78, 79',
    },
    XRD: {
      comment: 'TypeIds CSV to include in the report column (1 - include to report):, 17, 31, 44, 55, 56, 97',
    },
    XPS: {
      comment: 'TypeIds CSV to include in the report column (1 - include to report):, 30',
    },
    Thickness: {
      comment: 'TypeIds CSV to include in the report column (1 - include to report):, 27, 38, 39, 40',
    },
    SEM: {
      comment: 'TypeIds CSV to include in the report column (1 - include to report):, 24',
    },
    Resistance: {
      comment: 'TypeIds CSV to include in the report column (1 - include to report):, 14, 16, 33',
    },
    Bandgap: {
      comment: 'TypeIds CSV to include in the report column (1 - include to report):, 41, 80, 81, 82',
    },
    APT: {
      comment: 'TypeIds CSV to include in the report column (1 - include to report):, 20',
    },
    TEM: {
      comment: 'TypeIds CSV to include in the report column (1 - include to report):, 26',
    },
    SDC: {
      comment: 'TypeIds CSV to include in the report column (1 - include to report):, 57, 58, 85',
    },
    SECCM: {
      comment: 'TypeIds CSV to include in the report column (1 - include to report):, 50, 59, 60, 86, 87',
    },
    FIM: {
      comment: 'TypeIds CSV to include in the report column (1 - include to report):, 47',
    },
  };

  useEffect(() => {
    fetch(`${config.BASE_URL}api/rubrics/`)
      .then((response) => response.json())
      .then((data) => {
        setRubrics(data);
        if (rubricnameurl) {
          const matchingRubric = data.find(
            (rubric) => rubric.rubricnameurl.toLowerCase() === rubricnameurl.toLowerCase()
          );
          if (matchingRubric) {
            setFormData((prevData) => ({
              ...prevData,
              rubricId: matchingRubric.rubricid,
            }));
          } else {
            setErrorMessage('No matching rubric found for the provided URL.');
          }
        }
      })
      .catch((error) => console.error('Error fetching rubrics:', error));
  }, [rubricnameurl]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleMeasurementChange = (type, value) => {
    setFormData((prevData) => ({
      ...prevData,
      measurements: {
        ...prevData.measurements,
        [type]: {
          value, // User-input value
          comment: measurementDetails[type]?.comment || '', // Predefined comment
        },
      },
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prevData) => ({
      ...prevData,
      filePath: file,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      setErrorMessage('Authorization token is missing. Please log in.');
      return;
    }

    // Create FormData to handle file uploads
    const formDataPayload = new FormData();
    formDataPayload.append('type', formData.type);
    formDataPayload.append('name', formData.name);
    formDataPayload.append('rubricId', formData.rubricId);
    formDataPayload.append('sortCode', formData.sortCode || 0);
    formDataPayload.append('accessControl', formData.accessControl);
    formDataPayload.append('description', formData.description);

    // Add measurements as JSON
    formDataPayload.append('measurements', JSON.stringify(formData.measurements));

    // Add optional fields
    if (formData.url) formDataPayload.append('url', formData.url);
    if (formData.filePath) formDataPayload.append('filePath', formData.filePath); // Optional file upload
    if (objectId) formDataPayload.append('objectId', objectId);

    fetch(`${config.BASE_URL}api/ideas_and_plans/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formDataPayload,
    })
      .then(async (response) => {
        const responseBody = await response.json(); // Always parse response body
        if (response.ok) {
          // Success handling
          setErrorMessage('');
          setSuccessMessage(responseBody.message || 'Object created successfully!');
          setTimeout(() => navigate(-1), 2000);
        } else {
          // Error handling with detailed messages
          setErrorMessage(responseBody.error || 'An unexpected error occurred.');
          console.error('Error response from server:', responseBody);
        }
      })
      .catch((error) => {
        // Network or unexpected errors
        console.error('Error during submission:', error);
        setErrorMessage(error.message || 'An unknown error occurred.');
      });
  };



  return (
    <div className="flex justify-center p-8 bg-blue-50 min-h-screen">
      <div className="bg-white p-10 rounded-lg shadow-md w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-blue-600">
            Create New Object ({typeName})
          </h1>
        </div>

        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-lg font-semibold text-blue-800">Type</label>
            <input
              type="text"
              value={typeName}
              disabled
              className="w-full p-3 bg-blue-100 border border-blue-300 rounded"
            />
          </div>

          <div>
            <label className="block text-lg font-semibold text-blue-800">Rubric</label>
            <select
              name="rubricId"
              value={formData.rubricId}
              onChange={handleInputChange}
              className="w-full p-3 bg-blue-50 border border-blue-300 rounded"
            >
              <option value="">-- Select Rubric --</option>
              {rubrics.map((rubric) => (
                <option key={rubric.rubricid} value={rubric.rubricid}>
                  {rubric.rubricname}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-lg font-semibold text-blue-800">Access Control</label>
            <select
              name="accessControl"
              value={formData.accessControl}
              onChange={handleInputChange}
              className="w-full p-3 bg-blue-50 border border-blue-300 rounded"
              required
            >
              <option value="">-- Select Access Control --</option>
              <option value="public">Public</option>
              <option value="protected">Protected</option>
              <option value="protectednda">Protected NDA</option>
              <option value="private">Private</option>
            </select>
          </div>
          <div>
            <label className="block text-lg font-semibold text-blue-800">Sort Code</label>
            <input
              type="number"
              name="sortCode"
              value={formData.sortCode}
              onChange={handleInputChange}
              className="w-full p-3 bg-blue-50 border border-blue-300 rounded"
            />
          </div>
          <div>
          <label className="block text-lg font-semibold text-blue-800">File (Optional)</label>
          <input
            type="file"
            name="filePath"
            onChange={handleFileChange}
            className="w-full p-3 bg-blue-50 border border-blue-300 rounded"
          />
        </div>

          <div>
            <label className="block text-lg font-semibold text-blue-800">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full p-3 bg-blue-50 border border-blue-300 rounded"
            />
          </div>

          <div>
            <label className="block text-lg font-semibold text-blue-800">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full p-3 bg-blue-50 border border-blue-300 rounded"
            ></textarea>
          </div>

          <div>
            <h2 className="text-lg font-bold text-blue-800 mb-4">Measurements Report</h2>
            <table className="table-auto w-full border border-blue-300">
              <thead>
                <tr>
                  <th className="border px-4 py-2 bg-blue-100">Type</th>
                  <th className="border px-4 py-2 bg-blue-100">Value</th>
                  <th className="border px-4 py-2 bg-blue-100">Comment</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(measurementDetails).map((type) => (
                  <tr key={type}>
                    <td className="border px-4 py-2">{type}</td>
                    <td className="border px-4 py-2">
                      <input
                        type="text"
                        className="w-full p-2 bg-blue-50 border border-blue-300 rounded"
                        onChange={(e) => handleMeasurementChange(type, e.target.value)}
                      />
                    </td>
                    <td className="border px-4 py-2">{measurementDetails[type].comment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              onClick={() => navigate(-1)}
            >
              Back
            </button>
            <button
              type="submit"
              className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateIdeasAndPlans;
