from django.http import HttpResponse
import logging
import csv
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Objectinfo, Propertyfloat, Propertyint, Propertybigstring, Propertystring,Aspnetusers
import jwt
from django.conf import settings
from django.utils import timezone
from rest_framework import status
from django.utils.timezone import now
logger = logging.getLogger(__name__)

def export_object_properties_csv(request, object_id):
    # Verify the object exists
    try:
        obj = Objectinfo.objects.get(objectid=object_id)
    except Objectinfo.DoesNotExist:
        return HttpResponse("Object not found", status=404)

    # Prepare the HTTP response for CSV
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = f'attachment; filename="properties_{object_id}.csv"'

    writer = csv.writer(response)

    # Write the header row
    writer.writerow(['Type', 'Name', 'Value', 'Epsilon', 'Comment', 'SourceObjectId'])

    # Fetch properties from all property models
    property_models = [Propertybigstring, Propertyfloat, Propertyint, Propertystring]
    for model in property_models:
        properties = model.objects.filter(objectid=object_id)
        for prop in properties:
            writer.writerow([
                model._meta.verbose_name.title(),  # Type
                prop.propertyname,  # Name
                prop.value,  # Value
                getattr(prop, 'epsilon', ' '),  # Epsilon (if available)
                prop.comment or 'No comment',  # Comment
                prop.sourceobjectid_id or ' ',  # SourceObjectId
            ])

    return response



@csrf_exempt
def upload_object_properties_csv(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST method is allowed'}, status=405)

    try:
        # Extract and validate Authorization token
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            logger.error("Authorization header missing or malformed.")
            return JsonResponse({'error': 'Authorization header missing or malformed'}, status=401)

        token = auth_header.split(' ')[1]
        try:
            decoded_token = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            user_id = decoded_token.get('user_id')
        except jwt.ExpiredSignatureError:
            logger.error("Token has expired.")
            return JsonResponse({'error': 'Token has expired'}, status=401)
        except jwt.InvalidTokenError:
            logger.error("Invalid token.")
            return JsonResponse({'error': 'Invalid token'}, status=401)

        if not user_id:
            logger.error("Invalid token: User ID missing.")
            return JsonResponse({'error': 'Invalid token: User ID missing'}, status=401)

        # Retrieve the user object
        try:
            created_by = Aspnetusers.objects.get(id=user_id)
        except Aspnetusers.DoesNotExist:
            logger.error(f"User with ID {user_id} does not exist.")
            return JsonResponse({'error': 'User does not exist'}, status=404)

        # Verify file is provided
        file = request.FILES.get('file')
        object_id = request.POST.get('objectId')

        logger.debug(f"Received file: {file}, Object ID: {object_id}")

        if not file or not object_id:
            logger.error("File and Object ID are required but missing.")
            return JsonResponse({'error': 'File and Object ID are required.'}, status=400)

        # Validate object_id
        try:
            object_instance = Objectinfo.objects.get(objectid=int(object_id))
        except Objectinfo.DoesNotExist:
            logger.error(f"Objectinfo with ID {object_id} does not exist.")
            return JsonResponse({'error': 'Objectinfo does not exist'}, status=404)

        # Read and process the uploaded CSV file
        decoded_file = file.read().decode('utf-8').splitlines()
        reader = csv.DictReader(decoded_file)
        logger.debug("CSV file successfully decoded and parsed.")

        for row in reader:
            property_type = row.get('Type', '').strip().lower()
            property_name = row.get('Name', '').strip()
            value = row.get('Value', '').strip()
            epsilon = row.get('Epsilon', '').strip() or None
            comment = row.get('Comment', '').strip() or ''
            source_object_id = row.get('SourceObjectId', '').strip() or None

            # Default values for missing fields
            sort_code = 0
            row_number = 0

            logger.debug(f"Processing row: {row}")

            # Skip invalid rows
            if not property_name or value is None:
                logger.warning(f"Skipping row due to missing property name or value: {row}")
                continue

            # Create or update the property based on the property type
            defaults = {
                'row': row_number,
                'propertyname': property_name,
                'value': value,
                'sortcode': sort_code,
                'comment': comment,
                'sourceobjectid_id': int(source_object_id) if source_object_id else None,
                'field_created': now(),
                'field_updated': now(),
                'field_createdby': created_by,
                'field_updatedby': created_by,
            }

            if property_type == 'propertyfloat':
                defaults['valueepsilon'] = float(epsilon) if epsilon else None
                Propertyfloat.objects.update_or_create(
                    objectid=object_instance,
                    propertyname=property_name,
                    defaults=defaults,
                )
            elif property_type == 'propertyint':
                defaults['value'] = int(value)
                Propertyint.objects.update_or_create(
                    objectid=object_instance,
                    propertyname=property_name,
                    defaults=defaults,
                )
            elif property_type == 'propertybigstring':
                Propertybigstring.objects.update_or_create(
                    objectid=object_instance,
                    propertyname=property_name,
                    defaults=defaults,
                )
            elif property_type == 'propertystring':
                Propertystring.objects.update_or_create(
                    objectid=object_instance,
                    propertyname=property_name,
                    defaults=defaults,
                )
            else:
                logger.warning(f"Unsupported property type: {property_type}. Skipping row.")
                continue

        logger.info("Properties uploaded successfully.")
        return JsonResponse({'message': 'Properties uploaded successfully.'}, status=201)

    except Exception as e:
        logger.error(f"Failed to process file: {e}")
        return JsonResponse({'error': f"Internal Server Error: {str(e)}"}, status=500)
