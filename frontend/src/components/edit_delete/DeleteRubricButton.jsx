import React from 'react';
import { FaTrash } from 'react-icons/fa';
import config from '../../config_path';
const DeleteRubricButton = ({ rubricId, onDelete }) => {
  const handleDelete = () => {
    const token = localStorage.getItem('token');

    if (!token) {
      console.error('Token is missing, please ensure you are logged in.');
      return;
    }

    fetch(`${config.BASE_URL}api/delete-rubric/${rubricId}/`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(response => {
      if (response.ok) {
        console.log('Rubric deleted successfully');
        if (typeof onDelete === 'function') {
          onDelete(rubricId); // Call onDelete function to update the parent component’s state
        } else {
          console.error('onDelete is not a function');
        }
      } else {
        console.error('Failed to delete rubric');
      }
    })
    .catch(error => console.error('Error deleting rubric:', error));
  };

  return (
    <FaTrash
      className="text-red-600 cursor-pointer"
      onClick={handleDelete}
    />
  );
};

export default DeleteRubricButton;
