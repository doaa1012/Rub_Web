import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import config from '../../config_path';
const EditSECCMLongRangeRaw = () => {
  const { objectId } = useParams();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const rubricName = queryParams.get('rubricName');
  const ACCESS_CONTROL_MAP = {
    public: "Public",
    protected: "Protected",
    protectednda: "Protected NDA",
    private: "Private",
  };

  const [formData, setFormData] = useState({
    rubricId: "",
    sortCode: 0,
    accessControl: "protected",
    name: "",
    url: "",
    filePath: null,
    description: "",
    pH: "",
    offsetPotential: "",
    referenceElectrode: "Ag/AgCl",
    capillaryDiameter: "",
  });

  const [rubrics, setRubrics] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    console.log("Fetching rubrics...");

    // Fetch rubrics
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

    // Fetch existing object data for editing
    if (objectId) {
      console.log(`Fetching object data for objectId: ${objectId}`);
      fetch(`${config.BASE_URL}api/object/${objectId}/`)
        .then((response) => response.json())
        .then((data) => {
          console.log('Object data fetched:', data);
          const properties = data.Properties || [];

          // Map properties into formData fields
          const updatedProperties = {
            pH: properties.find((prop) => prop.propertyname.toLowerCase() === 'ph')?.value || '',
            offsetPotential: properties.find((prop) => prop.propertyname.toLowerCase() === 'offset potential')?.value || '',
            referenceElectrode: properties.find((prop) => prop.propertyname.toLowerCase() === 'reference electrode')?.value || 'Ag/AgCl',
            capillaryDiameter: properties.find((prop) => prop.propertyname.toLowerCase() === 'capillary diameter')?.value || '',
          };

          setFormData({
            type: data.Type?.TypeName || '',
            rubricId: data.RubricId || '',
            sortCode: data.SortCode || 0,
            accessControl: mapAccessControl(data.Access),
            name: data.ObjectName || '',
            url: data.ObjectNameUrl || '',
            fileUrl: data.FileUrl || '', // Set file URL for download
            fileName: data.FileName || '', // Set file name for display
            description: data.Description || '',
            ...updatedProperties, // Include mapped properties
          });
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

  const handleFileChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      filePath: e.target.files[0],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  
    const token = localStorage.getItem("token");
    const formDataObj = new FormData();
  
    // Validate required fields
    if (!formData.name) {
      setErrorMessage("Name is required.");
      return;
    }
    if (!formData.rubricId) {
      setErrorMessage("Rubric must be selected.");
      return;
    }
  
    // Append form fields
    formDataObj.append("rubricId", formData.rubricId || "");
    formDataObj.append("sortCode", formData.sortCode || 0);
    formDataObj.append("accessControl", ACCESS_CONTROL_MAP[formData.accessControl] || "protected");
    formDataObj.append("name", formData.name || "");
    formDataObj.append("url", formData.url || "");
    formDataObj.append("description", formData.description || "");
    formDataObj.append("typeId", "59"); // Replace with the correct TypeId
    formDataObj.append("tenantId", "4");
  
    // Handle file upload
    if (formData.filePath) {
      formDataObj.append("filePath", formData.filePath);
    }
  
    // Collect properties
    const properties = [
      { name: "pH", value: parseFloat(formData.pH) || 0, comment: "pH between 0 and 14", type: "float" },
      { name: "Offset Potential", value: parseFloat(formData.offsetPotential) || 0, comment: "V (positive or negative)", type: "float" },
      { name: "Reference Electrode", value: formData.referenceElectrode || "Ag/AgCl", comment: "Selected value from the options list (Ag/AgCl/3M KCl, ...)", type: "int" },
      { name: "Capillary Diameter", value: parseFloat(formData.capillaryDiameter) || 0, comment: "nm", type: "float" },
    ];
    formDataObj.append("properties", JSON.stringify(properties));
  
    // Send the request
    fetch(`${config.BASE_URL}api/edit_object_with_properties/${objectId}/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formDataObj,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data.message) {
          navigate(-1); // Navigate back on success
        } else {
          setErrorMessage(data.error || "Unknown error occurred.");
        }
      })
      .catch((error) => setErrorMessage(error.message));
  };
  

  return (
    <div className="flex justify-center p-8 bg-blue-50 min-h-screen">
      <div className="bg-white p-10 rounded-lg shadow-md w-full max-w-4xl">
        <h1 className="text-3xl font-extrabold text-blue-600 mb-6 text-center">
          Edit SECCM Long-range Raw
        </h1>

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
              value="SECCM Long-range Raw (zip)"
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
            <label className="block font-semibold text-blue-800">Sort Code</label>
            <input
              type="number"
              name="sortCode"
              value={formData.sortCode}
              onChange={handleInputChange}
              className="w-full p-3 bg-blue-50 border border-blue-300 rounded"
            />
          </div>

          <div>
            <label className="block font-semibold text-blue-800">Access Control</label>
            <select
              name="accessControl"
              value={formData.accessControl}
              onChange={handleInputChange}
              className="w-full p-3 bg-blue-50 border border-blue-300 rounded"
            >
              {Object.entries(ACCESS_CONTROL_MAP).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-blue-800">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full p-3 bg-blue-50 border border-blue-300 rounded"
              placeholder="Enter name"
            />
          </div>

          <div>
            <label className="block font-semibold text-blue-800">URL</label>
            <input
              type="text"
              name="url"
              value={formData.url}
              onChange={handleInputChange}
              className="w-full p-3 bg-blue-50 border border-blue-300 rounded"
              placeholder="Enter unique URL"
            />
          </div>

          <div>
            <label className="block font-semibold text-blue-800">File Path</label>
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
                className="w-full p-3 bg-blue-50 border border-blue-300 rounded"
              />
            )}
          </div>

          <div>
            <label className="block font-semibold text-blue-800">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full p-3 bg-blue-50 border border-blue-300 rounded h-32"
              placeholder="Enter description"
            ></textarea>
          </div>

          <div className="border-t border-blue-300 pt-6">
            <h2 className="text-lg font-bold text-blue-800 mb-4">Measurements</h2>
            <div className="space-y-4">
              <div>
                <label className="block font-semibold text-blue-800">pH</label>
                <input
                  type="number"
                  name="pH"
                  value={formData.pH}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-blue-50 border border-blue-300 rounded"
                  placeholder="pH (0-14)"
                  min="0"
                  max="14"
                  step="0.1"
                />
              </div>

              <div>
                <label className="block font-semibold text-blue-800">Offset Potential</label>
                <input
                  type="number"
                  name="offsetPotential"
                  value={formData.offsetPotential}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-blue-50 border border-blue-300 rounded"
                  placeholder="Offset potential (V)"
                />
              </div>

              <div>
                <label className="block font-semibold text-blue-800">Reference Electrode</label>
                <select
                  name="referenceElectrode"
                  value={formData.referenceElectrode}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-blue-50 border border-blue-300 rounded"
                >
                  <option value="Ag/AgCl">Ag/AgCl</option>
                  <option value="Hg/HgO">Hg/HgO</option>
                  <option value="SHE">SHE</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-blue-800">Capillary Diameter</label>
                <input
                  type="number"
                  name="capillaryDiameter"
                  value={formData.capillaryDiameter}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-blue-50 border border-blue-300 rounded"
                  placeholder="Capillary diameter (nm)"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
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

export default EditSECCMLongRangeRaw;
