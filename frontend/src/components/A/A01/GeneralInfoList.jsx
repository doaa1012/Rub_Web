import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FaEye, FaEdit, FaFolderPlus, FaPlus, FaBoxOpen, FaFileUpload } from 'react-icons/fa';
import jwt_decode from 'jwt-decode';
import EditRubricButton from '../../edit_delete/EditRubricButton';
import DeleteRubricButton from '../../edit_delete/DeleteRubricButton';
import DragDropFileUpload from '../../Create_object/UploadFile';
import config from '../../../config_path';
function GeneralInfoList() {
  const [groupedData, setGroupedData] = useState({});
  const [relatedObjects, setRelatedObjects] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [viewUserItemsOnly, setViewUserItemsOnly] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  const { area } = useParams();

  const predefinedAreas = ['INF', 'RTG', 'S', 'Z', 'Cross-project cooperations', 'General information'];

  const normalizedArea = predefinedAreas.find(
    (predefined) => predefined.toLowerCase() === area?.trim().toLowerCase()
  ) || 'INF';
  
  const rubricPath = normalizedArea;

  useEffect(() => {
    if (!rubricPath) return;
  
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwt_decode(token);
      console.log('Decoded Token:', decoded); // Log decoded token
      setCurrentUser(decoded.user_id);
    }
  
    console.log('Fetching data for rubricPath:', rubricPath); // Log rubricPath being used
  
    fetch(`${config.BASE_URL}api/get-rubricinfo-by-path/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ rubricpath: rubricPath }),
    })
      .then((response) => {
        console.log('API Response Status:', response.status); // Log response status
        return response.json();
      })
      .then((data) => {
        console.log('API Response Data:', data); // Log entire API response
  
        const rubricData = data.rubric_data || [];
        const objectData = data.object_data || [];
  
        console.log('Rubric Data Received:', rubricData); // Log received rubric data
        console.log('Object Data Received:', objectData); // Log received object data
  
        const grouped = rubricData.reduce((acc, rubric) => {
          const path = rubric.RubricPath?.toLowerCase();
          const normalizedRubricPath = rubricPath.toLowerCase();
  
          if (path?.startsWith(`${normalizedRubricPath}}`)) {
            const key = path.split(`${normalizedRubricPath}}`)[1]?.split('}')[0]?.trim();
            if (key) {
              if (!acc[key]) acc[key] = [];
              acc[key].push({ ...rubric, created_by: rubric.CreatedBy });
            }
          }
          return acc;
        }, {});
  
        console.log('Grouped Rubric Data:', grouped); // Log grouped rubric data
  
        setGroupedData(grouped);
  
        const filteredObjects = objectData.filter((obj) =>
          rubricData.some((rubric) => rubric.RubricID === obj.RubricID)
        );
  
        console.log('Filtered Related Objects:', filteredObjects); // Log filtered related objects
  
        setRelatedObjects(filteredObjects);
      })
      .catch((error) => {
        console.error('Error fetching rubric info:', error); // Log errors
      });
  }, [rubricPath]);
  
  const handleDelete = (rubricId) => {
    setGroupedData((prevGroupedData) => {
      const updatedData = Object.fromEntries(
        Object.entries(prevGroupedData).map(([key, items]) => [
          key,
          items.filter((item) => item.RubricID !== rubricId),
        ])
      );
      return updatedData;
    });
  };

  const filteredData = Object.fromEntries(
    Object.entries(groupedData).map(([key, items]) => [
      key,
      viewUserItemsOnly ? items.filter((item) => item.created_by === currentUser) : items,
    ])
   
  );

  const filteredObjects = viewUserItemsOnly
    ? relatedObjects.filter((obj) => obj.CreatedBy === currentUser)
    : relatedObjects;

  const hasUserItems =
    Object.values(filteredData).some((items) => items.length > 0) || filteredObjects.length > 0;

  return (
    <div className="p-10 bg-blue-50 min-h-screen font-sans">
      <h1 className="text-center text-3xl font-bold text-gray-800 mb-10">
        General Overview for {normalizedArea}
      </h1>

      <div className="flex justify-center gap-5 mb-5">
        <button
          className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-500 transition"
          onClick={() => setViewUserItemsOnly(!viewUserItemsOnly)}
        >
          <FaEye className="text-xl" />
          <span>{viewUserItemsOnly ? 'Show All Items' : 'Show My Items'}</span>
        </button>
      </div>

      {viewUserItemsOnly && !hasUserItems ? (
        <p className="text-center text-gray-500">No items found for the current user.</p>
      ) : (
        <>
          {Object.keys(filteredData).map((key) => (
            <div key={key} className="mt-10">
              <h2 className="text-2xl font-bold text-blue-600 mb-5">{key}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {filteredData[key]?.map((item) => (
                  <div
                    key={item.RubricID}
                    className="bg-white rounded-lg p-5 shadow hover:shadow-lg transition transform hover:scale-105 text-center"
                  >
                    <Link to={`/group/${encodeURIComponent(item.RubricNameUrl)}`} className="no-underline">
                      <h3 className="text-lg font-bold">{item.RubricName}</h3>
                    </Link>
                    {viewUserItemsOnly && item.created_by === currentUser && (
                      <div className="mt-2">
                        <EditRubricButton rubricId={item.RubricID} />
                        <DeleteRubricButton rubricId={item.RubricID} onDelete={handleDelete} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {filteredObjects.length > 0 && (
            <div className="mt-10">
              <h2 className="text-2xl font-bold text-red-600 mb-5">Related Objects</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {filteredObjects.map((obj) => (
                  <div
                    key={obj.ObjectID}
                    className={`bg-white rounded-lg p-5 shadow hover:shadow-lg transition transform hover:scale-105 text-center ${
                      obj.CreatedBy === currentUser ? 'border-2 border-red-500' : ''
                    }`}
                  >
                    <Link to={`/object/${obj.ObjectID}`} className="no-underline">
                      <h3 className="text-red-600 text-lg font-bold">{obj.ObjectName}</h3>
                    </Link>
                    {viewUserItemsOnly && obj.CreatedBy === currentUser && (
                      <div className="flex gap-2 justify-center mt-2">
                        <Link
                          to={`/edit/object/${obj.TypeName.toLowerCase()}/${obj.ObjectID}`}
                          className="text-blue-500 hover:text-blue-700 flex items-center gap-2 underline"
                        >
                          <FaEdit className="text-sm" />
                          Edit
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Buttons for creating new items */}
          <div className="flex justify-center gap-5 mt-10">
            <Link to={`/create/new_container/${normalizedArea}`} className="no-underline">
              <button className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-500 transition">
                <FaFolderPlus className="text-xl" />
                <span>Create a New Container</span>
              </button>
            </Link>
            <Link to={`/create/Ideas or experiment plans?rubricnameurl=${encodeURIComponent(normalizedArea)}`} className="no-underline">
              <button className="flex items-center gap-2 bg-orange-500 text-white px-5 py-2 rounded-lg hover:bg-orange-400 transition">
                <FaPlus className="text-xl" />
                <span>Ideas and Plans</span>
              </button>
            </Link>
            <Link to={`/list-of-objects/${normalizedArea}`} className="no-underline">
              <button className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-500 transition">
                <FaBoxOpen className="text-xl" />
                <span>Create a New Object Type</span>
              </button>
            </Link>
            <button
              className="flex items-center gap-2 bg-green-500 text-white px-5 py-2 rounded-lg hover:bg-green-400 transition"
              onClick={() => setShowUpload(!showUpload)}
            >
              <FaFileUpload className="text-xl" />
              <span>Upload Files</span>
            </button>
          </div>

          {showUpload && (
            <div className="mt-10">
              <DragDropFileUpload objectnameurl={normalizedArea} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default GeneralInfoList;

