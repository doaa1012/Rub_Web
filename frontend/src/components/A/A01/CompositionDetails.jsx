import React from 'react';
import '../../css/CompositionDetails.css'; // Import the CSS file for styling

function CompositionDetails({ compositionData }) {
  return (
    <div className="composition-details">
      <h3>Composition Elements and Percentages</h3>
      <table className="composition-table">
        <thead>
          <tr>
            <th>Element</th>
            <th>Percentage (%)</th>
          </tr>
        </thead>
        <tbody>
          {compositionData.map((element, index) => (
            <tr key={index}>
              <td>{element.elementname}</td>
              <td>{(element.valuepercent).toFixed(3)}</td> {/* Format to 3 decimal places */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CompositionDetails;
