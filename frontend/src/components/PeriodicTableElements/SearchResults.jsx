import React from 'react';
import { Link } from 'react-router-dom';
import './PeriodicTable.css'; 
import config from '../../config_path';
// Component to render Search Results Table
export const SearchResultsTable = ({ results }) => {
  return (
    <div className="table-container">
      <h2 className="text-2xl font-bold mb-6 text-gray-700">Search Results</h2>
      {results.length > 0 ? (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Type</th>
              <th>Name / Description</th>
              <th>Created</th>
              <th>Created By</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, index) => (
              <tr key={index}>
                <td>
                  <Link to={`/object/${result.objectid}`} className="table-link">
                    {result.objectid}
                  </Link>
                </td>
                <td>{result.typeid__typename}</td>
                <td>{result.objectname}</td>
                <td>{new Date(result.field_created).toLocaleDateString()}</td>
                <td>{result.field_createdby__username}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="no-results-text">No results found.</p>
      )}
    </div>
  );
};

// Component to render Dataset Results Table with Download Functionality
export const SearchResultsDataset = ({ results }) => {
  // Async function to handle the dataset download
  const downloadDataset = async (objectId) => {
    try {
      console.log(`Starting download for dataset with ID: ${objectId}`);
      const response = await fetch(`${config.BASE_URL}api/download_dataset/${objectId}/`);
      
      // If the response is not OK, throw an error
      if (!response.ok) {
        throw new Error(`Failed to download dataset for ID: ${objectId}, Status: ${response.status}`);
      }

      // Convert the response to a Blob object
      const blob = await response.blob();

      // Create a download link for the Blob
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dataset_${objectId}.zip`;  // Provide the download name
      document.body.appendChild(a);
      a.click();
      a.remove();  // Clean up after the download

      // Revoke the Blob URL after the download is complete
      window.URL.revokeObjectURL(url);

      console.log(`Dataset downloaded successfully for ID: ${objectId}`);
    } catch (error) {
      console.error('Error downloading dataset:', error);
    }
  };

  return (
    <div className="table-container">
      <h2 className="text-2xl font-bold mb-6 text-gray-700">Dataset Results</h2>
      {results.length > 0 ? (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Type</th>
              <th>Name</th>
              <th>Created</th>
              <th>Created By</th>
              <th>Download Dataset</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, index) => (
              <tr key={index}>
                <td>
                  <Link to={`/object/${result.objectid}`} className="table-link">
                    {result.objectid}
                  </Link>
                </td>
                <td>{result.typeid__typename}</td>
                <td>{result.objectname}</td>
                <td>{new Date(result.field_created).toLocaleDateString()}</td>
                <td>{result.field_createdby__username}</td>
                <td>
                  {result.has_files ? (
                    <button
                      onClick={() => downloadDataset(result.objectid)}
                      className="download-btn"
                    >
                      Download
                    </button>
                  ) : (
                    <span className="no-file">No File</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="no-results-text">No datasets found.</p>
      )}
    </div>
  );
};



