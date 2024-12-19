import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const WorkflowDetail = () => {
  const { id } = useParams(); // Get the workflow ID from the URL
  const [workflow, setWorkflow] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  useEffect(() => {
    // Fetch workflow data from the backend using the ID
    fetch(`http://localhost:8000/api/workflows/${id}/`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        setWorkflow(data); // Set the workflow data
        setLoading(false); // Stop loading
      })
      .catch((error) => {
        setError(error); // Set error
        setLoading(false); // Stop loading
      });
  }, [id]);

  if (loading) {
    return <p>Loading workflow...</p>;
  }

  if (error) {
    return <p>Error loading workflow: {error.message}</p>;
  }

  if (!workflow) {
    return <p>Workflow not found</p>;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">{workflow.title}</h1>
      {workflow.stages.map((stage, index) => (
        <div key={index} className="bg-white p-4 mb-4 shadow-md rounded-lg">
          <h4 className="font-semibold mb-2">{stage.name}</h4>

          {stage.typenames.length > 0 && (
            <p>Associated Typenames: {stage.typenames.join(', ')}</p>
          )}

          {stage.steps.length > 0 && (
            <div>
              <h5 className="font-semibold">Steps:</h5>
              <ul>
                {stage.steps.map((step, stepIndex) => (
                  <li key={stepIndex}>
                    <strong>Step Name:</strong> {step.name} |{' '}
                    <strong>Object Types:</strong> {step.typenames.join(', ')}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default WorkflowDetail;
