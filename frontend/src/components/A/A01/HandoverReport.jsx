import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import config from '../../../config_path';
function HandoverReport() {
    const [incomingHandovers, setIncomingHandovers] = useState([]);
    const [outgoingHandovers, setOutgoingHandovers] = useState([]);
    const [currentHandovers, setCurrentHandovers] = useState([]);
    const [loading, setLoading] = useState(true);

    const queryParams = new URLSearchParams(location.search);
    const projectTitle = queryParams.get('projectTitle');

    // Capitalize the project title for display
    const formattedProjectTitle = projectTitle
        ? projectTitle.charAt(0).toUpperCase() + projectTitle.slice(1).toLowerCase()
        : '';

    useEffect(() => {
        if (!projectTitle) {
            console.warn('No projectTitle provided');
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                const response = await fetch(`${config.BASE_URL}api/handover/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ claim: projectTitle }), // Send projectTitle to the backend
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const result = await response.json();
                setIncomingHandovers(result.incoming_handovers);
                setOutgoingHandovers(result.outgoing_handovers);
                setCurrentHandovers(result.current_handovers);
            } catch (error) {
                console.error('Error fetching handover data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [projectTitle]);

    if (loading) {
        return (
            <div className="text-center mt-10 text-lg text-blue-700 font-semibold">
                Loading...
            </div>
        );
    }

    if (!projectTitle) {
        return (
            <div className="text-center mt-10 text-lg text-red-500">
                Project title is missing. Please navigate from the appropriate page.
            </div>
        );
    }

    const renderTable = (title, handovers, colorClass) => (
        <div className={`mb-10 p-6 rounded-lg shadow-md ${colorClass}`}>
            <h2 className="text-xl font-bold mb-4 text-blue-700">{title}</h2>
            <div className="overflow-x-auto">
                <table className="w-full border border-gray-300 bg-white rounded-lg shadow-sm">
                    <thead className="bg-blue-600 text-white rounded-lg">
                        <tr>
                            {["Name / Sample", "Amount", "Sender", "Sent", "Sender Comments", "Recipient", "Received", "Recipient Comments"].map((header, index) => (
                                <th key={index} className="py-3 px-4 font-medium text-left border-b border-gray-200">
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {handovers.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="py-4 text-center text-gray-500">
                                    No handovers available
                                </td>
                            </tr>
                        ) : (
                            handovers.map((item, index) => (
                                <tr
                                    key={index}
                                    className={`hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
                                >
                                    <td className="py-3 px-4">
                                        <Link to={`/object/${item.sample_id}`} className="text-blue-600 hover:underline">
                                            {item.sample_name || "Unknown Object"}
                                        </Link>
                                    </td>
                                    <td className="py-3 px-4">{item.amount}</td>
                                    <td className="py-3 px-4">{item.sender_email}</td>
                                    <td className="py-3 px-4">{new Date(item.sent_date).toLocaleString()}</td>
                                    <td className="py-3 px-4">{item.sender_comments || "No comments"}</td>
                                    <td className="py-3 px-4">
                                        {item.recipient} ({item.recipient_email})
                                    </td>
                                    <td className="py-3 px-4">
                                        {item.received_date ? new Date(item.received_date).toLocaleString() : "Pending"}
                                    </td>
                                    <td className="py-3 px-4">{item.recipient_comments || "No comments"}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="p-10 bg-blue-50 min-h-screen font-sans">
            <h1 className="text-3xl font-extrabold text-center text-blue-700">
                Handover Report for {formattedProjectTitle}
            </h1>
            {renderTable("Incoming Handovers", incomingHandovers, "bg-green-100")}
            {renderTable("Outgoing Handovers", outgoingHandovers, "bg-blue-100")}
            {renderTable("Current Handovers", currentHandovers, "bg-yellow-100")}
        </div>
    );
}

export default HandoverReport;
