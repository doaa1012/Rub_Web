import React from "react";
import { FaTrash } from "react-icons/fa";

const DeleteHandler = ({ objectId, onDeleteComplete, apiEndpoint }) => {
  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("User is not authenticated.");
      }

      const response = await fetch(`${apiEndpoint}/${objectId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete the object.");
      }

   
      if (onDeleteComplete) {
        onDeleteComplete(objectId);
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="text-red-500 hover:text-red-700 flex items-center gap-2 bg-transparent hover:bg-transparent"
    >
      <FaTrash className="text-sm" />
      Delete
    </button>
  );
};

export default DeleteHandler;
