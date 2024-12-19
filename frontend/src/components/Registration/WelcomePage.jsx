import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../images/crc1625logo200.png';  



const WelcomePage = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
      {/* Logo Section */}
      <div className="mb-6">
        <img src={logo} alt="CRC 1625 Logo" className="w-64 h-auto" />
      </div>

      {/* Welcome Text */}
      <h1 className="text-4xl font-bold text-gray-800 mb-2">Welcome to CRC 1625</h1>
      <p className="text-lg text-gray-600 mb-8">Database!</p>

      {/* Buttons Section */}
      <div className="flex space-x-6 mb-10">
        {/* Login Button */}
        <Link to="/login">
          <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300 ease-in-out">
            Login
          </button>
        </Link>

        {/* Register Button */}
        <Link to="/register">
          <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300 ease-in-out">
            Register
          </button>
        </Link>
      </div>

      {/* Additional Information Section */}
      <div className="text-center px-4 max-w-2xl">
        <p className="text-gray-700 text-md mb-4">
          Please make sure that you have received instructions on how to use the database.
        </p>
        <p className="text-gray-700 text-md mb-4">
          Your registration will then be activated. Please contact <a href="mailto:crc1625@rub.de" className="text-blue-600 hover:underline">crc1625@rub.de</a> for this purpose.
        </p>
      </div>
    </div>
  );
};

export default WelcomePage;
