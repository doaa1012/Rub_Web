import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './ElementCompositionReport.css';
import config from '../../config_path';
// List of object types
const objectTypes = [
  "APT", "Bandgap", "Bandgap Reference Spectra (csv)", "Bandgap Sample Spectra (csv)",
  "Bandgap Tauc Plots (csv)",
  "SC-XRD Measurement (cif)",
  "Sample",
  "SDC Processed (csv)",
  "SDC Raw (zip) DUE",
  "SDC Raw (zip) RUB",
  "SECCM (csv)",
  "SECCM Long-range Processed (csv)",
  "SECCM Long-range Raw (zip)",
  "SECCM/EBSD correlation (xlsx)",
  "SEM (image)",
  "Stress Measurement (DHM)",
  "Hardness modulus",
  "LSV (xlsx, csv, txt)",
  "NMR Measurement (zip)",
  "Open Circuit Potential (csv, txt, dat)",
  "PEIS (xlsx, csv, txt)",
  "Electrochemical data (csv, txt)",
  "Bandgap Reference Spectra (csv)",
  "Bandgap Sample Spectra (csv)",
  "Bandgap Tauc Plots (csv)",
  "CV Measurement (nox)",
  "CV Measurement (xlsx, csv, txt)",
  "DSC Measurement (txt)",
  "EDX CSV",
  "HTTS Resistance CSV",
  "Insitu IR Measurement (CIR)",
  "IR Measurement (dpt)",
  "HTTS Resistance Image",
  "HTTS Resistance TXT",
  "EDX Image",
  "EDX Raw (ip)",
  "EDX Raw (txt)",
  "EDX Raw Other",
  "Topography / AFM", "XPS", "XRD Bg. subtr. integ. Raw ZIP (xy)", "XRD CSV (342 columns)", 
  "XRD Image", "XRD Integ. Raw ZIP (raw)", "XRD Raw ZIP (gfrm)"
];

