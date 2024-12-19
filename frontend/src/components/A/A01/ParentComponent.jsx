import React, { useState, useEffect } from 'react';
import HandoverDetails from './HandoverDetails';

function ParentComponent() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  return (
    <div>
      {/* Only render HandoverDetails if currentUser is loaded */}
      {currentUser && <HandoverDetails objectId="someObjectId" currentUser={currentUser} />}
    </div>
  );
}

export default ParentComponent;
