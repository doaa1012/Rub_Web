import React, { useState } from 'react';
import config from '../../../config_path';

function AddProcessingStep({ objectId, onStepAdded }) {
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!description.trim()) {
      alert('Description is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${config.BASE_URL}api/add_processing_step/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          description,
          parentObjectId: objectId, // Pass the current object ID to associate the sample
        }),
      });
      
    

      if (response.ok) {
        const data = await response.json();
       
        setDescription(''); // Clear the input
        onStepAdded(); // Notify parent component to refresh data
      } else {
        const errorData = await response.json();
        alert(`Error adding processing step: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error adding processing step:', error);
      alert('An error occurred while adding the processing step.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="processing-step-section">
      <h3 className="text-lg font-bold mb-2">Create Processing Step</h3>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Describe the processing step (e.g., Annealing at 750°C for 30 minutes)"
        className="w-full p-2 border rounded"
      />
      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white py-2 px-4 mt-4 rounded"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Adding...' : 'Add Processing Step'}
      </button>
    </div>
  );
}

export default AddProcessingStep;
