from django.utils.timezone import now
from django.http import JsonResponse
from ..models import Propertybigstring, Propertyfloat, Propertyint, Propertystring,Aspnetusers
from django.views.decorators.csrf import csrf_exempt
import json
import jwt
from django.conf import settings

def get_property(request, property_id):
    try:
        # Iterate through property models to find the matching property ID
        for model, prop_type in [
            (Propertystring, 'String'),
            (Propertyfloat, 'Float'),
            (Propertyint, 'Int'),
            (Propertybigstring, 'Big String')
        ]:
            try:
                property_instance = model.objects.get(pk=property_id)
                # Prepare response data based on the model
                property_data = {
                    'id': property_id,
                    'type': prop_type,
                    'name': property_instance.propertyname,
                    'value': property_instance.value,
                    'valueEpsilon': getattr(property_instance, 'valueepsilon', None),  # Only exists for Propertyfloat
                    'sortCode': property_instance.sortcode,
                    'row': property_instance.row,
                    'comment': property_instance.comment,
                    'sourceObjectId': property_instance.sourceobjectid_id,
                }
                return JsonResponse(property_data, status=200)
            except model.DoesNotExist:
                continue  # Try the next model

        # If not found in any model, return 404
        return JsonResponse({'error': 'Property not found'}, status=404)

    except Exception as e:
        import traceback
        traceback.print_exc()  # Log the error for debugging
        return JsonResponse({'error': f'Internal server error: {str(e)}'}, status=500)

@csrf_exempt
def edit_property(request, property_id):
    if request.method != 'PUT':
        return JsonResponse(
            {'error': 'Only PUT method is allowed'},
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
            updated_by = Aspnetusers.objects.get(id=user_id)
        except Aspnetusers.DoesNotExist:
            return JsonResponse({'error': 'User does not exist'}, status=404)

        # Parse JSON data from the request body
        data = json.loads(request.body)

        # Extract data
        property_type = data.get('propertyType')
        if not property_type:
            return JsonResponse({'error': 'Property type is required'}, status=400)

        # Retrieve the property instance based on its type
        property_instance = None
        try:
            if property_type == 'string':
                property_instance = Propertystring.objects.get(pk=property_id)
            elif property_type == 'Float':
                property_instance = Propertyfloat.objects.get(pk=property_id)
            elif property_type == 'Int':
                property_instance = Propertyint.objects.get(pk=property_id)
            elif property_type == 'Bigstring':
                property_instance = Propertybigstring.objects.get(pk=property_id)
            else:
                return JsonResponse({'error': 'Invalid property type'}, status=400)
        except Exception:
            return JsonResponse({'error': 'Property does not exist'}, status=404)

        # Update the fields for the property instance
        property_instance.propertyname = data.get('name', property_instance.propertyname)
        property_instance.value = data.get('value', property_instance.value)
        property_instance.sortcode = data.get('sortCode', property_instance.sortcode)
        property_instance.comment = data.get('comment', property_instance.comment)
        property_instance.row = data.get('row', property_instance.row)
        property_instance.sourceobjectid_id = data.get('sourceObjectId', property_instance.sourceobjectid_id)
        property_instance.field_updated = now()
        property_instance.field_updatedby = updated_by

        # Update additional fields specific to `Propertyfloat`
        if property_type == 'float':
            property_instance.valueepsilon = data.get('valueEpsilon', property_instance.valueepsilon)

        # Save the updated property
        property_instance.save()

        return JsonResponse({'message': 'Property updated successfully'}, status=200)

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON format'}, status=400)
    except (Propertystring.DoesNotExist, Propertyfloat.DoesNotExist, Propertyint.DoesNotExist, Propertybigstring.DoesNotExist):
        return JsonResponse({'error': 'Property does not exist'}, status=404)
    except Exception as e:
        # Log unexpected exceptions for debugging
        import logging
        logger = logging.getLogger(__name__)
        logger.exception("Unexpected error occurred in edit_property")
        return JsonResponse({'error': f"Internal Server Error: {str(e)}"}, status=500)


@csrf_exempt
def delete_property(request, property_id):
    if request.method == 'DELETE':
        print(f"Received DELETE request for property ID: {property_id}")
        try:
            # Retrieve the property type from query parameters
            property_type = request.GET.get('propertyType')
            if not property_type:
                return JsonResponse({'error': 'Property type is required'}, status=400)

            # Map property type to the corresponding model
            property_model_map = {
                'string': Propertystring,
                'float': Propertyfloat,
                'int': Propertyint,
                'bigstring': Propertybigstring,
            }

            model = property_model_map.get(property_type.lower())
            if not model:
                return JsonResponse({'error': 'Invalid property type'}, status=400)

            # Retrieve and delete the property
            property_instance = model.objects.get(pk=property_id)
            property_instance.delete()
            return JsonResponse({'message': 'Property deleted successfully'}, status=200)
        except model.DoesNotExist:
            return JsonResponse({'error': 'Property not found'}, status=404)
        except Exception as e:
            return JsonResponse({'error': f'Error deleting property: {str(e)}'}, status=500)
    return JsonResponse({'error': 'Invalid request method'}, status=405)
