import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../../../config_path';

const IdeasAndExperimentsMeasurement = ({ objectId }) => {
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [error, setError] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null); // State for tracking hovered row

  useEffect(() => {
    axios
      .get(`${config.BASE_URL}api/ideas_and_experiments_measurement/?objectId=${objectId}`)
      .then((response) => {
        setData(response.data.linked_samples);
        setHeaders(response.data.property_headers);
      })
      .catch((error) => {
        setError('Error fetching measurement data');
        console.error(error);
      });
  }, [objectId]);

  if (error) {
    return <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>;
  }

  const styles = {
    container: {
      backgroundColor: '#ffe7e5',
      padding: '1.5rem',
      borderRadius: '0.5rem',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    },
    heading: {
      fontSize: '1.75rem',
      fontWeight: 'bold',
      color: '#d32f2f',
      borderBottom: '4px solid #1565c0',
      marginBottom: '1.5rem',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      borderRadius: '0.5rem',
    },
    th: {
      backgroundColor: '#003366',
      color: '#ffffff',
      padding: '0.75rem',
      textAlign: 'left',
    },
    tr: (isHovered) => ({
      backgroundColor: isHovered ? '#e3f2fd' : '#ffffff',
      transition: 'background-color 0.3s ease',
    }),
    td: {
      padding: '0.75rem',
      color: '#333',
    },
    tdLink: {
      color: '#1565c0',
      fontWeight: 'bold',
      textDecoration: 'none',
    },
    tdLinkHover: {
      textDecoration: 'underline',
    },
    textGreen: {
      color: '#4caf50',
      fontWeight: 'bold',
    },
    textRed: {
      color: '#f44336',
      fontWeight: 'bold',
    },
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.heading}>Measurements Report</h3>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Sample ID</th>
            <th style={styles.th}>Object Name</th>
            <th style={styles.th}>N (Linked Samples)</th>
            <th style={styles.th}>System</th>
            <th style={styles.th}>Substrate Material</th>
            {headers.map((header) => (
              <th key={header} style={styles.th}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((sample, index) => (
            <tr
              key={sample.sample_id}
              style={styles.tr(hoveredRow === index)}
              onMouseEnter={() => setHoveredRow(index)}
              onMouseLeave={() => setHoveredRow(null)}
            >
              <td style={styles.td}>
                <a
                  href={`/object/${sample.sample_id}`}
                  style={styles.tdLink}
                >
                  {sample.sample_id}
                </a>
              </td>
              <td style={styles.td}>{sample.object_name}</td>
              <td style={styles.td}>{sample.linked_samples}</td>
              <td style={styles.td}>{sample.system}</td>
              <td style={styles.td}>{sample.substrate_material}</td>
              {headers.map((header) => (
                <td
                  key={header}
                  style={{
                    ...styles.td,
                    ...(sample[header] > 0 ? styles.textGreen : styles.textRed),
                  }}
                >
                  {sample[header] || 0}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default IdeasAndExperimentsMeasurement;
