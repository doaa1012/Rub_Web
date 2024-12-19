import React from 'react';
import { FaEdit } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const EditRubricButton = ({ rubricId }) => {
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(`/edit/rubric/${rubricId}`); 
  };

  return (
    <FaEdit
      className="text-blue-600 cursor-pointer"
      onClick={handleEdit}
    />
  );
};

export default EditRubricButton;

