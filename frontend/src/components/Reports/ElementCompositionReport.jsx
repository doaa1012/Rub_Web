import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import './ElementCompositionReport.css'; // Import the CSS file
import config from '../../config_path';
function ElementCompositionReport() {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${config.BASE_URL}api/element-composition/`)
      .then((response) => response.json())
      .then((data) => {
        // Process data for Chart.js
        const labels = data.map(item => item.element);
        const counts = data.map(item => item.count);

        // Generate random colors for each bar
        const backgroundColors = labels.map(() => {
          const randomColor = `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.6)`;
          return randomColor;
        });

        setChartData({
          labels: labels,
          datasets: [
            {
              label: 'Number of Compositions per Element',
              data: counts,
              backgroundColor: backgroundColors, // Assign dynamic colors
              borderColor: backgroundColors.map(color => color.replace('0.6', '1')),
              borderWidth: 1,
            },
          ],
        });

        setLoading(false);
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Element Reports</h1>
      </header>
      <div className="chart-container">
        <h2 className="chart-title">Element Composition Report</h2>
        <div className="chart">
          {chartData && <Bar data={chartData} />}
        </div>
      </div>
    </div>
  );
}

export default ElementCompositionReport;

