import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';

const DynamicWorkflowCreator = () => {
  const [workflowTitle, setWorkflowTitle] = useState(''); // Store the title of the workflow
  const [typenames, setTypenames] = useState([]); // Store available typenames from backend
  const [workflowStages, setWorkflowStages] = useState([]); // Store the user-defined workflow stages
  const [stageName, setStageName] = useState(''); // Store the name of the current stage being created
  const [selectedTypenames, setSelectedTypenames] = useState([]); // Store the typenames selected by the user for the stage
  const [stepName, setStepName] = useState(''); // Store the current step name
  const [selectedStepTypenames, setSelectedStepTypenames] = useState([]); // Store selected typenames for the step
  const [steps, setSteps] = useState([]); // Store steps for the current stage
  const [hasSteps, setHasSteps] = useState(false); // Toggle for whether this stage has steps

  const navigate = useNavigate(); // Hook for navigation to another page

  // Fetch typenames from the backend when the component mounts
  useEffect(() => {
    fetch('http://localhost:8000/api/typenames/')
      .then(response => response.json())
      .then(data => {
        const options = data.typenames.map(type => ({ value: type, label: type }));
        setTypenames(options); // Save the fetched typenames in state
      })
      .catch(error => {
        console.error('Error fetching typenames:', error);
      });
  }, []);

  // Add a new step to the current stage
  const handleAddStep = () => {
    if (stepName.trim() && selectedStepTypenames.length > 0) {
      const newStep = {
        name: stepName,
        typenames: selectedStepTypenames.map(option => option.value),
      };

      setSteps(prevSteps => [...prevSteps, newStep]); // Add step to the list of steps
      setStepName(''); // Clear step name input
      setSelectedStepTypenames([]); // Clear selected typenames for steps
    }
  };

  // Add a new workflow stage with its steps
  const handleAddStage = () => {
    if (stageName.trim() || selectedTypenames.length > 0 || steps.length > 0) {
      const newStage = {
        name: stageName || 'Unnamed Stage',
        typenames: hasSteps ? [] : selectedTypenames.map(option => option.value), // No object types for stage if it has steps
        steps: steps // Add steps to the stage
      };

      setWorkflowStages(prevStages => [...prevStages, newStage]); // Add stage to workflow
      setStageName(''); // Clear stage name input
      setSelectedTypenames([]); // Clear selected typenames for stage
      setSteps([]); // Clear steps after adding stage
      setHasSteps(false); // Reset the steps toggle
    }
  };

  // Render all workflow stages and associated typenames and steps
  const renderWorkflow = () => {
    return workflowStages.map((stage, index) => (
      <div key={index} className="bg-white p-4 mb-4 shadow-md rounded-lg">
        <h4 className="font-semibold mb-2">{stage.name}</h4>

        {/* Only show if stage has object types */}
        {stage.typenames.length > 0 && <p>Associated Typenames: {stage.typenames.join(', ')}</p>}

        {/* Display the steps if there are any */}
        {stage.steps.length > 0 && (
          <div>
            <h5 className="font-semibold">Steps:</h5>
            <ul>
              {stage.steps.map((step, stepIndex) => (
                <li key={stepIndex}>
                  <strong>Step Name:</strong> {step.name} | <strong>Object Types:</strong> {step.typenames.join(', ')}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    ));
  };

  // Save and render workflow
  const handleSaveAndRenderWorkflow = () => {
    const workflowData = {
      title: workflowTitle || 'Untitled Workflow',
      stages: workflowStages,
    };
  
    fetch('http://localhost:8000/api/save-workflow/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(workflowData),
    })
      .then(response => response.json())
      .then(data => {
        // Redirect to the workflow's detail page
        navigate(`/workflows/${data.workflow_id}`);
      })
      .catch(error => {
        console.error('Error saving workflow:', error);
      });
  };
  
  
  

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Create Dynamic Workflow</h1>

      {/* Input for adding a workflow title */}
      <div className="mb-4">
        <label className="font-semibold mb-2 block">Workflow Title:</label>
        <input
          type="text"
          className="border p-2 mb-4 w-full"
          placeholder="Workflow Title"
          value={workflowTitle}
          onChange={(e) => setWorkflowTitle(e.target.value)}
        />
      </div>

      {/* Input for adding a new workflow stage */}
      <div className="mb-4">
        <label className="font-semibold mb-2 block">Stage Name:</label>
        <input
          type="text"
          className="border p-2 mb-4 w-full"
          placeholder="Workflow Stage Name"
          value={stageName}
          onChange={(e) => setStageName(e.target.value)}
        />

        {/* Show only if the stage does NOT have steps */}
        {!hasSteps && (
          <div className="mb-4">
            <label className="font-semibold mb-2 block">Select Object Types for Stage:</label>
            {typenames.length > 0 ? (
              <Select
                isMulti
                value={selectedTypenames}
                onChange={setSelectedTypenames}
                options={typenames}
                className="basic-multi-select"
                classNamePrefix="select"
              />
            ) : (
              <p>No object types available.</p>
            )}
          </div>
        )}

        {/* Toggle for adding steps */}
        <div className="mb-4">
          <label>
            <input
              type="checkbox"
              className="mr-2"
              checked={hasSteps}
              onChange={() => setHasSteps(!hasSteps)}
            />
            This stage has steps
          </label>
        </div>

        {/* Section to add steps to the workflow stage if hasSteps is true */}
        {hasSteps && (
          <div className="mb-4">
            <label className="font-semibold mb-2 block">Step Name:</label>
            <input
              type="text"
              className="border p-2 mb-4 w-full"
              placeholder="Step Name"
              value={stepName}
              onChange={(e) => setStepName(e.target.value)}
            />

            <label className="font-semibold mb-2 block">Select Object Types for Step:</label>
            {typenames.length > 0 ? (
              <Select
                isMulti
                value={selectedStepTypenames}
                onChange={setSelectedStepTypenames}
                options={typenames}
                className="basic-multi-select"
                classNamePrefix="select"
              />
            ) : (
              <p>No object types available.</p>
            )}

            <button
              className="bg-green-500 text-white px-4 py-2 rounded mb-4"
              onClick={handleAddStep}
              disabled={!stepName.trim() || selectedStepTypenames.length === 0} // Disable if step fields are empty
            >
              Add Step
            </button>

            {/* Immediately show the steps added for the current stage */}
            {steps.length > 0 && (
              <div className="bg-gray-100 p-4 mb-4 shadow-md rounded-lg">
                <h5 className="font-semibold">Current Steps for this Stage:</h5>
                <ul>
                  {steps.map((step, stepIndex) => (
                    <li key={stepIndex}>
                      <strong>Step Name:</strong> {step.name} | <strong>Object Types:</strong> {step.typenames.join(', ')}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={handleAddStage}
          disabled={!(selectedTypenames.length > 0 || steps.length > 0 || stageName.trim())} // Enable button if a stage or object type is selected
        >
          Add Workflow Stage
        </button>
      </div>

      {/* Display added workflow stages */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Current Workflow Stages</h2>
        {renderWorkflow()}
      </div>

      {/* Option to download the workflow as JSON */}
      {workflowStages.length > 0 && (
        <>
          <button
            className="bg-teal-500 text-white px-6 py-3 rounded-lg mt-4"
            onClick={() => {
              const workflowData = {
                title: workflowTitle || 'Untitled Workflow',
                stages: workflowStages,
              };
              const dataStr = JSON.stringify(workflowData, null, 2);
              const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

              const exportFileDefaultName = 'workflow.json';

              const linkElement = document.createElement('a');
              linkElement.setAttribute('href', dataUri);
              linkElement.setAttribute('download', exportFileDefaultName);
              linkElement.click();
            }}
          >
            Download Workflow as JSON
          </button>

          <button
            className="bg-purple-500 text-white px-6 py-3 rounded-lg mt-4 ml-4"
            onClick={handleSaveAndRenderWorkflow}
          >
            Render Workflow
          </button>
        </>
      )}
    </div>
  );
};

export default DynamicWorkflowCreator;
