import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import config from '../../config_path';
const EditLiteratureReferenceForm = () => {
  const { typeName, objectId } = useParams(); // Assuming objectId is passed in the route
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    type: typeName,
    rubricId: '',
    sortCode: 0,
    accessControl: 'protected',
    name: '',
    url: '',
    filePath: '',
    description: '',
    authors: '',
    title: '',
    journal: '',
    year: '',
    volume: '',
    number: '',
    startPage: '',
    endPage: '',
    doi: '',
    bibtex: '',
  });

  const [rubrics, setRubrics] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch rubrics and the reference data when the component is mounted
  useEffect(() => {
    const fetchReferenceData = async () => {
      try {
        const rubricResponse = await fetch(`${config.BASE_URL}api/rubrics/`);
        if (!rubricResponse.ok) throw new Error('Failed to fetch rubrics');
        const rubricData = await rubricResponse.json();
        setRubrics(rubricData);

        const referenceResponse = await fetch(`${config.BASE_URL}api/object/${objectId}/`);
        if (!referenceResponse.ok) throw new Error('Failed to fetch reference data');
        const referenceData = await referenceResponse.json();

        // Update form data with the fetched reference data
        setFormData({
          type: referenceData.Type?.TypeName || '', // Ensure TypeName is extracted properly
          typeId: referenceData.Type?.TypeId || '', // Ensure TypeId is set correctly
          rubricId: referenceData.RubricId || '',
          name: referenceData.Name || '',
          url: referenceData.ObjectNameUrl || '',
          description: referenceData.Description || '',
          authors: referenceData.Reference?.Authors || '',
          title: referenceData.Reference?.Title || '',
          journal: referenceData.Reference?.Journal || '',
          year: referenceData.Reference?.Year || '',
          volume: referenceData.Reference?.Volume || '',
          number: referenceData.Reference?.Number || '',
          startPage: referenceData.Reference?.StartPage || '',
          endPage: referenceData.Reference?.EndPage || '',
          doi: referenceData.Reference?.DOI || '',
          bibtex: referenceData.Reference?.BibTeX || '',
        });
        console.log('Setting FormData:', {
          type: referenceData.Type?.TypeName || '',
          typeId: referenceData.Type?.TypeId || '',
        });



        console.log('Fetched Reference Data:', referenceData);
        setLoading(false);
      } catch (error) {
        console.error('Error:', error);
        setErrorMessage('Failed to load reference data.');
        setLoading(false);
      }
    };

    fetchReferenceData();
  }, [objectId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    const payload = new FormData();

    payload.append('tenantId', 4); // Assuming tenantId is fixed
    payload.append('typeId', formData.typeId); // Ensure typeId is included
    payload.append('name', formData.name);
    Object.keys(formData).forEach((key) => {
      if (formData[key]) {
        payload.append(key, formData[key]);
      }
    });

    console.log('Payload:', Array.from(payload.entries())); // Debug payload

    try {
      const response = await fetch(`${config.BASE_URL}api/edit_reference/${objectId}/`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: payload,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error Response:', errorData);
        throw new Error(`Failed to update reference: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.message === 'Object and Reference updated successfully!') {
        navigate(-2); // Navigate back after success
      } else {
        setErrorMessage('Unexpected response from the server.');
      }
    } catch (error) {
      setErrorMessage(error.message || 'An unknown error occurred.');
    }
  };


  return (
    <div className="flex justify-center p-8 bg-blue-50 min-h-screen">
      <div className="bg-white p-10 rounded-lg shadow-md w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-blue-600">
            Edit Reference ({formData.type})
          </h1>
        </div>

        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-lg font-semibold text-blue-800">Type</label>
            <input
              type="text"
              value={formData.type || 'Unknown'} // Use formData.type to display the type name
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
            <label className="block text-lg font-semibold text-blue-800">Authors</label>
            <input
              type="text"
              name="authors"
              value={formData.authors}
              onChange={handleInputChange}
              className="w-full p-3 bg-blue-50 border border-blue-300 rounded"
            />
          </div>

          <div>
            <label className="block text-lg font-semibold text-blue-800">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full p-3 bg-blue-50 border border-blue-300 rounded"
            />
          </div>

          <div>
            <label className="block text-lg font-semibold text-blue-800">Journal</label>
            <input
              type="text"
              name="journal"
              value={formData.journal}
              onChange={handleInputChange}
              className="w-full p-3 bg-blue-50 border border-blue-300 rounded"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-lg font-semibold text-blue-800">Year</label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                className="w-full p-3 bg-blue-50 border border-blue-300 rounded"
              />
            </div>
            <div>
              <label className="block text-lg font-semibold text-blue-800">Volume</label>
              <input
                type="text"
                name="volume"
                value={formData.volume}
                onChange={handleInputChange}
                className="w-full p-3 bg-blue-50 border border-blue-300 rounded"
              />
            </div>
          </div>



          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-lg font-semibold text-blue-800">Start Page</label>
              <input
                type="text"
                name="startPage"
                value={formData.startPage}
                onChange={handleInputChange}
                className="w-full p-3 bg-blue-50 border border-blue-300 rounded"
              />
            </div>
            <div>
              <label className="block text-lg font-semibold text-blue-800">End Page</label>
              <input
                type="text"
                name="endPage"
                value={formData.endPage}
                onChange={handleInputChange}
                className="w-full p-3 bg-blue-50 border border-blue-300 rounded"
              />
            </div>
          </div>

          <div>
            <label className="block text-lg font-semibold text-blue-800">DOI</label>
            <input
              type="text"
              name="doi"
              value={formData.doi}
              onChange={handleInputChange}
              className="w-full p-3 bg-blue-50 border border-blue-300 rounded"
            />
          </div>
          <div>
            <label className="block text-lg font-semibold text-blue-800">Number (issue)</label>
            <input
              type="text"
              name="number"
              value={formData.number}
              onChange={handleInputChange}
              className="w-full p-3 bg-blue-50 border border-blue-300 rounded"
            />
          </div>


          <div>
            <label className="block text-lg font-semibold text-blue-800">BibTeX</label>
            <textarea
              name="bibtex"
              value={formData.bibtex}
              onChange={handleInputChange}
              className="w-full p-3 bg-blue-50 border border-blue-300 rounded h-32"
            ></textarea>
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

export default EditLiteratureReferenceForm;
