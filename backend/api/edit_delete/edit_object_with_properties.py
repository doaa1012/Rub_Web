from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
import traceback
import json
import jwt
from ..models import (
    Typeinfo,
    Tenant,
    Aspnetusers,
    Rubricinfo,
    Objectinfo,
    Objectlinkobject,
    Propertyint,
    Propertyfloat,
)
from django.conf import settings
from django.db.models import Max
import os
from rest_framework import status
import hashlib


ACCESS_CONTROL_MAP = {
    'public': 0,
    'protected': 1,
    'protectednda': 2,
    'private': 3,
}
REFERENCE_ELECTRODE_MAP = {
    "Ag/AgCl": 1,
    "Hg/HgO": 2,
    "SHE": 3,
}
BASE_FILE_PATH = settings.BASE_FILE_PATH  # Ensure this is set in your settings

@csrf_exempt
def edit_object_with_properties(request, object_id):
    if request.method != 'POST':
        return JsonResponse(
            {'error': 'Only POST method is allowed'},
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )

    try:
        # Debugging headers and data
        print("Headers:", request.headers)
        print("POST Data:", request.POST)
        print("FILES Data:", request.FILES)

        # Extract and validate Authorization token
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse(
                {'error': 'Authorization header missing or malformed'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        token = auth_header.split(' ')[1]
        try:
            decoded_token = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            user_id = decoded_token.get('user_id')
        except jwt.ExpiredSignatureError:
            return JsonResponse({'error': 'Token has expired'}, status=status.HTTP_401_UNAUTHORIZED)
        except jwt.InvalidTokenError:
            return JsonResponse({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)

        if not user_id:
            return JsonResponse(
                {'error': 'Invalid token: User ID missing'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Fetch the object to edit
        try:
            existing_object = Objectinfo.objects.get(objectid=object_id)
            print("Existing object:", existing_object)
        except Objectinfo.DoesNotExist:
            return JsonResponse({'error': f"Object with ID '{object_id}' not found"}, status=404)

        # Retrieve fields from the request
        rubric_id = request.POST.get('rubricId', existing_object.rubricid_id)
        sort_code = request.POST.get('sortCode', existing_object.sortcode)
        access_control_value = request.POST.get('accessControl', 'protected').lower()
        access_control = ACCESS_CONTROL_MAP.get(access_control_value, existing_object.accesscontrol)
        object_name = request.POST.get('name', existing_object.objectname)
        url = request.POST.get('url', existing_object.objectnameurl)
        description = request.POST.get('description', existing_object.objectdescription)
        properties = request.POST.get('properties')  # JSON string from the frontend

        # Parse and validate properties JSON
        if isinstance(properties, str):
            try:
                properties = json.loads(properties)
            except json.JSONDecodeError as e:
                return JsonResponse({'error': f"Invalid JSON format for properties: {str(e)}"}, status=400)

        if not isinstance(properties, list):
            return JsonResponse({'error': 'Properties must be a list of objects'}, status=400)

        print("Parsed properties:", properties)

        # Handle file saving (optional update)
        file = request.FILES.get('filePath')
        file_path = existing_object.objectfilepath
        if file:
            # Calculate the file hash
            file_hash = hashlib.md5(file.read()).hexdigest()
            file.seek(0)  # Reset file pointer after reading for hash

            # Check if a file with the same hash already exists
            duplicate_object = Objectinfo.objects.filter(objectfilehash=file_hash).exclude(objectid=object_id).first()
            if duplicate_object:
                return JsonResponse(
                    {
                        'error': 'File already exists with the same content.',
                        'existing_object': {
                            'objectId': duplicate_object.objectid,
                            'objectName': duplicate_object.objectname,
                            'createdDate': duplicate_object.field_created,
                            'description': duplicate_object.objectdescription,
                            'url': duplicate_object.objectnameurl,
                        }
                    },
                    status=status.HTTP_409_CONFLICT
                )

            # Save the file to the defined base path
            file_path = os.path.join(BASE_FILE_PATH, file.name)
            with open(file_path, 'wb') as destination:
                for chunk in file.chunks():
                    destination.write(chunk)
            print(f"File saved at: {file_path}")
        url = f"{object_name}-{object_id}"

        # Update the object details
        existing_object.rubricid_id = rubric_id
        existing_object.sortcode = int(sort_code)
        existing_object.accesscontrol = access_control
        existing_object.objectname = object_name
        existing_object.objectnameurl = url
        existing_object.objectdescription = description
        existing_object.objectfilepath = file_path
        existing_object.field_updated = timezone.now()
        existing_object.field_updatedby = Aspnetusers.objects.get(id=user_id)
        existing_object.save()

        print("Object updated successfully:", existing_object)

        # Update properties
        Propertyint.objects.filter(objectid=existing_object).delete()
        Propertyfloat.objects.filter(objectid=existing_object).delete()

        for index, prop in enumerate(properties):
            try:
                name = prop.get('name')
                value = prop.get('value')
                comment = prop.get('comment', '')
                property_type = prop.get('type', '').lower()

                if property_type == 'int':
                    if name == 'Reference Electrode':
                        # Handle Reference Electrode special case
                        if isinstance(value, int):
                            if value not in REFERENCE_ELECTRODE_MAP.values():
                                raise ValueError(f"Invalid mapped value for 'Reference Electrode': {value}")
                        else:
                            value = REFERENCE_ELECTRODE_MAP.get(value)
                            if value is None:
                                raise ValueError(f"Invalid value for 'Reference Electrode': {prop.get('value')}")

                    Propertyint.objects.create(
                        objectid=existing_object,
                        propertyname=name,
                        value=int(value),
                        comment=comment,
                        sortcode=index,
                        field_created=timezone.now(),
                        field_createdby=Aspnetusers.objects.get(id=user_id),
                        field_updated=timezone.now(),
                        field_updatedby=Aspnetusers.objects.get(id=user_id),
                    )
                    print(f"Integer property created: {prop}")

                elif property_type == 'float':
                    Propertyfloat.objects.create(
                        objectid=existing_object,
                        propertyname=name,
                        value=float(value),
                        comment=comment,
                        sortcode=index,
                        field_created=timezone.now(),
                        field_createdby=Aspnetusers.objects.get(id=user_id),
                        field_updated=timezone.now(),
                        field_updatedby=Aspnetusers.objects.get(id=user_id),
                    )
                    print(f"Float property created: {prop}")

                else:
                    raise ValueError(f"Unknown property type for '{name}'")

            except Exception as e:
                print(f"Error updating property: {prop}")
                return JsonResponse({'error': f"Failed to update property '{prop.get('name')}': {str(e)}"}, status=400)

        return JsonResponse({'message': 'Object and properties updated successfully!', 'objectId': existing_object.objectid}, status=200)

    except Exception as e:
        print("Error occurred:", traceback.format_exc())
        return JsonResponse({'error': f"Internal Server Error: {str(e)}"}, status=500)
