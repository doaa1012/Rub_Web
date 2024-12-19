// ItemList.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const ItemList = ({ items, currentUser, showUserItemsOnly }) => {
  // Filter items based on the `showUserItemsOnly` flag
  const filteredItems = showUserItemsOnly
    ? items.filter(item => item.Objects[0]?.created_by === currentUser)
    : items;

  if (filteredItems.length === 0) {
    return <p className="text-center text-gray-500">No items available.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
      {filteredItems.map((obj, index) => (
        <div key={`${obj["Rubric ID"]}-${index}`} className="p-4 bg-white rounded-lg shadow-md border-l-4 border-blue-400 transition transform duration-300 hover:shadow-lg hover:translate-y-1">
          <h3 className="text-lg font-semibold text-blue-600">
            <Link to={`/object/${obj["Object ID"]}`} className="hover:text-blue-500">
              {obj.Objects[0]?.["Object Name"] || "Unknown Object"}
            </Link>
          </h3>
          {obj.Objects[0]?.Sample?.Elements && (
            <p className="text-gray-600"><strong>Sample Elements:</strong> {obj.Objects[0].Sample.Elements.replace(/^-+|-+$/g, '')}</p>
          )}
          {obj.Objects[0]?.Sample?.["Element Number"] && (
            <p className="text-gray-600"><strong>Element Count:</strong> {obj.Objects[0].Sample["Element Number"]}</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default ItemList;
