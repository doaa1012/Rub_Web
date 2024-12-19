import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import jwt_decode from 'jwt-decode';
import './HandoverDetailsstyle.css'; 
import config from '../../../config_path';
function HandoverDetails({ objectId }) {
  const [handoverData, setHandoverData] = useState([]);
  const [handoverLoading, setHandoverLoading] = useState(true);
  const [recipientComments, setRecipientComments] = useState({});
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwt_decode(token);
      setCurrentUserId(decoded.user_id);
    }
  }, []);

  useEffect(() => {
    fetch(`${config.BASE_URL}api/get_handover_detail/${objectId}/`)
      .then(response => response.json())
      .then(data => {
        setHandoverData(data);

        const initialRecipientComments = {};
        data.forEach(handover => {
          initialRecipientComments[handover.handoverid] = handover.destinationcomments || "";
        });
        setRecipientComments(initialRecipientComments);
      })
      .catch(error => console.error("Error fetching handover details:", error))
      .finally(() => setHandoverLoading(false));
  }, [objectId]);

  const handleConfirmation = (handoverId) => {
    const comments = recipientComments[handoverId] || "";
    fetch(`${config.BASE_URL}api/confirm_handover/${handoverId}/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ comments })
    })
      .then(response => response.json())
      .then(data => {
        setHandoverData(prevData => prevData.map(handover =>
          handover.handoverid === handoverId
            ? { ...handover, destinationconfirmed: data.destinationconfirmed, destinationcomments: data.destinationcomments }
            : handover
        ));
      })
      .catch(error => console.error("Error confirming handover:", error));
  };

  if (handoverLoading) return <p className="text-center text-gray-500">Loading handover details...</p>;

  return (
    <div className="handover-section bg-white p-8 rounded-lg shadow-lg mb-6">
      <h2 className="text-2xl font-semibold text-teal-600 mb-6">Handover Details</h2>
      <div className="overflow-hidden rounded-lg shadow-lg">
        <table className="handover-table w-full border border-gray-200">
          <thead>
            <tr className="bg-teal-600 text-white">
              <th className="p-4 text-left font-semibold uppercase">Sender</th>
              <th className="p-4 text-left font-semibold uppercase">Sent</th>
              <th className="p-4 text-left font-semibold uppercase">Amount</th>
              <th className="p-4 text-left font-semibold uppercase">Sender Comments</th>
              <th className="p-4 text-left font-semibold uppercase">Recipient</th>
              <th className="p-4 text-left font-semibold uppercase">Received</th>
              <th className="p-4 text-left font-semibold uppercase">Recipient Comments</th>
            </tr>
          </thead>
          <tbody>
            {handoverData.map((handover, index) => {
              const isPending = handover.Sender.Id !== currentUserId && handover.Recipient.Id !== currentUserId;
              return (
                <tr key={index} className={`${isPending ? 'bg-yellow-50' : 'bg-green-50'} hover:bg-gray-100`}>
                  <td className="p-4 border-t border-gray-200">
                    <Link to={`/user/${handover?.Sender?.Id}`} className="text-teal-600 hover:underline">
                      {handover?.Sender?.Username || 'N/A'}
                    </Link>
                  </td>
                  <td className="p-4 border-t border-gray-200">{handover?.Sent ? new Date(handover.Sent).toLocaleString() : 'N/A'}</td>
                  <td className="p-4 border-t border-gray-200">{handover?.Amount || 'N/A'}</td>
                  <td className="p-4 border-t border-gray-200">{handover?.SenderComments || 'N/A'}</td>
                  <td className="p-4 border-t border-gray-200">
                    <Link to={`/user/${handover?.Recipient?.Id}`} className="text-teal-600 hover:underline">
                      {handover?.Recipient?.Username || 'N/A'}
                    </Link>
                  </td>
                  <td className="p-4 border-t border-gray-200">
                    {handover.destinationconfirmed ? (
                      <span>{new Date(handover.destinationconfirmed).toLocaleString()}</span>
                    ) : (
                      currentUserId === handover?.Recipient?.Id && (
                        <input
                          type="checkbox"
                          checked={false}
                          onChange={() => handleConfirmation(handover.handoverid)}
                          className="focus:ring-teal-500 text-teal-600"
                        />
                      )
                    )}
                  </td>
                  <td className="p-4 border-t border-gray-200">
                    {handover.destinationconfirmed ? (
                      <span>{handover.destinationcomments || "No comments provided"}</span>
                    ) : (
                      currentUserId === handover?.Recipient?.Id && (
                        <>
                          <textarea
                            className="w-full border border-gray-300 rounded-lg p-2 mt-2"
                            value={recipientComments[handover.handoverid] || ""}
                            onChange={(e) => setRecipientComments(prev => ({
                              ...prev,
                              [handover.handoverid]: e.target.value
                            }))}
                            placeholder="Comments for sender"
                          />
                          <button
                            onClick={() => handleConfirmation(handover.handoverid)}
                            className="mt-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition duration-300"
                          >
                            Confirm
                          </button>
                        </>
                      )
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default HandoverDetails;
