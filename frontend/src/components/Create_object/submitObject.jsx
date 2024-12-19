export const handleSubmit = async ({
  formData,
  token,
  groupName,
  navigate,
  setErrorMessage,
}) => {
  const payload = new FormData();

  payload.append('tenantId', 4);
  payload.append('typeId', formData.type);
  payload.append('rubricId', formData.rubricId);
  payload.append('sortCode', formData.sortCode || 0);
  payload.append(
    'accessControl',
    formData.accessControl === 'protected'
      ? 1
      : formData.accessControl === 'public'
      ? 2
      : 3
  );
  payload.append('name', formData.name);
  payload.append('description', formData.description);

  if (formData.filePath) {
    payload.append('filePath', formData.filePath);
  }

  // Append the objectId to the payload if it exists
  if (formData.objectId) {
    payload.append('objectId', formData.objectId);
  }

  try {
    // Initial request to create the object
    const response = await fetch('http://127.0.0.1:8000/api/create_object/', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: payload,
    });

    const data = await response.json();
    console.log('POST response data:', data); // Log response to verify structure

    if (response.status === 409) {
      if (data.error === 'File already exists with the same content.') {
        setErrorMessage(
          <>
            File copy already exists, see{' '}
            <Link
              to={`/object/${data.existing_object.objectId}`}
              className="text-blue-600 underline"
            >
              {data.existing_object.objectName}
            </Link>
          </>
        );
      } else {
        setErrorMessage('An unexpected error occurred.');
      }
      return;
    }

    if (!response.ok) {
      throw new Error(`Failed to create object: ${response.statusText}`);
    }

    const { objectId } = data; // Corrected field name based on the response

    if (!objectId) {
      setErrorMessage('Failed to retrieve object ID from the response.');
      return;
    }

    // Step 2: Update objectnameurl with filename-objectId
    const updatePayload = new FormData();
    const objectNameUrl = `${formData.name}-${objectId}`;
    updatePayload.append('objectnameurl', objectNameUrl);

    const updateResponse = await fetch(
      `http://127.0.0.1:8000/api/update_object_url/${objectId}/`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: updatePayload,
      }
    );

    if (!updateResponse.ok) {
      throw new Error(`Failed to update object URL: ${updateResponse.statusText}`);
    }

    // Redirect to the object list after successful creation and URL update
    navigate(`/${groupName ? encodeURIComponent(groupName) : ''}`);

  } catch (error) {
    console.error('Error submitting form:', error.message);
    setErrorMessage(error.message || 'An unknown error occurred.');
  }
};
