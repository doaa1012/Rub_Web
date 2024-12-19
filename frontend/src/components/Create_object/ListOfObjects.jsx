import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import config from '../../config_path';
const ListEditor = () => {
  const [data, setData] = useState(null);
  const { RubricNameUrl, objectnameurl } = useParams();
  const [rubricName, setRubricName] = useState(RubricNameUrl);
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve objectId from query parameters
  const queryParams = new URLSearchParams(location.search);
  const objectId = queryParams.get('objectId');

  console.log('Params:', { RubricNameUrl, objectnameurl });
  console.log('Query Parameters:', { objectId });
  console.log('Location:', location);

  useEffect(() => {
    console.log('Fetching data with RubricNameUrl:', RubricNameUrl);

    const url = RubricNameUrl
      ? `${config.BASE_URL}api/list_editor/?group=${RubricNameUrl}`
      : `${config.BASE_URL}api/list_editor/`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        console.log('Fetched data:', data);
        const sortedData = data.sort((a, b) =>
          a.typeid.typename.localeCompare(b.typeid.typename)
        );
        setData(sortedData);
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, [RubricNameUrl]);

  useEffect(() => {
    if (objectnameurl) {
      console.log('Fetching rubric name for objectnameurl:', objectnameurl);

      fetch(`${config.BASE_URL}api/get_rubric_from_objectnameurl/${objectnameurl}/`)
        .then((response) => response.json())
        .then((data) => {
          console.log('Fetched rubric name data:', data);
          setRubricName(data.rubricname || RubricNameUrl);
        })
        .catch((error) => console.error('Error fetching rubric name:', error));
    }
  }, [objectnameurl, RubricNameUrl]);

  if (!data) {
    return <div className="text-center py-4">Loading...</div>;
  }

  if (data.length === 0) {
    return <div className="text-center py-4">No data available</div>;
  }

  return (
    <div className="p-10 bg-blue-50 min-h-screen font-sans">
      <div className="p-6" style={{ backgroundColor: '#f4f6f8' }}>
        <h1 className="text-2xl font-bold mb-4" style={{ color: '#2c3e50' }}>
          {RubricNameUrl ? `List Of Objects for ${RubricNameUrl}` : 'General List Of Objects'}
        </h1>
        <p className="mb-6">Select list type to edit/create:</p>
        <table className="table-auto w-full border-collapse shadow-md" style={{ backgroundColor: '#ffffff' }}>
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-white uppercase tracking-wide text-sm font-bold"
                  style={{ backgroundColor: '#3498db' }}>
                Type name
              </th>
              <th className="px-4 py-2 text-left text-white uppercase tracking-wide text-sm font-bold"
                  style={{ backgroundColor: '#3498db' }}>
                Count
              </th>
              <th className="px-4 py-2 text-left text-white uppercase tracking-wide text-sm font-bold"
                  style={{ backgroundColor: '#3498db' }}>
                Table name
              </th>
              <th className="px-4 py-2 text-left text-white uppercase tracking-wide text-sm font-bold"
                  style={{ backgroundColor: '#3498db' }}>
                Comment
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr
                key={index}
                className={index % 2 === 0 ? 'bg-blue-100' : 'bg-blue-200'}
                style={{
                  backgroundColor: index % 2 === 0 ? '#e1f5fe' : '#bce7fb',
                }}
              >
                <td className="px-4 py-2">
                <Link
                  to={`/create/${encodeURIComponent(item.typeid.typename)}?rubricnameurl=${RubricNameUrl || ''}&objectId=${objectId || ''}`}
                  className="font-bold"
                  style={{ color: '#2c8ed0' }}
                >
                  {item.typeid.typename}
                </Link>

                </td>
                <td className="px-4 py-2">{item.count}</td>
                <td className="px-4 py-2">{item.tablename}</td>
                <td className="px-4 py-2">{item.comment || 'No comment available'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListEditor;
