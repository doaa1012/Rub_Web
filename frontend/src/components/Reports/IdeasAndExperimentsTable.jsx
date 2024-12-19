import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import config from '../../config_path';
const IdeasAndExperimentsTable = () => {
  const [ideas, setIdeas] = useState([]);

  useEffect(() => {
    // Fetch data from the backend
    axios.get(`${config.BASE_URL}api/ideas-experiments/`)
      .then(response => {
        setIdeas(response.data);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, []);

  return (
    <div>
      <div style={{ padding: '30px' }}></div>

      <header style={{
        backgroundColor: '#0047AB',  // Blue header background
        color: 'white',
        padding: '20px',
        textAlign: 'center',
        marginBottom: '20px',
        borderRadius: '8px',
        fontSize: '32px'  
        
      }}>
        <h1>Ideas and Experiment Plans</h1>
      </header>

      <p style={{ marginBottom: '20px' }}>
        Green are ideas/plans associated with at least one sample (i.e. "verified" or "completed" ideas/plans). Red ideas/plans require attention and upcoming sample synthesis (i.e. "pending" or "open" ideas/plans).
      </p>

      <table style={{ width: '100%', borderCollapse: 'collapse', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
        <thead>
          <tr style={{ backgroundColor: '#007bff', color: 'white', textAlign: 'left' }}>
            <th style={{ padding: '12px', textAlign: 'center' }}>Date</th>
            <th style={{ padding: '12px', textAlign: 'center' }}>Name / Description</th>
            <th style={{ padding: '12px', textAlign: 'center' }}>Created by</th>
            <th style={{ padding: '12px', textAlign: 'center' }}>Samples Synthesised</th>
          </tr>
        </thead>
        <tbody>
          {ideas.map((idea) => (
            <tr
              key={idea.object_id}
              style={{
                backgroundColor: idea.sample_count > 0 ? '#d4edda' : '#f8d7da', // Green if samples exist, Red otherwise
                transition: 'background-color 0.3s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = idea.sample_count > 0 ? '#66bb6a' : '#ef9a9a'}  // Slightly darker hover
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = idea.sample_count > 0 ? '#d4edda' : '#f8d7da'}  // Reset color after hover
            >
              <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>{idea.date_created}</td>

              {/* Separate the clickable name from the description */}
              <td style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                <Link to={`/object/${idea.object_id}`} style={{ color: '#007bff', textDecoration: 'none' }}>
                  {idea.object_name}
                </Link>
                <span style={{ display: 'block', marginTop: '5px', color: '#6c757d' }}>
                  {idea.description}
                </span>
              </td>

              <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>{idea.created_by}</td>
              <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>{idea.sample_count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default IdeasAndExperimentsTable;
