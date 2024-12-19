import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import config from '../../config_path';
const EditEDXObject = () => {
  const { objectId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    type: '',
    rubricId: '',
    sortCode: 0,
    accessControl: 'protected',
    name: '',
    url: '',
    fileUrl: '', // Current file display
    filePath: null, // New file for upload
    description: '',
    fileRemoved: false, // Track if file is removed
  });

  const [rubrics, setRubrics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Fetch rubrics
    fetch(`${config.BASE_URL}api/rubrics/`)
      .then((res) => res.json())
      .then((data) => setRubrics(data))
      .catch((err) => console.error('Error fetching rubrics:', err));

    // Fetch object data
    fetch(`${config.BASE_URL}api/object/${objectId}/`)
      .then((res) => res.json())
      .then((data) => {
        setFormData({
          type: data.Type?.TypeName || '',
          rubricId: data.RubricId || '',
          sortCode: data.SortCode || 0,
          accessControl: mapAccessControl(data.Access),
          name: data.ObjectName || '',
          url: data.ObjectNameUrl || '',
          fileUrl: data.FileUrl || '',
          filePath: null,
          description: data.Description || '',
          fileRemoved: false,
        });
      })
      .catch(() => setErrorMessage('Failed to load object data.'))
      .finally(() => setIsLoading(false));
  }, [objectId]);

  const mapAccessControl = (accessValue) =>
    accessValue === 1 ? 'protected' : accessValue === 2 ? 'public' : 'private';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      filePath: e.target.files[0],
      fileRemoved: !!formData.fileUrl, // Mark as removed if there’s an existing file
    }));
  };

  const handleRemoveFile = () => {
    setFormData((prevState) => ({
      ...prevState,
      filePath: null,
      fileUrl: '',
      fileRemoved: true,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    const payload = new FormData();

    // Append form data
    payload.append('typeId', formData.type);
    payload.append('rubricId', formData.rubricId);
    payload.append('sortCode', formData.sortCode);
    payload.append(
      'accessControl',
      formData.accessControl === 'protected' ? 1 : formData.accessControl === 'public' ? 2 : 3
    );
    payload.append('name', formData.name);
    payload.append('url', formData.url);
    payload.append('description', formData.description);

    // Handle file upload/removal
    if (formData.filePath) {
      payload.append('filePath', formData.filePath);
    }
    payload.append('fileRemoved', formData.fileRemoved);

    console.log('Submitting payload:', [...payload.entries()]); // Debugging the payload

    fetch(`${config.BASE_URL}api/edit_edx/${objectId}/`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: payload,
    })
      .then((response) => {
        if (!response.ok) throw new Error('Failed to update object');
        return response.json();
      })
      .then(() => {
        setSuccessMessage('Object updated successfully!');
        setTimeout(() => navigate(-1), 2000);
      })
      .catch((err) => setErrorMessage(err.message));
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="flex justify-center p-8">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-3xl">
        <h1 className="text-2xl font-bold text-gray-700 mb-6">Edit Object ({formData.type})</h1>

        {errorMessage && <div className="text-red-600 mb-4">{errorMessage}</div>}
        {successMessage && <div className="text-green-600 mb-4">{successMessage}</div>}

        <form onSubmit={handleSubmit}>
          <div>
            <label>Type</label>
            <input
              type="text"
              value={formData.type}
              disabled
              className="w-full p-3 bg-gray-200 rounded-lg"
            />
          </div>

          <div>
            <label>Rubric</label>
            <select
              name="rubricId"
              value={formData.rubricId}
              onChange={handleInputChange}
              className="w-full p-3 border rounded-lg"
            >
              <option value="">-- Select --</option>
              {rubrics.map((rubric) => (
                <option key={rubric.rubricid} value={rubric.rubricid}>
                  {rubric.rubricname}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Access Control</label>
            <select
              name="accessControl"
              value={formData.accessControl}
              onChange={handleInputChange}
              className="w-full p-3 border rounded-lg"
            >
              <option value="protected">Protected</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>

          <div>
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full p-3 border rounded-lg"
            />
          </div>

          <div>
            <label>URL</label>
            <input
              type="text"
              name="url"
              value={formData.url}
              onChange={handleInputChange}
              className="w-full p-3 border rounded-lg"
            />
          </div>

          <div>
            <label>File</label>
            {formData.fileUrl ? (
              <div className="flex items-center space-x-4">
                <a
                  href={formData.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  Download Existing File
                </a>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg"
                >
                  Remove File
                </button>
              </div>
            ) : (
              <input
                type="file"
                name="filePath"
                onChange={handleFileChange}
                className="w-full p-3 border rounded-lg"
              />
            )}
          </div>

          <div>
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full p-3 border rounded-lg h-32"
            ></textarea>
          </div>

          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg"
            >
              Cancel
            </button>
            <button type="submit" className="bg-blue-500 text-white px-5 py-2 rounded-lg">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEDXObject;
