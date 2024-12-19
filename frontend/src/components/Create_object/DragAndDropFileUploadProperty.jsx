import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import config from "../../config_path";

const DragAndDropFileUploadProperty = () => {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { objectId } = useParams();
  const navigate = useNavigate();

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const handleFileUpload = async () => {
    if (!file) {
      setErrorMessage("Please select a file to upload!");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      setErrorMessage("User is not authenticated");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("objectId", objectId);

    try {
      const response = await fetch(`${config.BASE_URL}api/upload-properties/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        setSuccessMessage("File uploaded successfully!");
        setFile(null);
        setTimeout(() => navigate(-1), 2000);
      } else {
        const error = await response.json();
        setErrorMessage(error.error || "Upload failed");
      }
    } catch (err) {
      setErrorMessage("An unexpected error occurred.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] bg-gradient-to-br from-blue-50 to-blue-100">
      <div
        className={`w-full max-w-lg p-8 rounded-xl border-2 transition-all duration-300 shadow-lg ${
          dragOver
            ? "border-blue-400 bg-blue-50"
            : "border-gray-300 bg-white hover:shadow-2xl"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleFileDrop}
      >
        {/* File Upload Box */}
        <div className="flex flex-col items-center space-y-6">
          <div className="text-blue-500 text-7xl">
            <i className="fas fa-cloud-upload-alt"></i>
          </div>
          <p className="text-lg text-gray-600 font-medium text-center">
            Drag & Drop your file here or
          </p>
          <button
            className="bg-blue-500 text-white px-6 py-3 rounded-full shadow-md hover:bg-blue-600 focus:outline-none transition-transform transform hover:scale-105"
            onClick={() => document.querySelector("#file-input").click()}
          >
            Select Files
          </button>
          <input
            id="file-input"
            type="file"
            className="hidden"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </div>

        {/* Selected File Section */}
        {file && (
          <div className="flex items-center justify-between mt-6 p-4 bg-blue-50 border border-blue-300 rounded-lg shadow-sm">
            <span className="text-gray-700 font-medium truncate">
              {file.name}
            </span>
            <button
              onClick={handleFileUpload}
              className="bg-green-500 text-white px-5 py-2 rounded-lg hover:bg-green-600 transition-transform transform hover:scale-105"
            >
              Upload
            </button>
          </div>
        )}

        {/* Success and Error Messages */}
        {successMessage && (
          <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default DragAndDropFileUploadProperty;

