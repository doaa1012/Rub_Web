from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from django.utils import timezone
import json
import jwt
from rest_framework import status
from ..models import Objectinfo, Typeinfo, Rubricinfo, Aspnetusers, Tenant, Sample, Elementinfo, Objectlinkobject, Propertyint, Propertyfloat

ACCESS_CONTROL_MAP = {
    'public': 0,
    'protected': 1,
    'protectednda': 2,
    'private': 3
}
@csrf_exempt
def edit_sample(request, object_id):
    if request.method != 'PUT':
        return JsonResponse(
            {'error': 'Only PUT method is allowed'},
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )

    try:
        # Validate Authorization token
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse(
                {'error': 'Authorization header missing or malformed'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            token = auth_header.split(' ')[1]
            decoded_token = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            user_id = decoded_token.get('user_id')
            if not user_id:
                return JsonResponse(
                    {'error': 'Invalid token: User ID missing'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
        except jwt.ExpiredSignatureError:
            return JsonResponse({'error': 'Token has expired'}, status=status.HTTP_401_UNAUTHORIZED)
        except jwt.InvalidTokenError:
            return JsonResponse({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)

        # Parse JSON payload
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON payload'}, status=status.HTTP_400_BAD_REQUEST)

        name = data.get('name')
        description = data.get('description', '')
        chemical_system = data.get('chemicalSystem', '')
        elem_number = data.get('elemnumber', 0)
        substrate_id = data.get('substrate')
        access_control_value = data.get('accessControl', 'protected')
        int_properties = data.get('intProperties', [])
        float_properties = data.get('floatProperties', [])

        # Fetch the object to be updated
        try:
            sample_object = Objectinfo.objects.get(objectid=object_id)
        except Objectinfo.DoesNotExist:
            return JsonResponse(
                {'error': f"Object with ID '{object_id}' does not exist."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Update Objectinfo fields
        sample_object.objectname = f"{sample_object.objectid} {name}"
        sample_object.objectnameurl = f"{name}-{sample_object.objectid}"
        sample_object.objectdescription = description
        sample_object.accesscontrol = ACCESS_CONTROL_MAP.get(access_control_value.lower(), 1)
        sample_object.field_updated = timezone.now()
        sample_object.field_updatedby_id = user_id
        sample_object.save(update_fields=['objectname', 'objectnameurl', 'objectdescription', 'accesscontrol', 'field_updated', 'field_updatedby'])

        # Update or create the substrate relationship
        if substrate_id:
            try:
                substrate_object = Objectinfo.objects.get(objectid=substrate_id)
            except Objectinfo.DoesNotExist:
                return JsonResponse(
                    {'error': f"Substrate with ID '{substrate_id}' does not exist."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Check if an Objectlinkobject exists for the substrate
            Objectlinkobject.objects.update_or_create(
                objectid=sample_object,
                linktypeobjectid=None,  # Assuming no specific link type
                defaults={
                    'linkedobjectid': substrate_object,
                    'sortcode': 0,
                    'field_updated': timezone.now(),
                    'field_updatedby_id': user_id,
                }
            )

        # Update Sample fields
        try:
            sample = Sample.objects.get(sampleid_id=object_id)
            sample.elements = chemical_system
            sample.elemnumber = elem_number
            sample.save()
        except Sample.DoesNotExist:
            return JsonResponse(
                {'error': f"Sample with ID '{object_id}' does not exist."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Update Integer Properties
        for int_property in int_properties:
            property_name = int_property.get('propertyName')
            value = int_property.get('value')
            row = int_property.get('row', None)
            comment = int_property.get('comment', '')

            if not property_name or value is None:
                return JsonResponse(
                    {'error': 'Integer property must include "propertyName" and "value".'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            Propertyint.objects.update_or_create(
                objectid=sample_object,
                propertyname=property_name,
                defaults={
                    'value': value,
                    'row': row,
                    'comment': comment,
                    'field_updated': timezone.now(),
                    'field_updatedby_id': user_id,
                }
            )

        # Update Float Properties
        for float_property in float_properties:
            property_name = float_property.get('propertyName')
            value = float_property.get('value')
            value_epsilon = float_property.get('valueEpsilon', None)
            row = float_property.get('row', None)
            comment = float_property.get('comment', '')

            if not property_name or value is None:
                return JsonResponse(
                    {'error': 'Float property must include "propertyName" and "value".'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            Propertyfloat.objects.update_or_create(
                objectid=sample_object,
                propertyname=property_name,
                defaults={
                    'value': value,
                    'valueepsilon': value_epsilon,
                    'row': row,
                    'comment': comment,
                    'field_updated': timezone.now(),
                    'field_updatedby_id': user_id,
                }
            )

        return JsonResponse({'message': 'Sample and associated properties updated successfully!'}, status=200)

    except Exception as e:
        import traceback
        traceback.print_exc()  # Logs the traceback to the console
        return JsonResponse({'error': f"Internal Server Error: {str(e)}"}, status=500)
