import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto'; // Ensure chart.js is registered
import config from '../../config_path';
const SamplesPerElementChart = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch the data from the Django API
    fetch(`${config.BASE_URL}api/samples-per-element/`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        // Prepare data for the chart
        const formattedData = {
          labels: data.elementnames,
          datasets: [
            {
              label: 'Number of Samples',
              data: data.counts,
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
              barThickness: 20,  // Adjust the thickness of the bars
            },
          ],
        };
        setChartData(formattedData);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setError('Failed to fetch data');
        setLoading(false);
      });
  }, []);

  // Handle loading state
  if (loading) {
    return <p>Loading chart data...</p>;
  }

  // Handle error state
  if (error) {
    return <p>{error}</p>;
  }

  // Render the bar chart when chartData is available
  return (
    <div>
      <h2>Number of Samples per Element</h2>
      {chartData ? (
        <Bar
          data={chartData}
          options={{
            scales: {
              x: {
                title: {
                  display: true,
                  text: 'Elements',
                },
              },
              y: {
                title: {
                  display: true,
                  text: 'Number of Samples',
                },
                beginAtZero: true,  // Ensure Y-axis starts at 0
                ticks: {
                  stepSize: 100,  // Customize step size for better granularity
                },
              },
            },
            responsive: true,
            plugins: {
              legend: {
                display: false,
              },
            },
          }}
        />
      ) : (
        <p>No data to display</p>
      )}
    </div>
  );
};

export default SamplesPerElementChart;
