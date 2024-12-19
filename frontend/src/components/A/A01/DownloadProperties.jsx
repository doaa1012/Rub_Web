import React from 'react';
import config from '../../../config_path';
const DownloadPropertiesButton = ({ objectId }) => {
    const downloadProperties = () => {
        fetch(`${config.BASE_URL}api/export_properties/${objectId}/`)
            .then((response) => {
                if (response.ok) {
                    return response.blob();
                } else {
                    throw new Error('Failed to download properties.');
                }
            })
            .then((blob) => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `properties_${objectId}.csv`;
                a.click();
                window.URL.revokeObjectURL(url);
            })
            .catch((error) => console.error('Error downloading properties:', error));
    };

    return (
        <button
            onClick={downloadProperties}
            className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700"
        >
            Download All Properties
        </button>
    );
};

export default DownloadPropertiesButton;
