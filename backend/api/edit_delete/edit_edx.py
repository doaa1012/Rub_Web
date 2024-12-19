from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from django.db import transaction
import os
import jwt
import hashlib
import csv
from datetime import datetime
from jwt.exceptions import ExpiredSignatureError, InvalidTokenError
from ..models import Objectinfo, Typeinfo, Rubricinfo, Aspnetusers, Composition, Elementinfo, Sample
from django.utils import timezone
from rest_framework import status
import traceback

BASE_FILE_PATH = settings.BASE_FILE_PATH
ACCESS_CONTROL_MAP = {
    'public': 0,
    'protected': 1,
    'protectednda': 2,
    'private': 3
}

@csrf_exempt
def edit_main_and_child_objects(request, object_id):
    if request.method != 'PUT':
        return JsonResponse({'error': 'Only PUT method is allowed'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

    try:
        print(f"Processing update for object ID: {object_id}")

        # Token validation
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Authorization header missing or malformed'}, status=status.HTTP_401_UNAUTHORIZED)

        token = auth_header.split(' ')[1]
        try:
            decoded_token = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            user_id = decoded_token.get('user_id')
            user_instance = Aspnetusers.objects.get(id=user_id)
        except Aspnetusers.DoesNotExist:
            return JsonResponse({'error': 'Authenticated user does not exist'}, status=status.HTTP_401_UNAUTHORIZED)
        except ExpiredSignatureError:
            return JsonResponse({'error': 'Token has expired'}, status=status.HTTP_401_UNAUTHORIZED)
        except InvalidTokenError:
            return JsonResponse({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)

        print(f"Authenticated user ID: {user_id}")

        # Fetch the main object
        try:
            main_object = Objectinfo.objects.get(objectid=object_id)
            print(f"Fetched main object: {main_object.objectname} (ID: {main_object.objectid})")
        except Objectinfo.DoesNotExist:
            return JsonResponse({'error': 'Main object with provided ID does not exist'}, status=status.HTTP_404_NOT_FOUND)

        # Extract data from request.POST and request.FILES
        object_name = request.POST.get('name', main_object.objectname)
        description = request.POST.get('description', main_object.objectdescription)
        rubric_id = request.POST.get('rubricId')
        sort_code = request.POST.get('sortCode', main_object.sortcode)
        access_control_value = request.POST.get('accessControl', '').lower()
        access_control = ACCESS_CONTROL_MAP.get(access_control_value, main_object.accesscontrol)
        file_removed = request.POST.get('fileRemoved', 'false').lower() == 'true'
        file = request.FILES.get('filePath')

        # Handle file upload
        if file:
            file_path = os.path.join(BASE_FILE_PATH, file.name)
            file_hash = hashlib.md5(file.read()).hexdigest()
            file.seek(0)  # Reset file pointer for saving

            with open(file_path, 'wb') as destination:
                for chunk in file.chunks():
                    destination.write(chunk)
            print(f"Uploaded new file: {file_path}")

            # Update file details in the main object
            main_object.objectfilepath = file_path
            main_object.objectfilehash = file_hash

        # Update main object fields
        main_object.objectname = object_name
        main_object.objectdescription = description
        main_object.sortcode = int(sort_code)
        main_object.accesscontrol = access_control

        # Handle rubric ID
        if rubric_id:
            try:
                rubric_instance = Rubricinfo.objects.get(rubricid=rubric_id)
                main_object.rubricid = rubric_instance
            except Rubricinfo.DoesNotExist:
                return JsonResponse({'error': 'Rubric with the provided ID does not exist'}, status=status.HTTP_404_NOT_FOUND)

        main_object.field_updated = timezone.now()
        main_object.field_updatedby = user_instance
        main_object.save()
        print("Main object updated successfully.")

        # Process child objects
        with transaction.atomic():
            child_objects = Objectinfo.objects.filter(objectlinkobject_linkedobjectid_set__objectid=main_object)
            valid_elements = {element.elementname: element for element in Elementinfo.objects.all()}
            for child_object in child_objects:
                print(f"Processing child object: {child_object.objectname} (ID: {child_object.objectid})")
                # Process associated samples and compositions
                child_sample, created = Sample.objects.get_or_create(
                    sampleid=child_object,
                    defaults={
                        'elemnumber': 0,
                        'elements': ''
                    }
                )
                if not created:
                    print(f"Existing sample found for child object: {child_sample.sampleid}")

                # Process file data for compositions
                if file:
                    with open(file_path, 'r') as csv_file:
                        reader = csv.DictReader(csv_file)
                        for row in reader:
                            for element_name, value_percent in row.items():
                                if element_name in ['Index', 'description'] or not value_percent:
                                    continue
                                if element_name not in valid_elements:
                                    continue

                                value_percent = float(value_percent)
                                value_absolute = value_percent * 0.01

                                composition, comp_created = Composition.objects.update_or_create(
                                    sampleid=child_sample,
                                    elementname=element_name,
                                    defaults={
                                        'valueabsolute': value_absolute,
                                        'valuepercent': value_percent
                                    }
                                )
                                if comp_created:
                                    print(f"Created new composition for element {element_name}")
                                else:
                                    print(f"Updated composition for element {element_name}")

                # Update child object fields
                child_object.field_updated = timezone.now()
                child_object.field_updatedby = user_instance
                child_object.save()

        return JsonResponse({'success': 'Data updated successfully'}, status=200)

    except Exception as e:
        print("An unexpected error occurred:", traceback.format_exc())
        return JsonResponse({'error': f"Internal Server Error: {str(e)}"}, status=500)
