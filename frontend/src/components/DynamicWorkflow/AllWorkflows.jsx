import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const AllWorkflows = () => {
  const [workflows, setWorkflows] = useState([]);

  // Retrieve workflows from localStorage
  useEffect(() => {
    fetch('http://localhost:8000/api/get-workflows/')
      .then(response => response.json())
      .then(data => {
        setWorkflows(data.workflows);
      })
      .catch(error => {
        console.error('Error retrieving workflows:', error);
      });
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6 text-center">All Workflows</h1>
      
      {/* Workflow List */}
      {workflows.length > 0 ? (
        <ul className="w-full max-w-lg mb-6">
          {workflows.map((workflow) => (
            <li key={workflow.id} className="mb-4 flex justify-between">
              
              {/* Existing Link to View Workflow */}
              <Link 
                to={`/workflows/${workflow.id}`} 
                className="text-lg font-semibold text-blue-600 hover:underline"
              >
                {workflow.title}
              </Link>

              {/* New Link to WorkflowDynamic */}
              <Link 
                to={`/workflows-table/${workflow.id}`} 
                className="text-lg font-semibold text-green-600 hover:underline ml-4"
              >
                Workflow Table
              </Link>

            </li>
          ))}
        </ul>
      ) : (
        <p className="text-lg text-gray-600 mb-6">No workflows created yet.</p>
      )}
      
      {/* Add New Workflow Button */}
      <Link to="/WorkflowCreation" className="mt-auto">
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300 shadow-lg">
          Add New Workflow
        </button>
      </Link>
    </div>
  );
};

export default AllWorkflows;
