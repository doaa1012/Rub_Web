import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AddHandoverForm from './AddHandoverForm';
import config from '../../config_path';
function ParentComponent() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Fetch current user information
    axios.get(`${config.BASE_URL}api/current-user/`)
      .then(response => {
        // Verify if response contains email and username
        if (response.data && response.data.email && response.data.username) {
          setCurrentUser(response.data);
        } else {
          console.error("Current user data does not contain 'email' or 'username'.");
        }
      })
      .catch(error => {
        console.error('Error fetching current user:', error);
      });
  }, []);

  const handleHandoverSubmit = (handoverData) => {
    // Handle the form submission, e.g., by posting to an API
    console.log("Handover data submitted:", handoverData);
  };

  if (!currentUser) {
    return <p>Loading...</p>; // Display loading state while fetching current user
  }

  return (
    <AddHandoverForm
      onSubmit={handleHandoverSubmit}
      currentUserEmail={currentUser.email}
      currentUserName={currentUser.username}
    />
  );
}

export default ParentComponent;
