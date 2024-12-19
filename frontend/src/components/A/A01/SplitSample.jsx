import React, { useState } from "react";
import config from '../../../config_path';
function SplitSample({ objectId, onSplitComplete }) {
  const [pieceCount, setPieceCount] = useState("");
  const [pieceDescription, setPieceDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSplitSample = async () => {
    if (!pieceCount || !pieceDescription) {
      alert("Both Parts/Pieces Count and Description are required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${config.BASE_URL}api/split_sample/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            parentObjectId: objectId, // The ID of the current sample
            pieceCount,
            pieceDescription,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        
        console.log("Created pieces:", data.samples);
        setPieceCount(""); // Clear the input
        setPieceDescription(""); // Clear the description
        if (onSplitComplete) onSplitComplete(data.samples); // Notify parent component
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error splitting sample:", error);
      alert("An error occurred while splitting the sample.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="split-sample-section">
      <h3 className="text-lg font-bold mb-2">Split the Sample into Parts/Pieces</h3>
      <label htmlFor="partsCount" className="block text-gray-700">
        Parts/Pieces Count*
      </label>
      <input
        type="number"
        id="partsCount"
        placeholder="for example: 4"
        value={pieceCount}
        onChange={(e) => setPieceCount(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded mt-2"
      />
      <label htmlFor="partsDescription" className="block text-gray-700 mt-4">
        Parts/Pieces Description*
      </label>
      <textarea
        id="partsDescription"
        placeholder="for example: Cutted"
        value={pieceDescription}
        onChange={(e) => setPieceDescription(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded mt-2"
      />
      <button
        onClick={handleSplitSample}
        className="bg-blue-600 text-white font-bold py-2 px-4 rounded mt-4"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Splitting..." : "Split into Parts/Pieces"}
      </button>
    </div>
  );
}

export default SplitSample;
