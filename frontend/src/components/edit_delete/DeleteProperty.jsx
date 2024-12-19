import React from 'react';
import { FaTrash } from 'react-icons/fa';

const DeleteProperty = ({ propertyId, propertyType, apiEndpoint, onDeleteComplete }) => {
  const handleDelete = async () => {
    // Validate that both propertyId and propertyType are present
    if (!propertyId || !propertyType) {
      console.error('Error: Property ID or Property Type is missing!');
      alert('Property ID or Property Type is missing!');
      return;
    }

    // Confirm the deletion action
    const confirmDelete = window.confirm('Are you sure you want to delete this property?');
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authentication token is missing. Please log in again.');
        return;
      }

      // Include propertyType in the query parameters
      const response = await fetch(
        `${apiEndpoint}/${propertyId}/?propertyType=${propertyType}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        console.log(`Property with ID ${propertyId} deleted successfully.`);
        alert('Property deleted successfully.');
        onDeleteComplete(propertyId); // Notify parent about successful deletion
      } else {
        const errorData = await response.json();
        console.error('Error deleting property:', errorData);
        alert(errorData?.error || 'Failed to delete property.');
      }
    } catch (error) {
      console.error('Error deleting property:', error);
      alert('An unexpected error occurred while deleting the property.');
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="flex items-center gap-2 text-red-500 hover:text-red-700 transition-all"
      title="Delete Property"
      style={{
        background: 'none',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
      }}
    >
      <FaTrash />
      <span className="text-sm">Delete</span>
    </button>
  );
};

export default DeleteProperty;
