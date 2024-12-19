import React, { useState, useEffect } from "react";
import axios from "axios";
import jwt_decode from "jwt-decode";
import config from "../config_path";
const Home = () => {
  const [recentObjects, setRecentObjects] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      const decoded = jwt_decode(token);
      setCurrentUser(decoded.user_id);

      axios
        .get(`${config.BASE_URL}api/recent-objects/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          setRecentObjects(response.data);
        })
        .catch((error) => {
          console.error("Error fetching recent objects:", error);
        });

      axios
        .get(`${config.BASE_URL}api/recent-activities/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          setRecentActivities(response.data);
        })
        .catch((error) => {
          console.error("Error fetching recent activities:", error);
        });
    }
  }, []);

  return (
    <div className="p-8 bg-gradient-to-br from-blue-50 to-blue-80 min-h-screen">
      {/* Header Section */}
      <header className="text-center mb-12">
        <h1 className="text-6xl font-extrabold text-blue-700 mb-4 tracking-wide">
          Welcome to CRC 1625
        </h1>
        <p className="text-lg text-gray-600">
          Manage your research data efficiently and explore recent activities.
        </p>
        <p className="mt-4 text-blue-600 hover:text-blue-700 transition duration-300">
          Get started by selecting a project area from the sidebar.
        </p>
      </header>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Recent Objects Section */}
        <section>
  <h2 className="text-3xl font-semibold text-gray-800 mb-6 border-b-2 border-blue-500 pb-2">
    Your Recent Objects
  </h2>
  {recentObjects.length === 0 ? (
    <p className="text-gray-500 text-center">No recent objects found.</p>
  ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {recentObjects.map((obj) => (
        <div
          key={obj.objectid}
          className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-transform transform hover:scale-105"
        >
          <a
            href={`/object/${obj.objectid}`}
            className="no-underline text-blue-600 hover:text-blue-800 transition duration-300"
          >
            <h3 className="text-lg font-semibold mb-2 truncate">
              {obj.objectname}
            </h3>
          </a>
          <p className="text-sm text-gray-600">
            Created on:{" "}
            <span className="font-medium">
              {new Date(obj.field_created).toLocaleDateString()}
            </span>
          </p>
        </div>
      ))}
    </div>
  )}
</section>


        {/* Recent Activities Section */}
        <section>
          <h2 className="text-3xl font-semibold text-gray-800 mb-6 border-b-2 border-blue-500 pb-2">
            Recent Project Activities
          </h2>
          {recentActivities.length === 0 ? (
            <p className="text-gray-500 text-center">
              No recent activities found.
            </p>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <ul className="divide-y divide-gray-200">
                {recentActivities.map((activity) => {
                  const updatedDate = activity.updated_at
                    ? new Date(activity.updated_at).toLocaleDateString()
                    : "Unknown Date";

                  return (
                    <li
                      key={activity.id}
                      className="py-4 flex justify-between items-center"
                    >
                      <a
                        href={`/object/${activity.id}`}
                        className="text-blue-500 hover:text-blue-700 font-medium transition duration-300"
                      >
                        {activity.name}
                      </a>
                      <span className="text-gray-600 text-sm">
                        Updated on: {updatedDate}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Home;
