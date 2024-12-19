import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './SampleTable.css';
import config from '../../config_path';
const SampleTable = () => {
    const [tableData, setTableData] = useState([]);
    const [pageNumber, setPageNumber] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedObjectIdsPerRow, setSelectedObjectIdsPerRow] = useState({});

    useEffect(() => {
        fetch(`${config.BASE_URL}api/get_sample_associated_data/?page=${pageNumber}`)
            .then((response) => response.json())
            .then((data) => {
                setTableData(data.data);
                setTotalPages(data.total_pages);
            })
            .catch((error) => console.error('Error fetching data:', error));
    }, [pageNumber]);

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= totalPages) {
            setPageNumber(newPage);
        }
    };

    const handleCheckboxChange = (objectids, isChecked, sampleId) => {
        setSelectedObjectIdsPerRow((prevSelected) => {
            const updatedSelection = { ...prevSelected };
            if (!updatedSelection[sampleId]) {
                updatedSelection[sampleId] = [];
            }
            const idsToAdd = Array.isArray(objectids) ? objectids : [objectids];

            if (isChecked) {
                updatedSelection[sampleId] = [...new Set([...updatedSelection[sampleId], ...idsToAdd])];
            } else {
                updatedSelection[sampleId] = updatedSelection[sampleId].filter(id => !idsToAdd.includes(id));
            }

            return updatedSelection;
        });
    };

    const handleRowDownload = (sampleId) => {
        const selectedIds = selectedObjectIdsPerRow[sampleId] || [];
        if (selectedIds.length === 0) {
            alert("No objects selected for download in this row");
            return;
        }

        console.log("Selected object IDs for download:", selectedIds);

        fetch(`${config.BASE_URL}api/download_multiple_datasets/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                objectids: selectedIds
            })
        })
        .then(response => {
            const contentType = response.headers.get('Content-Type');
            if (contentType === 'application/zip') {
                return response.blob();
            } else {
                return response.json();
            }
        })
        .then(result => {
            if (result instanceof Blob) {
                const url = window.URL.createObjectURL(result);
                const a = document.createElement('a');
                a.href = url;
                a.download = `selected_datasets.zip`;
                document.body.appendChild(a);
                a.click();
                a.remove();
            } else if (result.message) {
                alert(result.message);
            }
        })
        .catch(error => console.error("Error downloading the dataset:", error));
    };

    const renderPagination = () => {
        const pageNumbers = [];

        if (pageNumber > 3) {
            pageNumbers.push(1, 2, '...');
        }

        for (let i = Math.max(1, pageNumber - 2); i <= Math.min(totalPages, pageNumber + 2); i++) {
            pageNumbers.push(i);
        }

        if (pageNumber < totalPages - 2) {
            pageNumbers.push('...', totalPages - 1, totalPages);
        }

        return pageNumbers.map((page, index) => {
            if (page === '...') {
                return (
                    <span key={index} className="pagination-ellipsis">
                        ...
                    </span>
                );
            }
            return (
                <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`pagination-button ${page === pageNumber ? 'active' : ''}`}
                >
                    {page}
                </button>
            );
        });
    };

    return (
        <div className="table-container">
            <h1 className="page-title">Sample progress table</h1>
            <table>
            <thead>
            <tr>
                <th className="sample-column-header" rowSpan={2}>Object ID</th>
                <th className="name-column-header" rowSpan={2}>Name</th> 
                <th className="initial-selection-header" colSpan={13}>Initial Selection</th>
                <th className="refinement-header" colSpan={10}>Refinement</th>
                <th className="surface-modification-header" colSpan={6}>Surface Modification</th>
                <th className="microscopy-analysis-header" colSpan={6}>Microscopy Analysis</th>
                <th className="simulation-feedback-header" colSpan={2}>Simulation Feedback</th>
                <th rowSpan={2}>Download</th> {/* Move the download header to rowSpan=2 to appear only once */}
            </tr>
            <tr>
                {["Compositional solutions", "Simulation Database", "Bandgap Reference Spectra (csv)", "Stress Measurement (DHM)", "Synthesis", "EDX CSV", "XPS", "Raman (txt)", "Electrochemical data (csv, txt)", "Magnetic properties", "EDX Image", "Composition", "EDX Raw (txt)"].map((col, i) => (
                <th key={`initial_selection_${i}`}>{col}</th>
                ))}
                {["Substrate", "Composition Test", "Thickness Image", "Sputter Chamber", "Nanoindentation", "Topography", "TEM image", "APT", "Computational Composition Atom", "Thickness Excel"].map((col, i) => (
                <th key={`refinement_${i}`}>{col}</th>
                ))}
                {["Electrochemical data (csv, txt)", "CV Measurement (xlsx, csv, txt)", "Open Circuit Potential (csv, txt, dat)", "PEIS (xlsx, csv, txt)", "CV Measurement (nox)", "DACV Raw (csv)"].map((col, i) => (
                <th key={`surface_modification_${i}`}>{col}</th>
                ))}
                {["SEM (image)", "EELS data", "XRD Integ. Raw ZIP (xy)", "SECCM Long-range Processed (csv)", "SECCM Long-range Raw (zip)", "EDX Raw (txt, ipj)"].map((col, i) => (
                <th key={`microscopy_analysis_${i}`}>{col}</th>
                ))}
                {["Stress Measurement (DHM)", "Simulation Database"].map((col, i) => (
                <th key={`simulation_feedback_${i}`}>{col}</th>
                ))}
            </tr>
            </thead>
                <tbody>
                    {tableData.map((row, index) => (
                        <tr key={index}>
                            <td className="sample-column-header">
                                <h3>
                                    <Link to={`/object/${row.sample_objectid}`} className="table-link">
                                        {row.sampleid}
                                    </Link>
                                </h3>
                            </td>
                            <td>{row.sample_objectname}</td> {/* Display the sample name */}
                            {['initial_selection', 'refinement', 'surface_modification', 'microscopy_analysis', 'simulation_feedback'].map((category) =>
                                row[category].map((entry, colIndex) => (
                                    <td key={`${category}_${colIndex}`}>
                                        {entry.value ? (
                                            <>
                                                <span className="green-checkmark">✔️</span>
                                                <input
                                                    type="checkbox"
                                                    onChange={(e) => handleCheckboxChange(entry.objectids, e.target.checked, row.sampleid)}
                                                />
                                            </>
                                        ) : (
                                            '❌'
                                        )}
                                    </td>
                                ))
                            )}
                            <td>
                                {selectedObjectIdsPerRow[row.sampleid] && selectedObjectIdsPerRow[row.sampleid].length > 0 && (
                                    <button onClick={() => handleRowDownload(row.sampleid)} className="download-button">
                                        Download
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="pagination">
                <button
                    onClick={() => handlePageChange(pageNumber - 1)}
                    disabled={pageNumber === 1}
                    className="pagination-button"
                >
                    Previous
                </button>
                {renderPagination()}
                <button
                    onClick={() => handlePageChange(pageNumber + 1)}
                    disabled={pageNumber === totalPages}
                    className="pagination-button"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default SampleTable;








