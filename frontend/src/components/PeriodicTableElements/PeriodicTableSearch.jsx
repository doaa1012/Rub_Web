import React, { useState, useEffect } from 'react';
import { PeriodicTable } from './PeriodicTable';
import { SearchPanel } from './SearchPanel';
import { SearchResultsTable, SearchResultsDataset } from './SearchResults';
import config from '../../config_path';
const PeriodicTableSearch = () => {
  const [selectedElements, setSelectedElements] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [resultFormat, setResultFormat] = useState('table'); // Default format is table
  const [selectedObjectId, setSelectedObjectId] = useState(''); // Initialize as empty string
  const [selectedMeasurements, setSelectedMeasurements] = useState([]);
  const [elementPercentages, setElementPercentages] = useState({}); // Add state for percentages
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const resultsPerPage = 20;

  // Handle Element Selection
  const handleElementSelect = (elements) => {
    setSelectedElements(elements);
  };

  // Clear Selected Elements
  const clearElements = () => {
    setSelectedElements([]);
    setElementPercentages({});
  };

  // Handle Object ID Selection from Search Panel
  const handleObjectSelect = (objectId) => {
    setSelectedObjectId(objectId);
  };

  // Handle Search Function, triggered on form submission or pagination
// Handle Search Function, triggered on form submission or pagination
const handleSearch = async (searchParams) => {
  const { objectType, searchPhrase, createdBy, startDate, endDate } = searchParams;

  // Debugging logs for filter conditions
  console.log('Selected Elements:', selectedElements);
  console.log('Object Type:', objectType);
  console.log('Search Phrase:', searchPhrase);
  console.log('Created By:', createdBy);
  console.log('Start Date:', startDate);
  console.log('End Date:', endDate);
  console.log('Selected Measurements:', selectedMeasurements);
  console.log('Selected Object ID:', selectedObjectId);
  console.log('Element Percentages:', elementPercentages);

  // Check if any filters are applied
  const hasFilters =
    selectedElements.length > 0 ||
    objectType ||
    searchPhrase ||
    createdBy ||
    (startDate && endDate) ||
    selectedMeasurements.length > 0 ||
    (selectedObjectId && !isNaN(parseInt(selectedObjectId, 10))) || // Ensure ObjectId is valid
    Object.keys(elementPercentages).length > 0;

  if (!hasFilters) {
    console.log('No search filters applied, not sending request');
    return;
  }

  const endpoint = resultFormat === 'dataset'
    ? `${config.BASE_URL}api/search-dataset/`
    : `${config.BASE_URL}api/search-table/`;

  try {
    // Construct the request payload with all possible filters
    const requestData = {
      elements: selectedElements.length > 0 ? selectedElements : null,
      object_type: objectType || '',
      search_phrase: searchPhrase || '',
      created_by: createdBy || '',
      start_date: startDate || '',
      end_date: endDate || '',
      selectedMeasurements: selectedMeasurements.length > 0 ? selectedMeasurements : [],
      object_id: selectedObjectId !== '' ? parseInt(selectedObjectId, 10) : null,  // Ensure ID is parsed correctly
      elementPercentages: elementPercentages || null,  // Include elementPercentages
      page: currentPage,
      page_size: resultsPerPage,
    };

    console.log('Sending request with data:', requestData);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${await response.text()}`);
    }

    const data = await response.json();
    setSearchResults(data.results);
    setTotalPages(data.total_pages);
  } catch (error) {
    console.error('Error fetching search results:', error);
  }
};


  // Handle Pagination Controls
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Trigger search when the user manually submits the form
  const handleFormSubmit = (searchParams) => {
    // Reset to page 1 whenever a new search is triggered
    setCurrentPage(1);
    handleSearch(searchParams);
  };

  // Re-run Search on Pagination Change
  useEffect(() => {
    if (currentPage > 1 || totalPages > 1) {
      handleSearch({
        objectType: '', 
        searchPhrase: '', 
        createdBy: '', 
        startDate: '', 
        endDate: '',
      });
    }
  }, [currentPage]);

  return (
    <div className="p-4">
      <PeriodicTable 
        onElementSelect={handleElementSelect} 
        selectedElements={selectedElements} 
      />
      <SearchPanel 
        selectedElements={selectedElements} 
        clearElements={clearElements} 
        onSearch={handleFormSubmit} // Trigger search on form submission
        resultFormat={resultFormat}
        setResultFormat={setResultFormat} 
        setSelectedMeasurements={setSelectedMeasurements}
        handleObjectSelect={handleObjectSelect}  // Pass Object Select handler to SearchPanel
        setElementPercentages={setElementPercentages} // Pass percentages handler to SearchPanel
      />
      {resultFormat === 'table' ? (
        <div>
          <SearchResultsTable results={searchResults} />
          {/* Pagination Controls */}
          <div className="pagination-controls">
            <nav aria-label="Page navigation">
              <ul className="pagination">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={handlePrevPage} disabled={currentPage === 1}>
                    &laquo; Previous
                  </button>
                </li>
                <li className="page-item active">
                  <span className="page-link">
                    {currentPage} of {totalPages}
                  </span>
                </li>
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={handleNextPage} disabled={currentPage === totalPages}>
                    Next &raquo;
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      ) : (
        <div>
          <SearchResultsDataset results={searchResults} />
          {/* Pagination Controls for Dataset */}
          <div className="pagination-controls">
            <nav aria-label="Page navigation">
              <ul className="pagination">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={handlePrevPage} disabled={currentPage === 1}>
                    &laquo; Previous
                  </button>
                </li>
                <li className="page-item active">
                  <span className="page-link">
                    {currentPage} of {totalPages}
                  </span>
                </li>
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={handleNextPage} disabled={currentPage === totalPages}>
                    Next &raquo;
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
};

export default PeriodicTableSearch;