// Function to generate random colors for the datasets
const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const MeasurementLineChart = () => {
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); 
  const [plotType, setPlotType] = useState('monthly'); 
  const [startDate, setStartDate] = useState(null); 
  const [endDate, setEndDate] = useState(null); 
  const [isSelectAll, setIsSelectAll] = useState(true);

  // Handle selection of object types
  const handleSelectChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setSelectedTypes((prev) => [...prev, value]);
    } else {
      const updatedTypes = selectedTypes.filter((type) => type !== value);
      setSelectedTypes(updatedTypes);
      // Clear chart if no types are selected
      if (updatedTypes.length === 0) {
        setChartData(null);
      }
    }
  };

  // Toggle Select/Deselect All functionality
  const handleToggleSelectAll = () => {
    if (isSelectAll) {
      setSelectedTypes([...objectTypes]); // Select all
    } else {
      setSelectedTypes([]); // Deselect all
      setChartData(null); // Clear chart when deselecting all
    }
    setIsSelectAll(!isSelectAll);
  };

  const handlePlotTypeChange = (e) => {
    setPlotType(e.target.value);
  };

  const clearDateSelection = () => {
    setStartDate(null);
    setEndDate(null);
  };

  const fetchDataAndPlot = () => {
    if (selectedTypes.length === 0) {
      alert('Please select at least one object type.');
      return;
    }

    const params = new URLSearchParams();
    selectedTypes.forEach((type) => {
      params.append('typename', type); 
    });

    if (startDate && endDate) {
      params.append('start_date', startDate.toISOString().split('T')[0]); 
      params.append('end_date', endDate.toISOString().split('T')[0]);
    }

    axios
      .get(`${config.BASE_URL}api/monthly-object-increase/`, { params })
      .then((response) => {
        const data = response.data;

        if (typeof data !== 'object' || !Object.keys(data).length) {
          console.error('Error: Expected an object with keys, but got:', data);
          return;
        }

        const filteredData = {};
        const startTime = startDate ? new Date(startDate).getTime() : null;
        const endTime = endDate ? new Date(endDate).getTime() : null;

        Object.keys(data).forEach((typename) => {
          const typeData = data[typename].filter((entry) => {
            const entryDate = new Date(entry.month).getTime();
            if (startTime && endTime) {
              return entryDate >= startTime && entryDate <= endTime;
            }
            return true;
          });

          if (typeData.length > 0) {
            filteredData[typename] = typeData;
          }
        });

        const datasets = Object.keys(filteredData).map((typename) => {
          const typeData = filteredData[typename]; 

          const labels = typeData.map((entry) =>
            new Date(entry.month).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
          );

          let counts = typeData.map((entry) => entry.count);

          if (plotType === 'cumulative') {
            counts = counts.reduce((acc, count, index) => {
              if (index === 0) {
                acc.push(count);
              } else {
                acc.push(count + acc[index - 1]);
              }
              return acc;
            }, []);
          }

          return {
            label: typename,  
            data: counts,
            borderColor: getRandomColor(),
            backgroundColor: 'rgba(0, 0, 0, 0)', 
            fill: false,
            tension: 0.1,
          };
        });

        setChartData({
          labels: filteredData[Object.keys(filteredData)[0]].map((entry) =>
            new Date(entry.month).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
          ),
          datasets: datasets,
        });
      })
      .catch((error) => {
        console.error('Error fetching chart data:', error.response ? error.response.data : error.message);
      });
  };

  return (
    <div>
      <div style={{ textAlign: 'center', padding: '30px' }}>
        <header className="page-header">
          <h1>Measurement Object Type Analysis</h1>
        </header>
      </div>

      <div style={{ display: 'flex', height: '100vh' }}>
        <div
          style={{
            width: isSidebarOpen ? '250px' : '50px',
            transition: 'width 0.3s ease',
            borderRight: '1px solid #ccc',
            padding: isSidebarOpen ? '20px' : '5px',
            overflowY: 'auto',
            overflowX: 'hidden',
            backgroundColor: '#f0f0f0',
            height: '100%',
          }}
        >
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            style={{
              width: '100%',
              backgroundColor: '#007BFF',
              color: 'white',
              padding: '10px',
              borderRadius: '5px',
              marginBottom: '10px',
              cursor: 'pointer',
            }}
          >
            {isSidebarOpen ? 'Hide' : 'Show'} Filters
          </button>
          {isSidebarOpen && (
            <div>
              <h3>Select Object Types:</h3>
              <button
                onClick={handleToggleSelectAll}
                style={{
                  width: '100%',
                  backgroundColor: isSelectAll ? '#28a745' : '#dc3545',
                  color: 'white',
                  padding: '10px',
                  borderRadius: '5px',
                  marginBottom: '10px',
                  cursor: 'pointer',
                }}
              >
                {isSelectAll ? 'Select All' : 'Deselect All'}
              </button>
              {objectTypes.map((type) => (
                <label key={type} style={{ display: 'block', marginBottom: '10px' }}>
                  <input
                    type="checkbox"
                    value={type}
                    onChange={handleSelectChange}
                    checked={selectedTypes.includes(type)} 
                  />{' '}
                  {type}
                </label>
              ))}

            <div style={{ padding: '20px 0', borderTop: '1px solid #ccc', marginBottom: '20px' }}>
              <h3>Select Plot Type:</h3>
              <label>
                <input
                  type="radio"
                  value="monthly"
                  checked={plotType === 'monthly'}
                  onChange={handlePlotTypeChange}
                />{' '}
                Monthly
              </label>
              <br />
              <label>
                <input
                  type="radio"
                  value="cumulative"
                  checked={plotType === 'cumulative'}
                  onChange={handlePlotTypeChange}
                />{' '}
                Cumulative
              </label>
            </div>

              <div style={{ padding: '20px 0', borderBottom: '1px solid #ccc' }}>
                <h3>Select Date Range (Optional):</h3>
                <div style={{ marginBottom: '10px' }}>
                  <label>Start Date:</label>
                  <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    dateFormat="yyyy-MM-dd"
                  />
                </div>
                <div>
                  <label>End Date:</label>
                  <DatePicker
                    selected={endDate}
                    onChange={(date) => setEndDate(date)}
                    dateFormat="yyyy-MM-dd"
                  />
                </div>
                <button
                  onClick={clearDateSelection}
                  style={{
                    marginTop: '10px',
                    backgroundColor: '#ffc107',
                    color: 'black',
                    padding: '10px',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    width: '100%',
                  }}
                >
                  Clear Date Selection
                </button>
              </div>
            </div>
          )}
        </div>

        <div style={{ flex: 1, padding: '20px' }}>
          <button
            onClick={fetchDataAndPlot}
            style={{
              marginBottom: '20px',
              backgroundColor: '#007BFF',
              color: 'white',
              padding: '10px',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Plot
          </button>

          <div
            style={{
              width: '100%',
              height: '500px',
              position: 'relative',
            }}
          >
            {chartData ? (
              <Line
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: {
                      title: { display: true, text: 'Month' },
                    },
                    y: {
                      title: { display: true, text: 'Count' },
                      beginAtZero: true,
                    },
                  },
                }}
                width={1000}
                height={500}
              />
            ) : (
              <p>Select object types and click "Plot" to display the chart.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeasurementLineChart;