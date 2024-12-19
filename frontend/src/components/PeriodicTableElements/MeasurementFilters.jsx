import React, { useState } from 'react';

// Define categories and related measurements
const measurementGroups = {
  "SC-XRD Measurements": ["SC-XRD Measurement (cif)"],
  "SDC Measurements": ["SDC Processed (csv)", "SDC Raw (zip) DUE", "SDC Raw (zip) RUB"],
  "SECCM Measurements": [
    "SECCM (csv)",
    "SECCM Long-range Processed (csv)",
    "SECCM Long-range Raw (zip)",
    "SECCM/EBSD correlation (xlsx)"
  ],
  "SEM Measurements": ["SEM (image)"],
  "Stress and Hardness Measurements": ["Stress Measurement (DHM)", "Hardness modulus"],
  "LSV Measurements": ["LSV (xlsx, csv, txt)"],
  "NMR Measurements": ["NMR Measurement (zip)"],
  "Open Circuit Potential Measurements": ["Open Circuit Potential (csv, txt, dat)"],
  "PEIS Measurements": ["PEIS (xlsx, csv, txt)"],
  "Electrochemical Data": ["Electrochemical data (csv, txt)"],
  "Bandgap Measurements": [
    "Bandgap Reference Spectra (csv)",
    "Bandgap Sample Spectra (csv)",
    "Bandgap Tauc Plots (csv)"
  ],
  "CV Measurements": ["CV Measurement (nox)", "CV Measurement (xlsx, csv, txt)"],
  "DSC Measurements": ["DSC Measurement (txt)"],
  "EDX Measurements": [
    "EDX CSV",
    "EDX Image",
    "EDX Raw (ip)",
    "EDX Raw (txt)",
    "EDX Raw Other"
  ],
  "HTTS Resistance Measurements": [
    "HTTS Resistance CSV",
    "HTTS Resistance Image",
    "HTTS Resistance TXT"
  ],
  "Insitu IR Measurements": ["Insitu IR Measurement (CIR)"],
  "IR Measurements": ["IR Measurement (dpt)"],
};

const measurementToObjectTypeMap = Object.keys(measurementGroups).reduce((acc, category) => {
  measurementGroups[category].forEach(measurement => {
    acc[measurement] = measurement;  // Map to real object type names if needed
  });
  return acc;
}, {});

export const MeasurementFilters = ({ setSelectedMeasurements }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMeasurements, setLocalSelectedMeasurements] = useState([]);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [isFiltersCollapsed, setFiltersCollapsed] = useState(true);  // Collapsed by default
  const [isSelectedCollapsed, setSelectedCollapsed] = useState(false);  // Default for selected filters expanded

  // Toggle group expansion
  const toggleGroup = (groupName) => {
    setExpandedGroups({
      ...expandedGroups,
      [groupName]: !expandedGroups[groupName]
    });
  };

  // Filter the measurements based on the search term
  const filteredGroups = Object.keys(measurementGroups).reduce((acc, category) => {
    const filtered = measurementGroups[category].filter(measurement =>
      measurement.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[category] = filtered;
    }
    return acc;
  }, {});

  // Add a measurement to the selected list and update parent state
  const addMeasurement = (measurement) => {
    if (!selectedMeasurements.includes(measurement)) {
      const updatedMeasurements = [...selectedMeasurements, measurement];
      setLocalSelectedMeasurements(updatedMeasurements);
      setSelectedMeasurements(updatedMeasurements);  // Update parent state
      setSelectedCollapsed(false);  // Open the selected filters if it's collapsed
    }
  };

  // Remove a measurement from the selected list
  const removeMeasurement = (measurement) => {
    const updatedMeasurements = selectedMeasurements.filter(m => m !== measurement);
    setLocalSelectedMeasurements(updatedMeasurements);
    setSelectedMeasurements(updatedMeasurements);  // Update parent state
  };

  return (
    <div className="flex space-x-4">
      {/* Collapsible Measurement Filters Section */}
      <div className="w-1/2 border-r-2 pr-4 bg-blue-100 p-4 rounded-lg shadow-lg">
        <h3 className="font-bold mb-2 text-xl text-blue-900 cursor-pointer" onClick={() => setFiltersCollapsed(!isFiltersCollapsed)}>
          Measurement Filters {isFiltersCollapsed ? '+' : '-'}
        </h3>

        {!isFiltersCollapsed && (
          <>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search measurements..."
              className="p-2 mb-4 border border-gray-300 rounded w-full"
            />

            <div className="space-y-4">
              {Object.keys(filteredGroups).map((category) => (
                <div key={category}>
                  <h4
                    className="font-semibold cursor-pointer hover:text-blue-700 text-blue-900"
                    onClick={() => toggleGroup(category)}
                  >
                    {category} {expandedGroups[category] ? '-' : '+'}
                  </h4>

                  {expandedGroups[category] && (
                    <div className="pl-4 mt-2">
                      {filteredGroups[category].map((measurement) => (
                        <div key={measurement} className="flex justify-between items-center py-2">
                          <span className="text-gray-800">{measurement}</span>
                          <button
                            type="button"
                            className="ml-2 p-1 bg-green-500 hover:bg-green-600 text-white rounded shadow"
                            onClick={() => addMeasurement(measurement)}
                          >
                            Add
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Collapsible Selected Filters Section */}
      <div className="w-1/2 bg-yellow-100 p-4 rounded-lg shadow-lg">
        <h3 className="font-bold mb-2 text-xl text-yellow-900 cursor-pointer" onClick={() => setSelectedCollapsed(!isSelectedCollapsed)}>
          Selected Filters {isSelectedCollapsed ? '+' : '-'}
        </h3>

        {!isSelectedCollapsed && (
          <div className="space-y-4">
            {selectedMeasurements.length === 0 ? (
              <p className="text-gray-600">No filters selected</p>
            ) : (
              selectedMeasurements.map((measurement) => (
                <div key={measurement} className="border p-2 rounded-lg flex justify-between items-center bg-yellow-50 shadow">
                  <span className="text-gray-800">{measurement}</span>
                  <button
                    type="button"
                    className="ml-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded shadow"
                    onClick={() => removeMeasurement(measurement)}
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};