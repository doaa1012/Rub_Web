

from django.utils.timezone import now
from django.http import JsonResponse
from ..models import Propertybigstring, Propertyfloat, Propertyint, Propertystring, Objectinfo, Aspnetusers
from django.views.decorators.csrf import csrf_exempt
import json
import jwt
from django.conf import settings

@csrf_exempt
def save_property(request):
    if request.method != 'POST':
        return JsonResponse(
            {'error': 'Only POST method is allowed'},
            status=405
        )

    try:
        # Extract and validate Authorization token
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse(
                {'error': 'Authorization header missing or malformed'},
                status=401
            )

        token = auth_header.split(' ')[1]
        try:
            decoded_token = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            user_id = decoded_token.get('user_id')
        except jwt.ExpiredSignatureError:
            return JsonResponse({'error': 'Token has expired'}, status=401)
        except jwt.InvalidTokenError:
            return JsonResponse({'error': 'Invalid token'}, status=401)

        if not user_id:
            return JsonResponse({'error': 'Invalid token: User ID missing'}, status=401)

        # Retrieve the user object
        try:
            created_by = Aspnetusers.objects.get(id=user_id)
        except Aspnetusers.DoesNotExist:
            return JsonResponse({'error': 'User does not exist'}, status=404)

        # Parse JSON data from the request body
        data = json.loads(request.body)

        # Extract data
        property_type = data.get('propertyType')
        object_id = data.get('objectId')
        row = data.get('row')
        property_name = data.get('name')
        value = data.get('value')
        sort_code = data.get('sortCode', 0)
        comment = data.get('comment', '')
        source_object_id = data.get('sourceObjectId')

        # Validate object_id
        try:
            object_instance = Objectinfo.objects.get(objectid=object_id)
        except Objectinfo.DoesNotExist:
            return JsonResponse({'error': 'Objectinfo does not exist'}, status=404)

        # Validate and cast numeric fields
        try:
            row = int(row) if row else None
            source_object_id = int(source_object_id) if source_object_id else None
        except ValueError:
            return JsonResponse({'error': 'Invalid row or sourceObjectId value'}, status=400)

        # Create the property based on the property type
        if property_type == 'string':
            Propertystring.objects.create(
                objectid=object_instance,
                row=row,
                propertyname=property_name,
                value=value,
                sortcode=sort_code,
                comment=comment,
                sourceobjectid_id=source_object_id,
                field_created=now(),
                field_updated=now(),
                field_createdby=created_by,
                field_updatedby=created_by,
            )
        elif property_type == 'float':
            value_epsilon = data.get('valueEpsilon')
            value_epsilon = float(value_epsilon) if value_epsilon else None
            Propertyfloat.objects.create(
                objectid=object_instance,
                row=row,
                propertyname=property_name,
                value=float(value),
                valueepsilon=value_epsilon,
                sortcode=sort_code,
                comment=comment,
                sourceobjectid_id=source_object_id,
                field_created=now(),
                field_updated=now(),
                field_createdby=created_by,
                field_updatedby=created_by,
            )
        elif property_type == 'int':
            Propertyint.objects.create(
                objectid=object_instance,
                row=row,
                propertyname=property_name,
                value=int(value),
                sortcode=sort_code,
                comment=comment,
                sourceobjectid_id=source_object_id,
                field_created=now(),
                field_updated=now(),
                field_createdby=created_by,
                field_updatedby=created_by,
            )
        elif property_type == 'bigstring':
            Propertybigstring.objects.create(
                objectid=object_instance,
                row=row,
                propertyname=property_name,
                value=value,
                sortcode=sort_code,
                comment=comment,
                sourceobjectid_id=source_object_id,
                field_created=now(),
                field_updated=now(),
                field_createdby=created_by,
                field_updatedby=created_by,
            )
        else:
            return JsonResponse({'error': 'Invalid property type'}, status=400)

        return JsonResponse({'message': 'Property saved successfully'}, status=201)

    except Exception as e:
        print(f"Unexpected error occurred: {e}")
        return JsonResponse({'error': f"Internal Server Error: {str(e)}"}, status=500)
