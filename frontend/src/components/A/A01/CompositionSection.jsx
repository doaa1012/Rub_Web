import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import config from '../../../config_path';
// Function to fetch the rubric path based on the object ID
const fetchRubricPath = async (objectId) => {
  try {
    const response = await fetch(`${config.BASE_URL}api/object/${objectId}/rubricpath/`);  // Replace with your actual API endpoint
    const data = await response.json();
    return data.rubricpath || 'Unknown Path';  // Return the rubric path or fallback to 'Unknown Path'
  } catch (error) {
    console.error('Error fetching rubric path:', error);
    return 'Unknown Path';  // Fallback in case of an error
  }
};

function CompositionSection({ compositionObjects }) {
  const [rubricPathTitle, setRubricPathTitle] = useState('');  // Store the title from rubric path
  const [isCompositionOpen, setIsCompositionOpen] = useState(false);

  useEffect(() => {
    if (compositionObjects.length > 0) {
      // Fetch the rubric path from the first composition object
      const fetchAndSetRubricTitle = async () => {
        const rubricPath = await fetchRubricPath(compositionObjects[0]?.linkedobjectid__objectid);
        const parts = rubricPath.split('}');  // Split by '}'
        const lastPart = parts[parts.length - 1];  // Extract the last part of the path
        setRubricPathTitle(lastPart);  // Set this as the title
      };
      fetchAndSetRubricTitle();
    }
  }, [compositionObjects]);

  return (
    <>
      {compositionObjects.length > 0 && (
        <>
          <h2 
            className="measurement-title"  // Add a specific class to this title
            onClick={() => setIsCompositionOpen(!isCompositionOpen)}
            style={{ cursor: 'pointer' }}  // Change cursor to pointer
          >
            {rubricPathTitle || 'Composition Objects'} {/* Show rubric path title or fallback */}
            <span className="toggle-indicator">
              {isCompositionOpen ? ' − ' : ' + '} {/* Show + when collapsed, − when expanded */}
            </span>
          </h2>

          {isCompositionOpen && (
            <div className="associated-grid">
              {compositionObjects.map((obj, index) => (
                <div key={index} className="object-card">
                  <h3>
                    <Link to={`/object/${obj?.linkedobjectid__objectid}`}>{obj?.linkedobjectid__objectname || "Unknown Object"}</Link>
                  </h3>
                  <div><strong>Type:</strong> {obj?.linkedobjectid__typeid__typename || 'Unknown'}</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}

export default CompositionSection;

