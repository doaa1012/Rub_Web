import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import config from '../../config_path';
const SynthesisRequestsTable = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    // Fetch data from the backend
    axios.get(`${config.BASE_URL}api/synthesis-requests/`)
      .then(response => {
        setRequests(response.data);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, []);

  return (
    <div style={{ padding: '30px' }}>
      <header style={{
        backgroundColor: '#0047AB',  // Blue header background
        color: 'white',
        padding: '20px',
        textAlign: 'center',
        marginBottom: '20px',
        borderRadius: '8px',
        fontSize: '32px'  // Set font size to 32px
      }}>
        <h1>Requests for Synthesis</h1>
      </header>

      <p style={{ marginBottom: '20px' }}>Green indicates that a sample is linked to the request. Red indicates no linked samples.</p>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
        <thead>
          <tr style={{ backgroundColor: '#FF5722', color: 'white', textAlign: 'left' }}> {/* Orange header */}
            <th style={{ padding: '12px', textAlign: 'center' }}>Date</th>
            <th style={{ padding: '12px', textAlign: 'center' }}>Name / Description</th>
            <th style={{ padding: '12px', textAlign: 'center' }}>Created by</th>
            <th style={{ padding: '12px', textAlign: 'center' }}>Samples Synthesised</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((req) => (
            <tr
              key={req.object_id}
              style={{
                backgroundColor: req.is_linked ? '#d4edda' : '#f8d7da',  // Green if linked, Red if not linked
                transition: 'background-color 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = req.is_linked ? '#66bb6a' : '#ef9a9a'}  // Slightly darker hover
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = req.is_linked ? '#d4edda' : '#f8d7da'}
            >
              <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>{req.date_created}</td>

              {/* Add link to the Name/Description */}
              <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>
                <Link to={`/object/${req.object_id}`} style={{ color: '#0047AB', textDecoration: 'underline' }}>
                  {req.description || req.object_name}
                </Link>
              </td>

              <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>{req.created_by}</td>
              <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>{req.is_linked ? 1 : 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SynthesisRequestsTable;
