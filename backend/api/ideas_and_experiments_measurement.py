import logging
from django.db.models import Q
from django.http import JsonResponse
from .models import Objectinfo, Objectlinkobject, Propertyint, Propertyfloat, Propertybigstring, Propertystring, Sample

logger = logging.getLogger(__name__)

def ideas_and_experiments_measurement(request):
    object_id = request.GET.get('objectId')
    if not object_id:
        #logger.error("Object ID is missing in the request.")
        return JsonResponse({'error': 'Object ID is required'}, status=400)

    try:
        # Fetch the main idea or experiment plan object
        idea_object = Objectinfo.objects.get(objectid=object_id, typeid__typename='Ideas or Experiment Plans')
        #logger.info(f"Fetched Idea or Experiment Plan object: {idea_object.objectid}")
    except Objectinfo.DoesNotExist:
        #logger.error(f"Idea or Experiment Plan object not found for ID {object_id}")
        return JsonResponse({'error': 'Idea or Experiment Plan object not found.'}, status=404)

    # Fetch properties and clean names
    property_names = list(Propertyint.objects.filter(objectid=idea_object).values_list('propertyname', flat=True))
    property_names += list(Propertyfloat.objects.filter(objectid=idea_object).values_list('propertyname', flat=True))
    property_names += list(Propertybigstring.objects.filter(objectid=idea_object).values_list('propertyname', flat=True))
    property_names += list(Propertystring.objects.filter(objectid=idea_object).values_list('propertyname', flat=True))
    cleaned_property_names = [prop.replace('Measurements Report =>', '').strip() for prop in property_names]
    #logger.info(f"Cleaned Property Names: {cleaned_property_names}")

    # Get linked samples
    linked_samples = Objectlinkobject.objects.filter(objectid=idea_object, linkedobjectid__typeid__typename='Sample')
    #logger.info(f"Linked Samples: {[link.linkedobjectid.objectid for link in linked_samples]}")

    data = []

    for link in linked_samples:
        sample = link.linkedobjectid
        #logger.info(f"Processing sample: {sample.objectid}, Name: {sample.objectname}")

        # Fetch the associated Sample model instance for the chemical system
        try:
            sample_data = Sample.objects.get(sampleid=sample.objectid)
            chemical_system = sample_data.elements  # Fetch chemical system
        except Sample.DoesNotExist:
            chemical_system = 'Unknown'

        # Fetch associated objects for the sample
        associated_objects = Objectlinkobject.objects.filter(objectid=sample)
        associated_typenames = [assoc.linkedobjectid.typeid.typename for assoc in associated_objects]
        #logger.info(f"Associated Objects for Sample {sample.objectid}: {associated_typenames}")

        # Find the substrate material from associated objects
        substrate_material = 'Unknown'
        for assoc in associated_objects:
            if assoc.linkedobjectid.typeid.typename == 'Substrate':
                substrate_material = assoc.linkedobjectid.objectname
                break

        # Count matches using substring matching
        measurement_counts = {name: 0 for name in cleaned_property_names}
        for assoc in associated_objects:
            typename = assoc.linkedobjectid.typeid.typename
            for cleaned_name in cleaned_property_names:
                # Check if the cleaned property name is a substring of the typename
                if cleaned_name.lower() in typename.lower():
                    measurement_counts[cleaned_name] += 1
                    #logger.debug(f"Match found: Typename '{typename}' contains Property '{cleaned_name}'")

        # Collect sample data
        sample_data = {
            'sample_id': sample.objectid,
            'object_name': sample.objectname,
            'linked_samples': linked_samples.count(),
            'system': chemical_system,
            'substrate_material': substrate_material,
            **measurement_counts
        }
        #logger.debug(f"Sample Data: {sample_data}")
        data.append(sample_data)

    # Prepare response data
    response_data = {
        'linked_samples': data,
        'property_headers': cleaned_property_names,  # Send headers for dynamic table rendering
    }

    logger.info("Response data prepared successfully.")
    return JsonResponse(response_data, safe=False)
