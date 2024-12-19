import { useParams } from 'react-router-dom';
import EditObject from './components/edit_delete/EditObject';
import EditEDXObject from './components/edit_delete/EditEDXObject';
import EditSampleForm from './components/edit_delete/EditSampleForm';
import EditSECCMLongRangeRaw from './components/edit_delete/EditSECCMLongRangeRaw';
import EditIdeasAndPlans from './components/edit_delete/EditIdeasAndPlans';
import EditLiteratureReferenceForm from './components/edit_delete/EditLiteratureReferenceForm';

const EditDispatcher = () => {
  const { objectType, objectId } = useParams();

  // Log parameters for debugging
  console.log('EditDispatcher: Raw objectType:', objectType, 'objectId:', objectId);

  // Normalize the objectType to handle hyphenated strings
  const normalizedType = objectType
    ?.toLowerCase()
    .trim()
    .replace(/-/g, ' ') // Replace hyphens with spaces
    .replace(/\s+/g, ' '); // Replace multiple spaces with a single space

  // Log the normalized type
  console.log('EditDispatcher: Normalized objectType:', normalizedType);

  if (!normalizedType) {
    return <div className="text-center text-red-600">Error: Invalid or missing object type.</div>;
  }

  // Route based on normalized object type
  switch (normalizedType) {
    case 'edx csv':
      return <EditEDXObject objectId={objectId} />;
    case 'sample':
      return <EditSampleForm objectId={objectId} />;
    case 'seccm long-range raw (zip)':
      return <EditSECCMLongRangeRaw objectId={objectId} />;
    case 'ideas or experiment plans':
      return <EditIdeasAndPlans objectId={objectId} />;
    case 'literature reference':
    case 'publication':
      return <EditLiteratureReferenceForm objectId={objectId} />;
    default:
      console.warn(`Unknown object type: ${normalizedType}`);
      return <EditObject objectId={objectId} />;
  }
};

export default EditDispatcher;

