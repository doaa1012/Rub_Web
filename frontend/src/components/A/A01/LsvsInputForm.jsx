import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';  // For plotting
import FileSaver from 'file-saver';  // For downloading files
import config from '../../../config_path';
function LsvsInputForm({ objectId }) {
  const [stPot, setStPot] = useState(0.21);
  const [offsetPot, setOffsetPot] = useState(0);
  const [ph, setPh] = useState(1);
  const [dCap, setDCap] = useState(1150);
  const [sweep, setSweep] = useState(7);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lsvsData, setLsvsData] = useState(null);
  const [selectedArea, setSelectedArea] = useState('');
  const [plotAllAreas, setPlotAllAreas] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${config.BASE_URL}api/load_lsvs/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          object_id: objectId,
          st_pot: stPot,
          offset_pot: offsetPot,
          ph: ph,
          d_cap: dCap,
          sweep: sweep,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to load LSV data. Status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setLsvsData(data.data);
        setSelectedArea(Object.keys(data.data)[0]);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(lsvsData)], { type: 'application/json' });
    FileSaver.saveAs(blob, 'lsvs_data.json');
  };

  const handleAreaChange = (e) => {
    setSelectedArea(e.target.value);
    setPlotAllAreas(false);
  };

  const handlePlotAllAreas = () => {
    setPlotAllAreas(true);
  };

  const handlePlotSelectedArea = () => {
    setPlotAllAreas(false);
  };

  const renderTable = () => {
    if (!lsvsData || !selectedArea) return null;
  
    const areaData = lsvsData[selectedArea];
    const potential = areaData["Potential"];
    const currentDensity = areaData["Current density [A/cm^2]"];
  
    if (!potential || !currentDensity || potential.length !== currentDensity.length) {
      return <p className="text-red-500">Invalid data for measurement area {selectedArea}</p>;
    }
  
    return (
      <div className="mt-6 p-4 border border-blue-300 rounded-lg shadow-md">
        <h3 className="text-lg font-bold mb-4">Measurement Area: {selectedArea}</h3>
        <table className="table-auto w-full text-left border-collapse">
          <thead>
            <tr className="bg-blue-100">
              <th className="border px-4 py-2 font-semibold text-blue-700">Potential (V)</th>
              <th className="border px-4 py-2 font-semibold text-blue-700">Current Density (A/cm^2)</th>
            </tr>
          </thead>
          <tbody>
            {potential.map((potValue, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-blue-100' : 'bg-blue hover:bg-blue-200'}>
                <td className="border px-4 py-2">{potValue.toFixed(2)}</td>
                <td className="border px-4 py-2">{currentDensity[index].toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  

  const renderPlot = () => {
    if (!lsvsData) return null;
  
    const datasets = [];
  
    // Plot all areas if selected
    if (plotAllAreas) {
      Object.keys(lsvsData).forEach((area) => {
        const areaData = lsvsData[area];
        const currentDensity = areaData["Current density [A/cm^2]"];
  
        datasets.push({
          label: `Area ${area}`,
          data: currentDensity,
          borderColor: getRandomColor(),
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          fill: false,
          pointRadius: 0, // Remove the dots for all areas
          pointHoverRadius: 0, // Also remove the dots on hover
        });
      });
    } else if (selectedArea) {
      const areaData = lsvsData[selectedArea];
      const currentDensity = areaData["Current density [A/cm^2]"];
  
      datasets.push({
        label: `Current Density vs Potential - Area ${selectedArea}`,
        data: currentDensity,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
        pointRadius: 3,  // Keep dots for the selected area
        pointHoverRadius: 5,  // Larger dots on hover for the selected area
      });
    }
  
    const data = {
      labels: lsvsData[selectedArea]?.["Potential"].map(pot => pot.toFixed(2)),
      datasets: datasets,
    };
  
    const options = {
      scales: {
        x: {
          title: {
            display: true,
            text: 'Potential (V)',
          },
        },
        y: {
          title: {
            display: true,
            text: 'Current Density (A/cm^2)',
          },
        },
      },
      plugins: {
        legend: {
          display: !plotAllAreas,  // Hide legend if plotting all areas
        },
      },
      elements: {
        line: {
          tension: 0.3,  // Smoother line curves
        },
      },
    };
  
    return <Line data={data} options={options} />;
  };
  
  

  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mt-6">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="block text-gray-700 font-bold mb-2">Standard Potential (V):</label>
          <input
            type="number"
            value={stPot}
            onChange={(e) => setStPot(parseFloat(e.target.value))}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 font-bold mb-2">Offset Potential (V):</label>
          <input
            type="number"
            value={offsetPot}
            onChange={(e) => setOffsetPot(parseFloat(e.target.value))}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 font-bold mb-2">pH:</label>
          <input
            type="number"
            value={ph}
            onChange={(e) => setPh(parseFloat(e.target.value))}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 font-bold mb-2">Capillary Diameter (nm):</label>
          <input
            type="number"
            value={dCap}
            onChange={(e) => setDCap(parseFloat(e.target.value))}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 font-bold mb-2">Sweep:</label>
          <input
            type="number"
            value={sweep}
            onChange={(e) => setSweep(parseInt(e.target.value))}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>
        <div className="col-span-1 md:col-span-2 lg:col-span-3">
          <button
            type="submit"
            className="bg-blue-500 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load LSVs'}
          </button>
        </div>
      </form>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {lsvsData && (
        <div className="mt-6">
          <button onClick={handleDownload} className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition duration-200">
            Download as JSON
          </button>

          <div className="mt-4">
            <label className="block text-gray-700 font-bold mb-2">Select Measurement Area:</label>
            <select
              value={selectedArea}
              onChange={handleAreaChange}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {Object.keys(lsvsData).map((area, index) => (
                <option key={index} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4 flex">
            <button
              onClick={handlePlotSelectedArea}
              className="bg-indigo-500 text-white py-2 px-4 rounded-md hover:bg-indigo-600 transition duration-200"
            >
              Plot Selected Area
            </button>
            <button
              onClick={handlePlotAllAreas}
              className="ml-4 bg-indigo-500 text-white py-2 px-4 rounded-md hover:bg-indigo-600 transition duration-200"
            >
              Plot All Areas
            </button>
          </div>

          {renderTable()}
          {renderPlot()}
        </div>
      )}
    </div>
  );
}

export default LsvsInputForm;
