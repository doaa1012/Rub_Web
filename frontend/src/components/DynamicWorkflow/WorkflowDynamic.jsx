import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom'; // Import Link and useParams from react-router-dom

const WorkflowDynamic = () => {
  const { id } = useParams(); // Extract the id from the URL
  const [tableData, setTableData] = useState({ columns: [], data: [] });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1); // State for page number
  const [totalPages, setTotalPages] = useState(1); // Total number of pages

  useEffect(() => {
    fetch(`http://localhost:8000/api/get_sample_associated_data_workflow/${id}/?page=${page}`) // Use the id in the URL and pagination
      .then((response) => response.json())
      .then((data) => {
        console.log('Fetched data:', data);
        setTableData(data);
        setTotalPages(data.total_pages); // Assume API returns the total pages
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  }, [id, page]); // Depend on id and page so that the fetch is called whenever the id or page changes

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1); // Go to previous page
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1); // Go to next page
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (tableData.columns.length === 0 || tableData.data.length === 0) {
    return <div>No data available</div>;
  }

  return (
    <div className="workflow-table p-6">
      <table className="min-w-full table-auto border-collapse border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th colSpan="2" className="p-4 border border-gray-300">Object Info</th> {/* Object ID and Name header */}
            {tableData.columns.map((stage, index) => (
              <React.Fragment key={index}>
                <th colSpan={stage.typenames.length} className="p-4 border border-gray-300 text-center font-bold bg-yellow-100">
                  {stage.stage_name}
                </th>
              </React.Fragment>
            ))}
          </tr>
          <tr className="bg-gray-50">
            <th className="p-4 border border-gray-300">Object ID</th>
            <th className="p-4 border border-gray-300">Name</th>
            {tableData.columns.map((stage, index) => (
              <React.Fragment key={index}>
                {stage.typenames.map((typename, i) => (
                  <th key={i} className="p-4 border border-gray-300">{typename}</th>
                ))}
              </React.Fragment>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableData.data.map((sample) => (
            <tr key={sample.objectid} className="hover:bg-gray-100">
              {/* Make Object ID a clickable link */}
              <td className="p-4 border border-gray-300">
                <Link to={`/object/${sample.objectid}`} className="text-blue-600 hover:underline">
                  {sample.objectid}
                </Link>
              </td>
              <td className="p-4 border border-gray-300">{sample.objectname}</td>

              {tableData.columns.map((stage, index) => (
                <React.Fragment key={index}>
                  {stage.typenames.map((typename, i) => (
                    <td key={i} className="p-4 border border-gray-300 text-center">
                      {sample.data[stage.stage_name][typename] || '✗'}
                    </td>
                  ))}
                </React.Fragment>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="pagination-controls mt-4 flex justify-between items-center">
        <button
          onClick={handlePrevPage}
          disabled={page === 1}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          onClick={handleNextPage}
          disabled={page === totalPages}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default WorkflowDynamic;
