import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import config from '../../config_path';
const EditIdeasAndPlans = () => {
  const { objectId } = useParams();
  const navigate = useNavigate();
  const [fileRemoved, setFileRemoved] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    rubricId: '',
    sortCode: 0,
    accessControl: '',
    name: '',
    url: '',
    fileUrl: '', // For existing file download
    filePath: null, // For file uploads
    description: '',
    measurements: {},
  });

  const [rubrics, setRubrics] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [newMeasurement, setNewMeasurement] = useState({ name: '', value: '', comment: '' });
  const [removeFile, setRemoveFile] = useState(false);
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
    // Fetch rubrics
    fetch(`${config.BASE_URL}api/rubrics/`)
      .then((response) => response.json())
      .then((data) => setRubrics(data))
      .catch((error) => console.error('Error fetching rubrics:', error));

    // Fetch object data
    if (objectId) {
      fetch(`${config.BASE_URL}api/object/${objectId}/`)
        .then((response) => response.json())
        .then((data) => {
          const measurements = data.Properties.reduce((acc, prop) => {
            acc[prop.propertyname] = { value: prop.value, comment: prop.comment };
            return acc;
          }, {});

          setFormData({
            type: data.Type?.TypeName || '',
            rubricId: data.RubricId || '',
            sortCode: data.SortCode || 0,
            accessControl: mapAccessControl(data.Access),
            name: data.Name || '',
            url: data.ObjectNameUrl || '',
            fileUrl: data.FileUrl || '',
            description: data.Description || '',
            measurements,
          });
        })
        .catch((error) => console.error('Error fetching object data:', error));
    }
  }, [objectId]);

  const mapAccessControl = (accessValue) => {
    switch (accessValue) {
      case 0:
        return 'public';
      case 1:
        return 'protected';
      case 2:
        return 'protectednda';
      case 3:
        return 'private';
      default:
        return 'protected';
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleMeasurementChange = (type, value) => {
    setFormData((prevData) => ({
      ...prevData,
      measurements: {
        ...prevData.measurements,
        [type]: {
          value,
          comment: prevData.measurements[type]?.comment || '',
        },
      },
    }));
  };

  const handleAddMeasurement = () => {
    if (!newMeasurement.name.trim()) {
      setErrorMessage('Measurement name cannot be empty.');
      return;
    }
    setFormData((prevData) => ({
      ...prevData,
      measurements: {
        ...prevData.measurements,
        [newMeasurement.name]: {
          value: newMeasurement.value,
          comment: newMeasurement.comment,
        },
      },
    }));
    setNewMeasurement({ name: '', value: '', comment: '' });
    setErrorMessage('');
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prevData) => ({ ...prevData, filePath: file, fileUrl: '' })); // Clear existing fileUrl
  };

  const handleRemoveFile = () => {
    setFileRemoved(true); // Mark file as removed
    setFormData((prevData) => ({ ...prevData, fileUrl: '', filePath: null })); // Clear file fields
  };


  const handleSubmit = (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      setErrorMessage('Authorization token is missing. Please log in.');
      return;
    }

    const formDataPayload = new FormData();
    formDataPayload.append('type', formData.type);
    formDataPayload.append('rubricId', formData.rubricId);
    formDataPayload.append('sortCode', formData.sortCode || 0);
    formDataPayload.append('accessControl', formData.accessControl);
    formDataPayload.append('name', formData.name);
    formDataPayload.append('url', formData.url);
    formDataPayload.append('description', formData.description);
    formDataPayload.append('measurements', JSON.stringify(formData.measurements));
    formDataPayload.append('removeFile', fileRemoved); // Send file removal flag

    if (formData.filePath) {
      formDataPayload.append('filePath', formData.filePath); // Add new file if uploaded
    }

    fetch(`${config.BASE_URL}api/edit_ideas_and_plans/${objectId}/`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: formDataPayload,
    })
      .then(async (response) => {
        const responseBody = await response.json();
        if (response.ok) {
          setSuccessMessage(responseBody.message || 'Object updated successfully.');
          setErrorMessage('');
          setTimeout(() => navigate(-1), 2000);
        } else {
          setErrorMessage(responseBody.error || 'An unexpected error occurred.');
        }
      })
      .catch((error) => {
        console.error('Error during submission:', error);
        setErrorMessage('An unknown error occurred.');
      });
  };

  return (
    <div className="flex justify-center p-8 bg-blue-50 min-h-screen">
      <div className="bg-white p-10 rounded-lg shadow-md w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-blue-600">Editing Ideas and Plans</h1>
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
              value={formData.type}
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
            <label className="block text-lg font-semibold text-blue-800">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full p-3 bg-blue-50 border border-blue-300 rounded"
            />
          </div>
          {/* Access Control */}
          <div>
            <label className="block text-lg font-semibold text-blue-800">Access Control</label>
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

            {/* File Section */}
<div>
  <label className="block text-lg font-semibold text-blue-800">File</label>
  {formData.fileUrl && !fileRemoved ? (
    <div className="mb-4 flex items-center">
      <a
        href={`${config.BASE_URL}${formData.fileUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline"
        download
      >
        Download Existing File
      </a>
      <button
        type="button"
        onClick={handleRemoveFile}
        className="ml-4 text-red-600 underline hover:text-red-800 transition duration-200"
      >
        Remove File
      </button>
    </div>
  ) : (
    <div className="mb-4 text-gray-600 italic">No file selected or file removed.</div>
  )}
  <input
    type="file"
    name="filePath"
    onChange={handleFileChange}
    className="w-full p-3 bg-blue-50 border border-blue-300 rounded"
  />
</div>


          {/* Sort Code */}
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
            <label className="block text-lg font-semibold text-blue-800">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full p-3 bg-blue-50 border border-blue-300 rounded"
            ></textarea>
          </div>

          {/* Measurements Table */}
          <div>
            {formData.measurements && Object.keys(formData.measurements).length > 0 && (
              <h2 className="text-lg font-bold text-blue-800 mb-4">Edit Measurements</h2>
            )}

            <table className="table-auto w-full border border-blue-300">
              <thead>
                <tr>
                  <th className="border px-4 py-2 bg-blue-100">Type</th>
                  <th className="border px-4 py-2 bg-blue-100">Value</th>
                  <th className="border px-4 py-2 bg-blue-100">Comment</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(formData.measurements).map(([type, measurement]) => (
                  <tr key={type}>
                    <td className="border px-4 py-2">{type.replace("Measurements Report => ", "")}</td>
                    <td className="border px-4 py-2">
                      <input
                        type="text"
                        value={measurement.value || ''}
                        onChange={(e) => handleMeasurementChange(type, e.target.value)}
                        className="w-full p-2 bg-blue-50 border border-blue-300 rounded"
                      />
                    </td>
                    <td className="border px-4 py-2">{measurement.comment}</td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>

          {/* Add New Measurement */}
          <div>
            <h3 className="text-lg font-semibold text-blue-800">Add New Measurement</h3>
            <div className="flex space-x-4">
              <input
                type="text"
                placeholder="Measurement Name"
                value={newMeasurement.name}
                onChange={(e) => setNewMeasurement({ ...newMeasurement, name: e.target.value })}
                className="p-3 border border-blue-300 rounded"
              />
              <input
                type="text"
                placeholder="Value"
                value={newMeasurement.value}
                onChange={(e) => setNewMeasurement({ ...newMeasurement, value: e.target.value })}
                className="p-3 border border-blue-300 rounded"
              />
              <input
                type="text"
                placeholder="Comment"
                value={newMeasurement.comment}
                onChange={(e) => setNewMeasurement({ ...newMeasurement, comment: e.target.value })}
                className="p-3 border border-blue-300 rounded"
              />
              <button
                type="button"
                onClick={handleAddMeasurement}
                className="p-3 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add
              </button>
            </div>
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

export default EditIdeasAndPlans;
