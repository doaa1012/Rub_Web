import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {useAuth, AuthProvider} from '../../AuthContext';
const Navbar = () => {
  const [isReportsDropdownOpen, setIsReportsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();  // Use logout function from AuthContext

  // Toggle dropdown visibility
  const toggleReportsDropdown = () => {
    setIsReportsDropdownOpen(!isReportsDropdownOpen);
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      // Send POST request to logout API
      await axios.post('http://127.0.0.1:8000/api/logout/', {}, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,  // Ensure cookies/sessions are handled properly
      });

      // Clear any authentication state (e.g., tokens)
      localStorage.removeItem('authToken');  // Assuming authToken is stored in localStorage

      // Call the logout function from AuthContext to update the authentication state
      logout();  // Clears the authentication state globally

      // Redirect to the welcome page
      navigate('/start', { replace: true });  // Prevent back navigation to protected pages
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Logout failed, please try again.');
    }
  };
  return (
    <nav className="fixed top-0 right-0 z-50 py-2 px-4">
      <div className="flex justify-center items-center space-x-4 rounded-full bg-[#e3f2fd] shadow-md py-1 px-4">
        <Link to="/" className="text-2xl font-bold hover:text-orange-600 transition-colors duration-300">
          CRC 1625
        </Link>
        <span className="text-xl text-orange-600">|</span>
        <Link to="/search" className="text-2xl font-bold hover:text-orange-600 transition-colors duration-300">
          Search
        </Link>
        <span className="text-xl text-orange-600">|</span>
        <Link to="/list-of-objects" className="text-2xl font-bold hover:text-orange-600 transition-colors duration-300">
          Create Object
        </Link>
        <span className="text-xl text-orange-600">|</span>
        <Link to="/SampleTable" className="text-2xl font-bold hover:text-orange-600 transition-colors duration-300">
          Sample Progress Overview
        </Link>
        <span className="text-xl text-orange-600">|</span>
        <Link to="/workflows" className="text-2xl font-bold hover:text-orange-600 transition-colors duration-300">
          Workflows
        </Link>
        <span className="text-xl text-orange-600">|</span>

        {/* Reports Dropdown */}
        <div className="relative">
          <button
            onClick={toggleReportsDropdown}
            className="text-2xl font-bold hover:text-orange-600 transition-colors duration-300 focus:outline-none"
          >
            Reports
          </button>
          
          {/* Add margin to separate the logout link */}
          <span className="text-xl text-orange-600 mx-4">|</span>
          <button
            onClick={handleLogout}
            className="text-2xl font-bold hover:text-orange-600 transition-colors duration-300 focus:outline-none"
          >
            Log Out
          </button>

          {/* Dropdown menu */}
          {isReportsDropdownOpen && (
            <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-md py-2">
              <Link
                to="/reports"
                className="block px-4 py-2 text-gray-700 hover:bg-orange-600 hover:text-white"
                onClick={() => setIsReportsDropdownOpen(false)}  // Close dropdown after navigation
              >
                Element Composition 
              </Link>
              <Link
                to="/MonthlyObjectIncrease"
                className="block px-4 py-2 text-gray-700 hover:bg-orange-600 hover:text-white"
                onClick={() => setIsReportsDropdownOpen(false)}
              >
                Monthly Object Increase
              </Link>

              <Link
                to="/SamplesPerElementChart"
                className="block px-4 py-2 text-gray-700 hover:bg-orange-600 hover:text-white"
                onClick={() => setIsReportsDropdownOpen(false)}
              >
                Samples Per Element
              </Link>

              <Link
                to="/SynthesisRequestsTable"
                className="block px-4 py-2 text-gray-700 hover:bg-orange-600 hover:text-white"
                onClick={() => setIsReportsDropdownOpen(false)}
              >
                Synthesis Requests Table
              </Link>

              <Link
                to="/ObjectStatisticsTable"
                className="block px-4 py-2 text-gray-700 hover:bg-orange-600 hover:text-white"
                onClick={() => setIsReportsDropdownOpen(false)}
              >
                Object Statistics Table
              </Link>

              <Link
                to="/IdeasAndExperimentsTable"
                className="block px-4 py-2 text-gray-700 hover:bg-orange-600 hover:text-white"
                onClick={() => setIsReportsDropdownOpen(false)}
              >
                Ideas and Experiments Table
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
