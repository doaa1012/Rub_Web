from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from django.utils import timezone
from rest_framework import status
from ..models import Objectinfo, Typeinfo, Rubricinfo, Aspnetusers, Reference, Tenant
import jwt

BASE_FILE_PATH = settings.BASE_FILE_PATH
ACCESS_CONTROL_MAP = {
    'public': 0,
    'protected': 1,
    'protectednda': 2,
    'private': 3
}

@csrf_exempt
def edit_reference(request, object_id):
    if request.method != 'PUT':
        return JsonResponse({'error': 'Only PUT method is allowed'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

    try:
        # Validate Authorization token
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Authorization header missing or malformed'}, status=status.HTTP_401_UNAUTHORIZED)

        token = auth_header.split(' ')[1]
        decoded_token = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        user_id = decoded_token.get('user_id')
        if not user_id:
            return JsonResponse({'error': 'Invalid token: User ID missing'}, status=status.HTTP_401_UNAUTHORIZED)

        # Retrieve the existing object
        try:
            existing_object = Objectinfo.objects.get(objectid=object_id)
        except Objectinfo.DoesNotExist:
            return JsonResponse({'error': 'Object not found'}, status=status.HTTP_404_NOT_FOUND)

        # Parse form data
        type_name = request.POST.get('typeId')
        tenant_id = request.POST.get('tenantId')
        rubric_id = request.POST.get('rubricId')
        object_name = request.POST.get('name')
        description = request.POST.get('description', '')
        access_control_value = request.POST.get('accessControl', 'public')
        access_control = ACCESS_CONTROL_MAP.get(access_control_value.lower(), 1)

        # Fetch related objects
        type_info = Typeinfo.objects.get(typename=type_name) if type_name else existing_object.typeid
        tenant = Tenant.objects.get(tenantid=tenant_id) if tenant_id else existing_object.tenantid
        rubric = Rubricinfo.objects.get(rubricid=rubric_id) if rubric_id else existing_object.rubricid
        updated_by = Aspnetusers.objects.get(id=user_id)

        # Update object details
        existing_object.typeid = type_info
        existing_object.tenantid = tenant
        existing_object.rubricid = rubric
        existing_object.objectname = object_name or existing_object.objectname
        existing_object.objectdescription = description
        existing_object.accesscontrol = access_control
        existing_object.field_updated = timezone.now()
        existing_object.field_updatedby = updated_by
        existing_object.save()

        # Update Reference if provided
        authors = request.POST.get('authors')
        title = request.POST.get('title')
        journal = request.POST.get('journal')
        year = request.POST.get('year')
        volume = request.POST.get('volume')
        number = request.POST.get('number')
        start_page = request.POST.get('startPage')
        end_page = request.POST.get('endPage')
        doi = request.POST.get('doi')
        reference_url = request.POST.get('url')
        bibtex = request.POST.get('bibtex')

        if authors or title or year:
            try:
                reference = Reference.objects.get(referenceid=existing_object)
                # Update reference details
                reference.authors = authors or reference.authors
                reference.title = title or reference.title
                reference.journal = journal or reference.journal
                reference.year = int(year) if year else reference.year
                reference.volume = volume or reference.volume
                reference.number = number or reference.number
                reference.startpage = start_page or reference.startpage
                reference.endpage = end_page or reference.endpage
                reference.doi = doi or reference.doi
                reference.url = reference_url or reference.url
                reference.bibtex = bibtex or reference.bibtex
                reference.save()
            except Reference.DoesNotExist:
                if authors and title and year:
                    new_reference = Reference(
                        referenceid=existing_object,
                        authors=authors,
                        title=title,
                        journal=journal,
                        year=int(year),
                        volume=volume,
                        number=number,
                        startpage=start_page,
                        endpage=end_page,
                        doi=doi,
                        url=reference_url,
                        bibtex=bibtex
                    )
                    new_reference.save()

        return JsonResponse({'message': 'Object and Reference updated successfully!'}, status=status.HTTP_200_OK)

    except Exception as e:
        return JsonResponse({'error': f"Internal Server Error: {str(e)}"}, status=500)
