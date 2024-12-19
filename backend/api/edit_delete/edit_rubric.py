from django.http import JsonResponse
from django.utils import timezone
from django.db.models import Q
from django.views.decorators.csrf import csrf_exempt
from django.template.defaultfilters import slugify
from jwt.exceptions import ExpiredSignatureError, InvalidTokenError
import json
import jwt
from ..models import Rubricinfo, Aspnetusers
from django.conf import settings

# Map access control levels to numeric values
ACCESS_CONTROL_MAP = {
    'public': 0,
    'protected': 1,
    "protectednda": 2,
    'private': 3
}

@csrf_exempt
def edit_rubric(request, rubric_id):
    try:
        # Fetch the existing rubric
        try:
            rubric = Rubricinfo.objects.get(rubricid=rubric_id)
        except Rubricinfo.DoesNotExist:
            return JsonResponse({'error': 'Rubric not found'}, status=404)

        # Handle GET request to fetch rubric details
        if request.method == 'GET':
            return JsonResponse({
                'rubricid': rubric.rubricid,
                'rubricname': rubric.rubricname,
                'sortcode': rubric.sortcode,
                'accesscontrol': rubric.accesscontrol,
                'text': rubric.rubricpath,
                'parentid': rubric.parentid.rubricid if rubric.parentid else None,
                'parentname': rubric.parentid.rubricname if rubric.parentid else None,
            })

        # Handle PUT request for updating rubric
        elif request.method == 'PUT':
            auth_header = request.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                return JsonResponse({'error': 'Unauthorized'}, status=401)

            token = auth_header.split(' ')[1]
            try:
                decoded_token = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
                user_id = decoded_token.get('user_id')
            except (ExpiredSignatureError, InvalidTokenError):
                return JsonResponse({'error': 'Invalid or expired token'}, status=401)

            # Verify user existence
            try:
                updated_by_user = Aspnetusers.objects.get(id=user_id)
            except Aspnetusers.DoesNotExist:
                return JsonResponse({'error': 'User not found'}, status=404)

            # Parse request body
            try:
                data = json.loads(request.body)
            except json.JSONDecodeError:
                return JsonResponse({'error': 'Invalid JSON format'}, status=400)

            # Extract and validate input fields
            new_name = data.get('name', rubric.rubricname)
            parent_id = data.get('parent_id', rubric.parentid.rubricid if rubric.parentid else None)

            # Fetch parent rubric if parent_id changes
            parent_rubric = None
            if parent_id:
                try:
                    parent_rubric = Rubricinfo.objects.get(rubricid=parent_id)
                except Rubricinfo.DoesNotExist:
                    return JsonResponse({'error': 'Parent rubric not found'}, status=404)

            # Update rubricnameurl and rubricpath if name or parent has changed
            rubricname_changed = new_name != rubric.rubricname
            parent_changed = parent_id != (rubric.parentid.rubricid if rubric.parentid else None)

            if rubricname_changed or parent_changed:
                new_rubricnameurl = f"{slugify(parent_rubric.rubricname)}_{slugify(new_name)}".lower() if parent_rubric else slugify(new_name).lower()

                # Duplicate check for tenantid and new rubricnameurl
                if Rubricinfo.objects.filter(Q(tenantid=rubric.tenantid) & Q(rubricnameurl=new_rubricnameurl)).exclude(rubricid=rubric_id).exists():
                    return JsonResponse({'error': 'A rubric with this name already exists under the same tenant.'}, status=400)

                rubric.rubricname = new_name
                rubric.rubricnameurl = new_rubricnameurl
                parent_rubric_path = parent_rubric.rubricpath if parent_rubric else None
                rubric.rubricpath = f"{parent_rubric_path}}}{new_name}" if parent_rubric_path else new_name
                rubric.level = rubric.rubricpath.count('}') + 1

            # Update other fields
            rubric.sortcode = data.get('sort_code', rubric.sortcode)
            rubric.accesscontrol = data.get('access_control', rubric.accesscontrol)
            rubric.field_updated = timezone.now()
            rubric.field_updatedby = updated_by_user
            rubric.parentid = parent_rubric

            # Save updated rubric
            rubric.save()

            return JsonResponse({'message': 'Rubric updated successfully'})

        else:
            return JsonResponse({'error': 'Method not allowed'}, status=405)

    except Exception as e:
        print(f"Unhandled Error: {e}")
        return JsonResponse({'error': 'An unexpected error occurred', 'details': str(e)}, status=500)



@csrf_exempt
def get_rubric_with_parent(request, rubricid):
    try:
        # Retrieve the child rubric and its parent in one query
        child_rubric = Rubricinfo.objects.select_related('parentid').get(rubricid=rubricid)

        # Prepare the response data
        response_data = {
            'rubricid': child_rubric.rubricid,
            'rubricname': child_rubric.rubricname,
            'rubricnameurl': child_rubric.rubricnameurl,
            'parent_rubricid': child_rubric.parentid.rubricid if child_rubric.parentid else None,
            'parent_rubricname': child_rubric.parentid.rubricname if child_rubric.parentid else None
        }

        return JsonResponse(response_data, status=200)
    
    except Rubricinfo.DoesNotExist:
        return JsonResponse({'error': 'Rubric not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
