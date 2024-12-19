from django.http import JsonResponse
from django.utils import timezone
from django.db.models import Max
from django.views.decorators.csrf import csrf_exempt
from ..models import Objectinfo, Objectlinkobject, Aspnetuserroles, Aspnetusers
from django.db.models import Q
from django.core.paginator import Paginator
import json
import logging
import jwt
from django.conf import settings
import os
logger = logging.getLogger(__name__)

@csrf_exempt
def search_associated_objects(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)

            # Extract parameters
            object_type = data.get('object_type', '')
            search_phrase = data.get('search_phrase', '')
            page = int(data.get('page', 1))
            page_size = int(data.get('page_size', 10))

            # Initialize queryset
            objectinfos = Objectinfo.objects.all()

            # Filter by object type
            if object_type:
                objectinfos = objectinfos.filter(typeid__typename__icontains=object_type)

            # Filter by search phrase
            if search_phrase:
                objectinfos = objectinfos.filter(
                    Q(objectname__icontains=search_phrase) |
                    Q(objectdescription__icontains=search_phrase)
                )

            # Paginate the results
            paginator = Paginator(objectinfos, page_size)
            paginated_results = paginator.get_page(page)

            # Prepare the result data
            results_data = []
            for obj in paginated_results:
                type_name = obj.typeid.typename if obj.typeid else 'Unknown'
                results_data.append({
                    'objectid': obj.objectid,
                    'objectname': obj.objectname,
                    'typeid__typename': type_name,
                    'field_created': obj.field_created,
                    'field_createdby__username': obj.field_createdby.username,
                })

            # Return the paginated results with metadata
            response_data = {
                'results': results_data,
                'page': page,
                'total_pages': paginator.num_pages,
                'total_results': paginator.count,
            }
            return JsonResponse(response_data)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=400)

