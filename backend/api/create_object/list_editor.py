from django.shortcuts import render
from ..models import Objectinfo, Typeinfo,Rubricinfo
from django.http import JsonResponse

from django.db.models import Q
from django.http import JsonResponse

def get_rubric_from_objectnameurl(request, objectnameurl):
    try:
        # First, check in Objectinfo for a match
        objectinfo = Objectinfo.objects.filter(objectnameurl__iexact=objectnameurl).first()
        if objectinfo:
            # If an object is found, check if it has an associated rubric
            rubric_name = None
            if objectinfo.rubricid:
                rubric = Rubricinfo.objects.filter(rubricid=objectinfo.rubricid_id).first()
                rubric_name = rubric.rubricname if rubric else None

            return JsonResponse({
                'source': 'Objectinfo',
                'rubricname': rubric_name
            })

        # If not found in Objectinfo, check in Rubricinfo
        rubricinfo = Rubricinfo.objects.filter(rubricnameurl__iexact=objectnameurl).first()
        if rubricinfo:
            return JsonResponse({
                'source': 'Rubricinfo',
                'rubricname': rubricinfo.rubricname
            })

        # If not found in either table
        return JsonResponse({'error': 'Object not found in Objectinfo or Rubricinfo'}, status=404)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


def list_editor_view(request):

    # Retrieve Typeinfo objects
    types = Typeinfo.objects.all()

    # Prepare data to be serialized
    data = []
    for type_obj in types:
        count = Objectinfo.objects.filter(typeid=type_obj).count()  # Count linked objects in Objectinfo
        data.append({
            'typeid': {
                'typename': type_obj.typename,
                'urlprefix': type_obj.urlprefix,
            },
            'count': count,
            'tablename': type_obj.tablename,
            'comment': type_obj.typecomment,
        })

    return JsonResponse(data, safe=False)


