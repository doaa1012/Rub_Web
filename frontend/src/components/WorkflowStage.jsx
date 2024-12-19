import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import config from "../config_path";
const WorkflowTable = () => {
  const { objectId } = useParams(); // Get objectId from the URL
  const [workflowData, setWorkflowData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch workflow data based on objectId
    fetch(`${config.BASE_URL}api/workflow-stage/${objectId}/`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log('Fetched workflow data:', data);
        setWorkflowData(data); // Set the data to the state
        setLoading(false); // Set loading to false
      })
      .catch(error => {
        console.error('Error fetching workflow data:', error);
        setError(error); // Set error state
        setLoading(false); // Set loading to false in case of error
      });
  }, [objectId]); // Re-run when objectId changes

  if (loading) {
    return <p>Loading workflow data...</p>;
  }

  if (error) {
    return <p>Error loading workflow data: {error.message}</p>;
  }

  if (!workflowData) {
    return <p>No workflow data available for this object.</p>;
  }

  const workflowSteps = {
    initialSelection: [
      {
        step: "Selecting Promising Compositional Complex Solid Solutions (CCSS)",
        description: "Selecting promising CCSS based on simulations and high-throughput experiments.",
        objectTypes: [
          "Compositional solutions",
          "Simulation Database",
          "Bandgap Reference Spectra (csv)",
          "Synthesis",
          "Sample",
        ],
      },
      {
        step: "Composition Analysis",
        description: "Analyze compositions using techniques like Energy Dispersive X-ray Spectroscopy (EDX).",
        objectTypes: [
          "EDX Image",
          "EDX CSV",
          "XPS",
          "Raman (txt)",
          "Electrochemical data (csv, txt)",
          "Magnetic properties",
          "SEM (image)",
          "EDX Raw (txt)",
        ],
      },
    ],
    refinement: [
      {
        step: "Refining Samples",
        description: "Refine samples for structural stability and atomically flat surface preparation.",
        objectTypes: [
          "Substrate",
          "Composition Test",
          "Thickness Image",
          "Sputter Chamber",
          "Nanoindentation",
          "Topography",
          "TEM image",
        ],
      },
      {
        step: "Compositional and Structural Defects Analysis",
        description: "Study atomic arrangements using Atom Probe Tomography (APT) and STM.",
        objectTypes: [
          "APT",
          "Computational Composition Atom",
          "Topography",
          "Thickness Excel",
        ],
      },
    ],
    surfaceModification: [
      {
        step: "Electrochemical Dealloying & Underpotential Deposition (UPD)",
        description: "Modify the surface using UPD and dealloying to enhance catalytic performance.",
        objectTypes: [
          "Electrochemical data",
          "CV Measurement (xlsx, csv, txt)",
          "Open Circuit Potential (csv, txt, dat)",
          "PEIS (xlsx, csv, txt)",
        ],
      },
      {
        step: "Testing and Characterization",
        description: "Evaluate electrocatalytic activity with cyclic voltammetry and other techniques.",
        objectTypes: [
          "CV Measurement (nox)",
          "PEIS (xlsx, csv, txt)",
          "DACV Raw (csv)",
          "DACA Raw (csv)",
          "Open Circuit Potential (csv, txt, dat)",
        ],
      },
    ],
    microscopyAnalysis: [
      {
        step: "Surface and Structural Analysis",
        description: "Conduct advanced surface analysis using SEM, AFM, and XRD techniques.",
        objectTypes: [
          "SEM (image)",
          "EELS data",
          "XRD Integ. Raw ZIP (xy)",
          "SECCM Long-range Processed (csv)",
          "SECCM Long-range Raw (zip)",
          "EDX Raw (txt, ipj)",
        ],
      },
    ],
    simulationFeedback: [
      {
        step: "High-Throughput Simulations",
        description: "Use DFT and ACE models for atomic configuration simulations and process optimization.",
        objectTypes: [
          "Simulation Database",
          "Python Script (py, zip)",
          "Calculation/Computational Composition",
          "Computational Composition Sample",
        ],
      },
      {
        step: "Refining Processes Based on Results",
        description: "Refine the preparation and surface modification based on simulation and experimental results.",
        objectTypes: [
          "All relevant data from previous steps",
          "Stress Measurement (DHM)",
          "Simulation Database",
        ],
      },
    ],
  };

  const renderObjectsForStage = (stage, step) => {
    const mainObjectInStage =
      workflowData?.['Main Object']?.['Workflow Stage'] === stage &&
      workflowData?.['Main Object']?.['Workflow Step'] === step;

    const associatedObjectsInStage =
      workflowData?.['Associated Objects']?.filter(
        obj => obj.stage === stage && obj.step === step
      ) || [];

    const reverseAssociatedObjectsInStage =
      workflowData?.['Reverse Associated Objects']?.filter(
        obj => obj.stage === stage && obj.step === step
      ) || [];

    // Only render objects if there are any present
    if (!mainObjectInStage && associatedObjectsInStage.length === 0 && reverseAssociatedObjectsInStage.length === 0) {
      return null;
    }

    return (
      <div className="mt-4">
        {mainObjectInStage && (
          <div>
            <h5 className="font-semibold mb-2">Main Object in {stage} - {step}:</h5>
            <div className="bg-green-100 text-green-600 px-3 py-1 rounded-full shadow">
              {workflowData['Object Name']} ({workflowData['Main Object']['Type']['TypeName']})
            </div>
          </div>
        )}

        {associatedObjectsInStage.length > 0 && (
          <div className="mt-4">
            <h5 className="font-semibold mb-2">Associated Objects in {stage} - {step}:</h5>
            <div className="flex flex-wrap gap-2">
              {associatedObjectsInStage.map((obj, index) => (
                <span key={index} className="bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full shadow">
                  {obj.object.linkedobjectid__objectname} ({obj.object.linkedobjectid__typeid__typename})
                </span>
              ))}
            </div>
          </div>
        )}

        {reverseAssociatedObjectsInStage.length > 0 && (
          <div className="mt-4">
            <h5 className="font-semibold mb-2">Reverse Associated Objects in {stage} - {step}:</h5>
            <div className="flex flex-wrap gap-2">
              {reverseAssociatedObjectsInStage.map((obj, index) => (
                <span key={index} className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full shadow">
                  {obj.object.objectid__objectname} ({obj.object.objectid__typeid__typename})
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-10 bg-gray-100 min-h-screen">
      <h1 className="text-5xl font-extrabold mb-12 text-gray-800 text-center">Object Workflow Overview</h1>

      <div id="workflow-categories" className="mb-10">
        {/* Initial Selection */}
        <div className="mb-6">
          <h4 className="text-xl font-medium text-gray-800 mb-2">Initial Selection and Simulation</h4>
          <ul className="space-y-2">
            {workflowSteps?.initialSelection?.map((item, index) => (
              <li key={index} className="bg-white shadow-md rounded-lg p-4 hover:bg-blue-100 hover:shadow-lg">
                <h5 className="text-blue-600 font-semibold">{item.step}</h5>
                <p className="text-gray-600">{item.description}</p>
                <p className="text-gray-800 font-medium">Object Types: {item.objectTypes.join(', ')}</p>
              </li>
            ))}
          </ul>
          {renderObjectsForStage('Initial Selection', 'Selecting Promising Compositional Complex Solid Solutions (CCSS)')}
          {renderObjectsForStage('Initial Selection', 'Composition Analysis')}
        </div>

        {/* Refinement and Surface Preparation */}
        <div className="mb-6">
          <h4 className="text-xl font-medium text-gray-800 mb-2">Refinement and Surface Preparation</h4>
          <ul className="space-y-2">
            {workflowSteps?.refinement?.map((item, index) => (
              <li key={index} className="bg-white shadow-md rounded-lg p-4 hover:bg-yellow-100 hover:shadow-lg">
                <h5 className="text-yellow-600 font-semibold">{item.step}</h5>
                <p className="text-gray-600">{item.description}</p>
                <p className="text-gray-800 font-medium">Object Types: {item.objectTypes.join(', ')}</p>
              </li>
            ))}
          </ul>
          {renderObjectsForStage('Refinement and Surface Preparation', 'Refining Samples')}
          {renderObjectsForStage('Refinement and Surface Preparation', 'Compositional and Structural Defects Analysis')}
        </div>

        {/* Surface Modification and Electrochemical Testing */}
        <div className="mb-6">
          <h4 className="text-xl font-medium text-gray-800 mb-2">Surface Modification and Electrochemical Testing</h4>
          <ul className="space-y-2">
            {workflowSteps?.surfaceModification?.map((item, index) => (
              <li key={index} className="bg-white shadow-md rounded-lg p-4 hover:bg-red-100 hover:shadow-lg">
                <h5 className="text-red-600 font-semibold">{item.step}</h5>
                <p className="text-gray-600">{item.description}</p>
                <p className="text-gray-800 font-medium">Object Types: {item.objectTypes.join(', ')}</p>
              </li>
            ))}
          </ul>
          {renderObjectsForStage('Surface Modification and Electrochemical Testing', 'Electrochemical Dealloying & Underpotential Deposition (UPD)')}
          {renderObjectsForStage('Surface Modification and Electrochemical Testing', 'Testing and Characterization')}
        </div>

        {/* Microscopy */}
        <div className="mb-6">
          <h4 className="text-xl font-medium text-gray-800 mb-2">Microscopy, Spectroscopy, and Advanced Analysis</h4>
          <ul className="space-y-2">
            {workflowSteps?.microscopyAnalysis?.map((item, index) => (
              <li key={index} className="bg-white shadow-md rounded-lg p-4 hover:bg-purple-100 hover:shadow-lg">
                <h5 className="text-purple-600 font-semibold">{item.step}</h5>
                <p className="text-gray-600">{item.description}</p>
                <p className="text-gray-800 font-medium">Object Types: {item.objectTypes.join(', ')}</p>
              </li>
            ))}
          </ul>
          {renderObjectsForStage('Microscopy, Spectroscopy, and Advanced Analysis', 'Surface and Structural Analysis')}
        </div>

        {/* Simulation */}
        <div className="mb-6">
          <h4 className="text-xl font-medium text-gray-800 mb-2">Simulation, Modelling, and Feedback Loops</h4>
          <ul className="space-y-2">
            {workflowSteps?.simulationFeedback?.map((item, index) => (
              <li key={index} className="bg-white shadow-md rounded-lg p-4 hover:bg-teal-100 hover:shadow-lg">
                <h5 className="text-teal-600 font-semibold">{item.step}</h5>
                <p className="text-gray-600">{item.description}</p>
                <p className="text-gray-800 font-medium">Object Types: {item.objectTypes.join(', ')}</p>
              </li>
            ))}
          </ul>
          {renderObjectsForStage('Simulation, Modelling, and Feedback Loops', 'High-Throughput Simulations')}
          {renderObjectsForStage('Simulation, Modelling, and Feedback Loops', 'Refining Processes Based on Results')}
        </div>
      </div>
    </div>
  );
};

export default WorkflowTable;

