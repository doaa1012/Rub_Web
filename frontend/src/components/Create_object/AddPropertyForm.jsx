import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import config from '../../config_path';
const AddPropertyPage = () => {
  const navigate = useNavigate();
  const { objectId } = useParams();
  const [formData, setFormData] = useState({
    objectId: objectId || '', // Set the objectId from URL
    name: '',
    value: '',
    valueEpsilon: '',
    sortCode: '',
    row: '',
    comment: '',
    propertyType: 'string', // Default property type
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const token = localStorage.getItem('token'); // Get the token from local storage
    if (!token) {
      alert('User is not authenticated');
      return;
    }
  
    try {
      const response = await fetch(`${config.BASE_URL}api/save-property-data/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Include the token in the request
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        alert('Property saved successfully');
        navigate(-1);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (err) {
      alert('Failed to save property');
    }
  };
  
  
  return (
    <div className="flex justify-center p-8 bg-blue-50 min-h-screen">
      <div className="bg-white p-10 rounded-lg shadow-md w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-blue-600">Add New Property</h1>
        </div>
        <div>
            <label className="block text-lg font-semibold text-blue-800">Property Type</label>
            <select
              name="propertyType"
              value={formData.propertyType}
              onChange={handleInputChange}
              className="w-full p-3 bg-blue-50 border border-blue-300 rounded"
            >
              <option value="string">String</option>
              <option value="float">Float</option>
              <option value="int">Integer</option>
              <option value="bigstring">Big String</option>
            </select>
          </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-lg font-semibold text-blue-800">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter property name"
              className="w-full p-3 bg-blue-50 border border-blue-300 rounded"
            />
          </div>

          {/* Value */}
          <div>
            <label className="block text-lg font-semibold text-blue-800">Value</label>
            <input
              type="text"
              name="value"
              value={formData.value}
              onChange={handleInputChange}
              placeholder="Enter property value"
              className="w-full p-3 bg-blue-50 border border-blue-300 rounded"
            />
          </div>

          {/* Value Epsilon */}
          <div>
            <label className="block text-lg font-semibold text-blue-800">Value Epsilon</label>
            <input
              type="text"
              name="valueEpsilon"
              value={formData.valueEpsilon}
              onChange={handleInputChange}
              placeholder="Enter measurement error"
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
              placeholder="Enter sort order"
              className="w-full p-3 bg-blue-50 border border-blue-300 rounded"
            />
          </div>

          {/* Row */}
          <div>
            <label className="block text-lg font-semibold text-blue-800">Row</label>
            <input
              type="number"
              name="row"
              value={formData.row}
              onChange={handleInputChange}
              placeholder="Enter row number"
              className="w-full p-3 bg-blue-50 border border-blue-300 rounded"
            />
          </div>

          {/* Comment */}
          <div>
            <label className="block text-lg font-semibold text-blue-800">Comment</label>
            <textarea
              name="comment"
              value={formData.comment}
              onChange={handleInputChange}
              placeholder="Enter comments or notes"
              className="w-full p-3 bg-blue-50 border border-blue-300 rounded h-32"
            ></textarea>
          </div>

         

          {/* Buttons */}
          <div className="flex justify-between mt-6">
            <button
              type="button"
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
            <button type="submit" className="bg-blue-500 text-white px-5 py-2 rounded-lg hover:bg-blue-600">
              Save Property
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPropertyPage;
