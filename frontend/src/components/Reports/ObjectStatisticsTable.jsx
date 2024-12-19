import React, { useEffect, useState } from 'react';
import axios from 'axios';
import config from '../../config_path';
const ObjectStatisticsTable = () => {
  const [statistics, setStatistics] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');

  useEffect(() => {
    // Fetch all users for the dropdown
    axios.get(`${config.BASE_URL}api/users/`)
      .then(response => {
        setUsers(response.data); // Set the fetched users
      })
      .catch(error => {
        console.error('Error fetching users:', error);
      });

    // Fetch the default statistics
    fetchStatistics();
  }, []);

  // Fetch statistics filtered by user
  const fetchStatistics = (userId = '') => {
    let url = `${config.BASE_URL}api/object-statistics/`;
    if (userId) {
      url += `?user_id=${userId}`;
    }
    axios.get(url)
      .then(response => {
        setStatistics(response.data);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  };

  // Handle user selection from dropdown
  const handleUserChange = (e) => {
    setSelectedUser(e.target.value);
    fetchStatistics(e.target.value);
  };

  return (
    <div style={{ padding: '30px' }}>
      {/* Header Section */}
      <header style={{
        backgroundColor: '#2072c9', 
        color: 'white',
        padding: '20px',
        borderRadius: '8px',
        textAlign: 'center',
        marginBottom: '20px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      }}>
        <h1 style={{ fontSize: '2.5rem', margin: '0' }}>Object Statistics </h1>
       
      </header>

      {/* User Filter */}
      <div style={{ marginBottom: '20px', textAlign: 'left' }}> {/* Aligning filter to the left */}
        <label htmlFor="user-select" style={{ fontSize: '1.2rem', marginRight: '10px' }}>Filter by User:</label>
        <select
          id="user-select"
          value={selectedUser}
          onChange={handleUserChange}
          style={{
            padding: '10px',
            fontSize: '1.2rem',
            borderRadius: '8px',
            border: '1px solid #ccc',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            width: '200px',
          }}
        >
          <option value="">All Users</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.username}
            </option>
          ))}
        </select>
      </div>

      {/* Statistics Table */}
      <div style={{ overflowX: 'auto', marginTop: '20px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
          <thead>
            <tr style={{ backgroundColor: '#FF5722', color: 'white', textAlign: 'left' }}> {/* Orange header */}
              <th style={{ padding: '12px', textAlign: 'center' }}>Object Count</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>TypeId</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Type Name</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Type Comment</th>
            </tr>
          </thead>
          <tbody>
            {statistics.length > 0 ? (
              statistics.map((stat, index) => (
                <tr
                  key={index}
                  style={{
                    backgroundColor: index % 2 === 0 ? '#E0F7FA' : '#FCE4EC', // Alternate row colors: light blue and pink
                    transition: 'background-color 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#B2EBF2'} // Hover effect: slightly darker blue
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#E0F7FA' : '#FCE4EC'}
                >
                  <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>{stat.object_count}</td>
                  <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>{stat.typeid}</td>
                  <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>{stat.typename}</td>
                  <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>{stat.typecomment || 'N/A'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ padding: '12px', textAlign: 'center', color: '#6c757d' }}>
                  No statistics found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ObjectStatisticsTable;

