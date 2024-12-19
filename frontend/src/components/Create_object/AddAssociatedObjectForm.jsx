import React, { useState } from 'react';

function AddAssociatedObjectForm({ onSubmit, onClose }) {
  const [objectId, setObjectId] = useState('');
  const [objectType, setObjectType] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ objectId, objectType });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <form onSubmit={handleSubmit} className="modal-content bg-white p-4 rounded shadow-lg">
        <h2>Add Associated Object</h2>
        <input type="text" value={objectId} onChange={(e) => setObjectId(e.target.value)} placeholder="Object ID" required />
        <input type="text" value={objectType} onChange={(e) => setObjectType(e.target.value)} placeholder="Object Type" required />
        <button type="submit">Submit</button>
        <button type="button" onClick={onClose}>Cancel</button>
      </form>
    </div>
  );
}

export default AddAssociatedObjectForm;
