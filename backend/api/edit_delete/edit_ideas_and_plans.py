from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from django.http.multipartparser import MultiPartParser
import json
import jwt
from django.conf import settings
from django.db.models import Max
from ..models import Objectinfo, Propertyint, Aspnetusers, Typeinfo, Rubricinfo
from rest_framework import status
import os
import hashlib
import logging

# Set up the logger
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG)  # Adjust the level as needed (DEBUG, INFO, WARNING, ERROR, CRITICAL)

ACCESS_CONTROL_MAP = {
    'public': 0,
    'protected': 1,
    'protectednda': 2,
    'private': 3,
}

BASE_FILE_PATH = settings.BASE_FILE_PATH

@csrf_exempt
def edit_ideas_and_plans(request, object_id):
    if request.method != 'PUT':
        logger.warning("Invalid request method: Expected PUT.")
        return JsonResponse(
            {'error': 'Only PUT method is allowed'},
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )

    try:
        # Validate Authorization token
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            logger.error("Authorization header missing or malformed.")
            return JsonResponse(
                {'error': 'Authorization header missing or malformed'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        token = auth_header.split(' ')[1]
        try:
            decoded_token = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            user_id = decoded_token.get('user_id')
            if not user_id:
                logger.error("Token is invalid: User ID missing.")
                return JsonResponse(
                    {'error': 'Invalid token: User ID missing'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            updated_by = Aspnetusers.objects.get(id=user_id)
        except jwt.ExpiredSignatureError:
            logger.error("Token has expired.")
            return JsonResponse({'error': 'Token has expired'}, status=status.HTTP_401_UNAUTHORIZED)
        except jwt.InvalidTokenError:
            logger.error("Token is invalid.")
            return JsonResponse({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)
        except Aspnetusers.DoesNotExist:
            logger.error("User does not exist.")
            return JsonResponse({'error': 'User does not exist'}, status=status.HTTP_401_UNAUTHORIZED)

        # Parse multipart form data
        try:
            parser = MultiPartParser(request.META, request, request.upload_handlers)
            parsed_data, parsed_files = parser.parse()
        except Exception as e:
            logger.error(f"Failed to parse multipart form data: {str(e)}")
            return JsonResponse({'error': 'Failed to parse form data'}, status=400)

        # Retrieve the existing object
        try:
            existing_object = Objectinfo.objects.get(objectid=object_id)
        except Objectinfo.DoesNotExist:
            logger.error(f"Object with ID {object_id} does not exist.")
            return JsonResponse({'error': f"Object with ID {object_id} does not exist"}, status=404)

        # Handle file update or removal
        file = parsed_files.get('filePath')
        remove_file = parsed_data.get('removeFile', '').lower() == 'true'

        if file:
            try:
                # Calculate file hash
                file_hash = hashlib.md5(file.read()).hexdigest()
                file.seek(0)  # Reset file pointer after reading

                # Check for duplicate file hash
                duplicate_object = Objectinfo.objects.filter(
                    objectfilehash=file_hash, tenantid=existing_object.tenantid
                ).exclude(objectid=object_id).first()

                if duplicate_object:
                    logger.warning(
                        f"Duplicate file detected. File hash: {file_hash}, Existing Object ID: {duplicate_object.objectid}"
                    )
                    return JsonResponse(
                        {
                            'error': 'Duplicate file detected. A file with the same content already exists.',
                            'existing_object_id': duplicate_object.objectid,
                            'existing_file_name': os.path.basename(duplicate_object.objectfilepath),
                        },
                        status=409,  # HTTP 409 Conflict
                    )

                # Save the new file
                file_name = f"{timezone.now().strftime('%Y%m%d%H%M%S')}_{file.name}"
                file_path = os.path.join(BASE_FILE_PATH, file_name)

                with open(file_path, 'wb') as destination:
                    for chunk in file.chunks():
                        destination.write(chunk)

                # Update the file path and hash in the database
                existing_object.objectfilepath = file_path
                existing_object.objectfilehash = file_hash
                logger.info(f"File saved successfully at {file_path} with hash {file_hash}")
            except Exception as e:
                logger.error(f"Failed to save file: {str(e)}")
                return JsonResponse({'error': 'Failed to save file'}, status=500)

        elif remove_file and existing_object.objectfilepath:
            try:
                # Delete the existing file
                if os.path.exists(existing_object.objectfilepath):
                    os.remove(existing_object.objectfilepath)
                existing_object.objectfilepath = None
                existing_object.objectfilehash = None
                logger.info(f"File removed for object {existing_object.objectid}")
            except Exception as e:
                logger.error(f"Error removing file: {str(e)}")
                return JsonResponse({'error': 'Failed to remove file'}, status=500)

        # Update object fields
        existing_object.objectname = parsed_data.get('name', existing_object.objectname)
        existing_object.objectdescription = parsed_data.get('description', existing_object.objectdescription)
        existing_object.accesscontrol = ACCESS_CONTROL_MAP.get(
            parsed_data.get('accessControl', 'protected').lower(), 1
        )
        existing_object.field_updated = timezone.now()
        existing_object.field_updatedby = updated_by

        existing_object.save()
        logger.info(f"Object with ID {object_id} updated successfully.")

        # Deserialize and update measurements
        measurements = json.loads(parsed_data.get('measurements', '{}'))
        logger.debug(f"Deserialized measurements: {measurements}")

        # Clear and update measurements
        Propertyint.objects.filter(objectid=existing_object).delete()
        for key, data in measurements.items():
            Propertyint.objects.create(
                objectid=existing_object,
                propertyname=key,
                value=data.get('value', 0),
                comment=data.get('comment', ''),
                sortcode=0,
                field_created=timezone.now(),
                field_createdby=updated_by,
                field_updated=timezone.now(),
                field_updatedby=updated_by,
            )

        logger.info(f"Measurements updated for Object ID {object_id}.")
        return JsonResponse({'message': 'Object updated successfully!', 'objectId': object_id}, status=200)

    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        return JsonResponse({'error': f"Internal Server Error: {str(e)}"}, status=500)