@csrf_exempt
def update_associated_objects(request):
    if request.method == 'POST':
        try:
            # Log the Authorization header
            auth_header = request.headers.get('Authorization', None)
            logger.info(f"Authorization Header: {auth_header}")

            # Extract and validate the Bearer token
            if not auth_header or not auth_header.startswith('Bearer '):
                logger.warning("Authorization header is missing or improperly formatted.")
                return JsonResponse({'error': 'Authorization header missing or malformed'}, status=401)

            token = auth_header.split(' ')[1]
            logger.info(f"Extracted Token: {token}")

            # Decode the token
            try:
                decoded_token = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
                user_id = decoded_token.get('user_id')
                logger.info(f"Decoded Token User ID: {user_id}")

                if not user_id:
                    logger.error("Invalid token: User ID missing")
                    return JsonResponse({'error': 'Invalid token: User ID missing'}, status=401)

                # Retrieve the user based on the decoded token
                try:
                    user = Aspnetusers.objects.get(id=user_id)
                    logger.info(f"Authenticated User: {user.username} (ID: {user.id})")
                except Aspnetusers.DoesNotExist:
                    logger.error("User not found")
                    return JsonResponse({'error': 'User not found'}, status=404)

            except jwt.ExpiredSignatureError:
                logger.error("Token has expired")
                return JsonResponse({'error': 'Token has expired'}, status=401)
            except jwt.InvalidTokenError:
                logger.error("Invalid token")
                return JsonResponse({'error': 'Invalid token'}, status=401)

            # Check if the user has the PowerUser role
            user_roles = Aspnetuserroles.objects.filter(userid=user.id)
            logger.info(f"User Roles: {list(user_roles.values())}")

            is_power_user = user_roles.filter(roleid__name__iexact='PowerUser').exists()
            logger.info(f"Is PowerUser: {is_power_user}")

            if not is_power_user:
                logger.error("User does not have PowerUser role")
                return JsonResponse({'error': 'User does not have PowerUser role'}, status=403)

            # Parse request data
            data = json.loads(request.body)
            updated_objects = data.get('updatedObjects', [])
            objects_to_delete = data.get('objectsToDelete', [])
            main_object_id = data.get('mainObjectId')
            logger.info(f"Updated Objects: {updated_objects}")
            logger.info(f"Objects to Delete: {objects_to_delete}")
            logger.info(f"Main Object ID: {main_object_id}")

            if not main_object_id:
                logger.error("Main object ID is required")
                return JsonResponse({'error': 'Main object ID is required'}, status=400)

            # Retrieve the main object
            main_object = Objectinfo.objects.get(objectid=main_object_id)
            logger.info(f"Main Object Retrieved: {main_object}")

            # 1. Link new objects
            for obj in updated_objects:
                object_id = obj.get('ObjectId')
                if object_id:
                    linked_object = Objectinfo.objects.get(objectid=object_id)

                    # Check if the object is of type 'composition'
                    if linked_object.typeid.typename.lower() == 'composition':
                        # Fetch all related objects sharing the same rubricid
                        related_objects = Objectinfo.objects.filter(
                            rubricid=linked_object.rubricid
                        )
                        logger.info(f"Related composition objects for linking: {list(related_objects.values_list('objectid', flat=True))}")

                        # Link each related object
                        for related_object in related_objects:
                            existing_link = Objectlinkobject.objects.filter(
                                objectid=main_object,
                                linkedobjectid=related_object
                            ).exists()

                            if not existing_link:
                                max_link_id = Objectlinkobject.objects.aggregate(Max('objectlinkobjectid'))['objectlinkobjectid__max']
                                new_link_id = (max_link_id or 0) + 1

                                link_object = Objectlinkobject(
                                    objectlinkobjectid=new_link_id,
                                    objectid=main_object,
                                    linkedobjectid=related_object,
                                    sortcode=0,
                                    field_created=timezone.now(),
                                    field_createdby=user,
                                    field_updated=timezone.now(),
                                    field_updatedby=user,
                                    linktypeobjectid=None
                                )
                                link_object.save()
                                logger.info(f"Created Link for composition: {link_object}")
                    else:
                        # Regular linking for non-composition objects
                        existing_link = Objectlinkobject.objects.filter(
                            objectid=main_object,
                            linkedobjectid=linked_object
                        ).exists()

                        if not existing_link:
                            max_link_id = Objectlinkobject.objects.aggregate(Max('objectlinkobjectid'))['objectlinkobjectid__max']
                            new_link_id = (max_link_id or 0) + 1

                            link_object = Objectlinkobject(
                                objectlinkobjectid=new_link_id,
                                objectid=main_object,
                                linkedobjectid=linked_object,
                                sortcode=0,
                                field_created=timezone.now(),
                                field_createdby=user,
                                field_updated=timezone.now(),
                                field_updatedby=user,
                                linktypeobjectid=None
                            )
                            link_object.save()
                            logger.info(f"Created Link: {link_object}")

            # 2. Remove links for deleted objects
            if objects_to_delete:
                logger.info(f"Attempting to delete links for Main Object ID: {main_object_id} and Linked Object IDs: {objects_to_delete}")

                # Check if any of the objects to delete are of type 'composition'
                composition_objects = Objectinfo.objects.filter(
                    objectid__in=objects_to_delete,
                    typeid__typename__iexact='composition'
                )

                if composition_objects.exists():
                    # Fetch the rubric IDs of composition objects
                    composition_rubric_ids = composition_objects.values_list('rubricid', flat=True)
                    logger.info(f"Rubric IDs for 'composition' objects: {list(composition_rubric_ids)}")

                    # Fetch all related objects sharing the same rubric IDs
                    related_objects = Objectinfo.objects.filter(
                        rubricid__in=composition_rubric_ids
                    ).values_list('objectid', flat=True)

                    logger.info(f"Related Object IDs sharing the same Rubric IDs: {list(related_objects)}")

                    # Delete links for related objects
                    deleted_count_composition, _ = Objectlinkobject.objects.filter(
                        objectid=main_object,
                        linkedobjectid__in=related_objects
                    ).delete()

                    logger.info(f"Successfully deleted {deleted_count_composition} links for composition-related objects.")

                # Delete links for other objects
                deleted_count_general, _ = Objectlinkobject.objects.filter(
                    objectid=main_object,
                    linkedobjectid__in=objects_to_delete
                ).delete()

                logger.info(f"Successfully deleted {deleted_count_general} general links.")

            return JsonResponse({'message': 'Successfully updated associated objects and links'})

        except Exception as e:
            logger.error(f"Error in update_associated_objects: {str(e)}")
            return JsonResponse({'error': f'Internal Server Error: {str(e)}'}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=400)
