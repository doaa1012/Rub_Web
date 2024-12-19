import React from 'react';
import { useLocation } from 'react-router-dom';

const RenderWorkflowPage = () => {
  const location = useLocation();
  const { workflow, title } = location.state; // Access the workflow data passed

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Rendered Workflow: {title}</h1>

      {workflow.map((stage, index) => (
        <div key={index} className="bg-white p-4 mb-4 shadow-md rounded-lg">
          <h4 className="font-semibold mb-2">{stage.name}</h4>
          {stage.typenames.length > 0 && <p>Associated Typenames: {stage.typenames.join(', ')}</p>}

          {stage.steps.length > 0 && (
            <div>
              <h5 className="font-semibold">Steps:</h5>
              <ul>
                {stage.steps.map((step, stepIndex) => (
                  <li key={stepIndex}>
                    Step Name: {step.name} | Object Types: {step.typenames.join(', ')}
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

export default RenderWorkflowPage;
