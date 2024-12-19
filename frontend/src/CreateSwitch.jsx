import React from 'react';
import { useParams } from 'react-router-dom';
import CreateSampleForm from './components/Create_object/CreateSampleForm';
import CreateEDXObject from './components/Create_object/CreateEDXObject';
import CreateObject from './components/Create_object/CreateObject';
import CreateIdeasAndPlans from './components/Create_object/CreateIdeasAndPlans';
import CreateSECCMLongRangeRaw from './components/Create_object/CreateSECCMLongRangeRaw';
import AddHandoverForm from './components/Create_object/AddHandoverForm';

const CreateSwitch = () => {
  const { typeName, id } = useParams(); // Include `id` from URL

  // Normalize the typeName for comparison
  const normalizedTypeName = typeName
    ?.toLowerCase()
    .replace(/-/g, ' ') // Replace hyphens with spaces
    .replace(/\s+/g, ' ') // Collapse multiple spaces into one
    .trim(); // Remove leading and trailing spaces

  // Log for debugging
  console.log('CreateSwitch: Raw typeName:', typeName);
  console.log('CreateSwitch: Normalized typeName:', normalizedTypeName);
  console.log('CreateSwitch: ID:', id);

  // Switch statement for conditional rendering
  switch (normalizedTypeName) {
    case 'sample':
      return <CreateSampleForm />;
    case 'edx csv':
      return <CreateEDXObject />;
    case 'ideas or experiment plans': // Match normalized string
      return <CreateIdeasAndPlans />;
    case 'seccm long range raw (zip)':
      return <CreateSECCMLongRangeRaw />;
    case 'handover': // Match the normalized path for the Handover
      return <AddHandoverForm objectId={id} />; // Pass the ID to the Handover form
    default:
      console.warn(`CreateSwitch: Unknown typeName "${normalizedTypeName}"`);
      return <CreateObject />;
  }
};

export default CreateSwitch;
