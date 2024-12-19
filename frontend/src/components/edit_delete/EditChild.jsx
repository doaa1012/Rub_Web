import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import config from "../../config_path";

function EditRubricChild() {
  const { rubricId } = useParams();
  const navigate = useNavigate();
  const { userId } = useAuth();

  const [name, setName] = useState("");
  const [parentId, setParentId] = useState("");
  const [parentName, setParentName] = useState("");
  const [sortCode, setSortCode] = useState("");
  const [accessControl, setAccessControl] = useState("protected");
  const [text, setText] = useState("");
  const [showMore, setShowMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // Error state

  const tenantId = 4;

  // Fetch existing rubric data
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setErrorMessage("Token is missing. Please log in.");
      return;
    }

    if (rubricId) {
      fetch(`${config.BASE_URL}api/get_rubric_with_parent/${rubricId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((response) => response.json())
        .then((data) => {
          setName(data.rubricname);
          setSortCode(data.sortcode);
          setAccessControl(data.accesscontrol);
          setText(data.text);
          setParentId(data.parent_rubricid);
          setParentName(data.parent_rubricname || "");
        })
        .catch((error) => {
          console.error("Error fetching rubric:", error);
          setErrorMessage("Failed to fetch rubric data.");
        });
    }
  }, [rubricId]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage(""); // Reset error state

    const token = localStorage.getItem("token");
    if (!token) {
      setErrorMessage("Token is missing. Please ensure you are logged in.");
      return;
    }

    const formData = {
      name,
      parent_id: parentId,
      sort_code: sortCode || 0,
      access_control: accessControl || 0,
      text,
      tenant_id: tenantId,
      updated_by: userId,
    };

    fetch(`${config.BASE_URL}api/edit_rubric/${rubricId}/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    })
      .then(async (response) => {
        const data = await response.json(); // Extract response
        if (!response.ok) {
          if (response.status === 400 && data.error?.includes("already exists")) {
            setErrorMessage("Duplicate error: A rubric with this name already exists.");
          } else {
            setErrorMessage(data.error || "An unexpected error occurred.");
          }
          throw new Error("Form submission failed");
        }
        return data;
      })
      .then(() => {
        console.log("Rubric child updated successfully");
        navigate(-1); // Navigate back to the previous page
      })
      .catch((error) => console.error("Error updating rubric child:", error));
  };

  return (
    <div className="flex justify-center items-start min-h-screen bg-blue-50 py-10">
      <div className="bg-white shadow-lg rounded-lg p-10 w-full max-w-4xl">
        <h2 className="text-3xl font-bold text-blue-600 mb-6">
          Edit Rubric Child - {name || "Loading..."}
        </h2>

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div>
            <label className="block text-lg font-semibold text-blue-800">
              Name<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full p-4 bg-blue-50 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Toggle button */}
          <div
            className="text-blue-600 font-semibold cursor-pointer"
            onClick={() => setShowMore(!showMore)}
          >
            {showMore ? "Hide more parameters" : "Show more parameters"}
          </div>

          {/* Show More Fields */}
          {showMore && (
            <>
              <div>
                <label className="block text-lg font-semibold text-blue-800">
                  Parent Name (ID)
                </label>
                <input
                  type="text"
                  className="w-full p-4 bg-gray-100 border border-gray-300 rounded-lg cursor-not-allowed"
                  value={`${parentName} (ID: ${parentId})`}
                  disabled
                />
              </div>

              <div>
                <label className="block text-lg font-semibold text-blue-800">
                  Sort Code
                </label>
                <input
                  type="number"
                  className="w-full p-4 bg-blue-50 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Input sort code"
                  value={sortCode}
                  onChange={(e) => setSortCode(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-lg font-semibold text-blue-800">
                  Access Control
                </label>
                <select
                  className="w-full p-4 bg-blue-50 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={accessControl}
                  onChange={(e) => setAccessControl(e.target.value)}
                >
                  <option value="public">Public</option>
                  <option value="protected">Protected</option>
                  <option value="protectedNDA">Protected NDA</option>
                  <option value="private">Private</option>
                </select>
              </div>

              <div>
                <label className="block text-lg font-semibold text-blue-800">
                  Description
                </label>
                <textarea
                  className="w-full p-4 bg-blue-50 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter description"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows="5"
                ></textarea>
              </div>
            </>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600"
              onClick={() => navigate(-1)}
            >
              Close
            </button>
            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditRubricChild;
