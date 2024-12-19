from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.conf import settings
from ..models import Rubricinfo, Objectinfo, Objectlinkobject, Propertyfloat, Propertystring,Propertyint
import jwt
from jwt import ExpiredSignatureError, InvalidTokenError
from rest_framework import status
from django.db import transaction, IntegrityError 

@csrf_exempt
def delete_rubric(request, rubric_id):
    if request.method != 'DELETE':
        return JsonResponse(
            {'error': 'Only DELETE method is allowed'},
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )

    # Token authentication
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
        if not user_id:
            return JsonResponse(
                {'error': 'Invalid token: User ID missing'},
                status=status.HTTP_401_UNAUTHORIZED
            )
    except ExpiredSignatureError:
        return JsonResponse({'error': 'Token has expired'}, status=status.HTTP_401_UNAUTHORIZED)
    except InvalidTokenError:
        return JsonResponse({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)

    try:
        with transaction.atomic():
            # Recursively delete child rubrics
            def delete_child_rubrics(parent_id):
                child_rubrics = Rubricinfo.objects.filter(parentid=parent_id)
                for child in child_rubrics:
                    delete_child_rubrics(child.rubricid)  # Recursively delete children
                    print(f"Deleting child rubric: {child.rubricid}")

                    # Handle dependent ObjectInfo entries for the child rubric
                    Objectinfo.objects.filter(rubricid=child.rubricid).update(rubricid=None)

                    # Delete the child rubric
                    child.delete()

            print(f"Recursively deleting child rubrics for rubric_id={rubric_id}")
            delete_child_rubrics(rubric_id)

            # Handle dependent ObjectInfo entries for the current rubric
            print(f"Updating ObjectInfo entries to remove references to rubric_id={rubric_id}")
            Objectinfo.objects.filter(rubricid=rubric_id).update(rubricid=None)

            # Finally, delete the rubric
            print(f"Deleting Rubricinfo with rubric_id={rubric_id}")
            rubric = Rubricinfo.objects.get(rubricid=rubric_id)
            rubric.delete()

        return JsonResponse({'message': 'Rubric and related objects deleted successfully'}, status=status.HTTP_200_OK)

    except Rubricinfo.DoesNotExist:
        print(f"Rubricinfo with rubric_id={rubric_id} not found.")
        return JsonResponse({'error': 'Rubric not found'}, status=status.HTTP_404_NOT_FOUND)
    except IntegrityError as e:
        print(f"Database integrity error: {str(e)}")
        return JsonResponse({'error': f'Database integrity error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"Error deleting rubric: {error_details}")
        return JsonResponse({'error': f'Unexpected error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
