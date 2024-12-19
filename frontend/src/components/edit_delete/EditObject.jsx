import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import ChemicalSystemSection from '../Create_object/ChemicalSystemSection';
import config from '../../config_path';
const EditObject = () => {
  const { objectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const rubricName = queryParams.get('rubricName');
  const [isModalOpen, setIsModalOpen] = useState(false);


  const [formData, setFormData] = useState({
    type: '',
    rubricId: '',
    sortCode: 0,
    accessControl: '',
    name: '',
    url: '',
    fileUrl: '',
    fileName: '',
    filePath: '',
    description: '',
  });

  const [selectedElements, setSelectedElements] = useState([]);
  const [elementData, setElementData] = useState({});
  const [chemicalSystem, setChemicalSystem] = useState('');
  const [rubrics, setRubrics] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [additionalValues, setAdditionalValues] = useState({
    tolerance: '', // Tolerance input
  });
    // State for User Dropdown
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
   

  const specialTypes = [
    'Calculation/Computational Composition',
    'Calculation/Computational Sample',
    'Composition Test',
    'Computational Composition Atom',
    'Composition',
  ];
  const showDetails = ['Calculation/Computational Composition', 'Composition'].includes(formData.type);
  useEffect(() => {
    // Fetch users
    fetch(`${config.BASE_URL}api/users/`)
      .then((response) => response.json())
      .then((data) => {
        setUsers(data); // Populate the users state
      })
      .catch((error) => console.error('Error fetching users:', error));
  
    // Fetch rubrics and object data
    fetch(`${config.BASE_URL}api/rubrics/`)
      .then((response) => response.json())
      .then((data) => {
        setRubrics(data);
        if (rubricName) {
          const matchingRubric = data.find((rubric) => rubric.rubricname === rubricName);
          if (matchingRubric) {
            setFormData((prevData) => ({
              ...prevData,
              rubricId: matchingRubric.rubricid,
            }));
          }
        }
      })
      .catch((error) => console.error('Error fetching rubrics:', error));
  
    // Fetch object data
    if (objectId) {
      fetch(`${config.BASE_URL}api/object/${objectId}/`)
        .then((response) => response.json())
        .then((data) => {
          console.log(data)
          setFormData({
            type: data.Type?.TypeName || '',
            rubricId: data.RubricId || '',
            sortCode: data.SortCode || 0,
            accessControl: mapAccessControl(data.Access),
            name: data.ObjectName || '',
            url: data.ObjectNameUrl || '',
            fileUrl: data.FileUrl || '',
            fileName: data.FileName || '',
            description: data.Description || '',
          });
  
          setChemicalSystem(data.Sample?.Elements || '');
          setSelectedElements(data.Sample?.Elements?.split('-') || []);
          setElementData(
            (data.Composition || []).reduce((acc, el) => {
              acc[el.elementname] = {
                absolute: el.valueabsolute || '',
                percentage: el.valuepercent || '',
              };
              return acc;
            }, {})
          );
          
  
          if (data.PropertyFloat?.length) {
            const toleranceProperty = data.PropertyFloat.find((prop) => prop.propertyname === 'Tolerance');
            if (toleranceProperty) {
              setAdditionalValues((prevValues) => ({
                ...prevValues,
                tolerance: toleranceProperty.value,
              }));
            }
          }
        })
        .catch((error) => console.error('Error fetching object data:', error));
    }
  }, [objectId, rubricName]);
  

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
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleAdditionalChange = (e) => {
    const { name, value } = e.target;
    setAdditionalValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };
const handleUserChange = (e) => {
  const { value } = e.target;
  setSelectedUser(value); // Update the selected user
};

  const handleConfirmElements = () => {
    console.log('Confirm Elements Called:', selectedElements);
    setChemicalSystem(selectedElements.join('-')); // Update the chemical system
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  
    const token = localStorage.getItem('token');
    const payload = new FormData();
  
    // Add form data
    payload.append('tenantId', 4);
    payload.append('typeId', formData.type);
    payload.append('rubricId', formData.rubricId);
    payload.append('sortCode', formData.sortCode || 0);
    payload.append('accessControl', formData.accessControl);
    payload.append('name', formData.name);
    payload.append('url', formData.url);
    payload.append('description', formData.description);
  
    if (objectId) payload.append('objectId', objectId);
    if (formData.filePath && typeof formData.filePath !== 'string') {
      payload.append('filePath', formData.filePath);
    }
  
    // Add elements and additional data
    if (specialTypes.includes(formData.type)) {
      payload.append('chemicalSystem', chemicalSystem);
      const elementsArray = selectedElements.map((element) => ({
        name: element,
        absolute: elementData[element]?.absolute || null,
        percentage: elementData[element]?.percentage || null,
      }));
      payload.append('elements', JSON.stringify(elementsArray));
      if (additionalValues.tolerance) {
        payload.append('tolerance', additionalValues.tolerance);
      }
    }
  
    fetch(`${config.BASE_URL}api/edit_object/${objectId}/`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: payload,
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'An unexpected server error occurred');
        }
        navigate(-1); // Go back on success
      })
      .catch((error) => {
        console.error('Error submitting form:', error.message);
        setErrorMessage(error.message || 'An unknown error occurred.');
      });
  };
  

  return (
    <div className="flex justify-center p-8 bg-blue-50 min-h-screen">
      <div className="bg-white p-10 rounded-lg shadow-md w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-blue-600">Editing Object ({formData.type})</h1>
        </div>

        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-lg font-semibold text-blue-800">Type</label>
            <input type="text" value={formData.type} disabled className="w-full p-3 bg-blue-200 border border-blue-300 rounded-lg" />
          </div>

          <div>
            <label className="block text-lg font-semibold text-blue-800">Area or Project to Belong</label>
            <select
              name="rubricId"
              value={formData.rubricId}
              onChange={handleInputChange}
              className="w-full p-3 bg-blue-50 border border-blue-300 rounded"
            >
              <option value="">-- select the section --</option>
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
            >

              <option value="public">Public</option>
              <option value="protected">Protected</option>
              <option value="protectednda">Protectednda</option>
              <option value="private">Private</option>
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
            <label className="block font-bold text-blue-600">URL (unique)</label>
            <input
              type="text"
              name="url"
              value={formData.url}
              onChange={handleInputChange}
              placeholder="Input unique URL part"
              className="w-full p-3 bg-blue-50 border border-blue-300 rounded"
            />
          </div>

          <div>
            <label className="block text-lg font-semibold text-blue-800">File Path</label>
            {formData.fileUrl ? (
              <div className="flex items-center space-x-4">
                <a
                  href={formData.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  {formData.fileName || 'Download File'}
                </a>
                <input
                  type="file"
                  name="filePath"
                  onChange={(e) => setFormData({ ...formData, filePath: e.target.files[0] })}
                  className="w-full p-3 bg-blue-50 border border-blue-300 rounded"
                />
              </div>
            ) : (
              <input
                type="file"
                name="filePath"
                onChange={(e) => setFormData({ ...formData, filePath: e.target.files[0] })}
                className="w-full p-3 border border-blue-300 rounded-lg"
              />
            )}
          </div>

          <div>
            <label className="block text-lg font-semibold text-blue-800">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full p-3 bg-blue-50 border border-blue-300 rounded h-32"
            ></textarea>
          </div>
          {specialTypes.includes(formData.type) && (
        <ChemicalSystemSection
        chemicalSystem={chemicalSystem}
        selectedElements={selectedElements}
        setSelectedElements={setSelectedElements}
        elementData={elementData} // Pass elementData here
        setElementData={setElementData} // Pass the setter for elementData
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        showPercentage={['Calculation/Computational Composition', 'Composition'].includes(formData.type)}
      />
      
          )}

          {formData.type === 'Request for Synthesis' && (
            <ChemicalSystemSection
              chemicalSystem={chemicalSystem}
              selectedElements={selectedElements}
              elementData={elementData}
              isModalOpen={isModalOpen}
              setChemicalSystem={setChemicalSystem}
              setIsModalOpen={setIsModalOpen}
              setSelectedElements={setSelectedElements}
              setElementData={setElementData}
              handleConfirmElements={handleConfirmElements}
              additionalInputs={[{ name: 'tolerance', label: 'Tolerance', type: 'number', placeholder: 'Enter tolerance in at. %' }]}
              additionalValues={additionalValues}
              handleAdditionalChange={handleAdditionalChange}
              users={users}
              selectedUser={selectedUser}
              handleUserChange={handleUserChange}
            />
          )}


          <div className="flex justify-between mt-6">
            <button
              type="button"
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
              onClick={() => navigate(-1)}
            >
              Close and Back to the Site
            </button>
            <button type="submit" className="bg-blue-500 text-white px-5 py-2 rounded-lg hover:bg-blue-600">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditObject;
