from django.db.models import Q
from django.http import JsonResponse
from .models import Objectinfo, Objectlinkobject, Sample, Composition
from django.views.decorators.csrf import csrf_exempt
import json
from django.utils.timezone import make_aware, localtime
from datetime import datetime
from math import ceil


@csrf_exempt
def object_search_view(request):
    try:
        # Parse the request payload
        payload = json.loads(request.body)
        typename = payload.get('typename')
        associated_types = payload.get('associatedTypes', [])
        chemical_system = payload.get('chemicalSystem', '')
        created_from = payload.get('createdFrom')
        created_to = payload.get('createdTo')
        elements_with_percentage = payload.get('elements', [])  # [{'element': 'Fe', 'percentage': 10}]
        page = payload.get('page', 1)
        page_size = payload.get('pageSize', 10)

        if not typename:
            return JsonResponse({'error': 'Typename is required.'}, status=400)

        # Query Objectinfo based on typename
        objects = Objectinfo.objects.filter(typeid__typename=typename)

        # Apply date filters
        if created_from:
            created_from = make_aware(datetime.strptime(created_from, "%Y-%m-%d"))
            objects = objects.filter(field_created__gte=created_from)

        if created_to:
            created_to = make_aware(datetime.strptime(created_to, "%Y-%m-%d"))
            objects = objects.filter(field_created__lte=created_to)

        # Filter by associated types
        if associated_types:
            objects = objects.filter(
                objectlinkobject__linkedobjectid__typeid__typename__in=associated_types
            ).distinct()

        # Filter by chemical system
        if chemical_system:
            chemical_elements = [elem.strip() for elem in chemical_system.split('-') if elem.strip()]
            element_queries = Q()
            for element in chemical_elements:
                element_queries |= Q(sample__elements__icontains=f"-{element}-")
            objects = objects.filter(element_queries).distinct()

        # Filter by element percentage
        if elements_with_percentage:
            for element_percentage in elements_with_percentage:
                element = element_percentage.get('element')
                percentage = element_percentage.get('percentage')

                # Safely validate input values
                if element and percentage is not None:
                    objects = objects.filter(
                        sample__composition__elementname=element,
                        sample__composition__valuepercent__lte=percentage
                    ).distinct()

        # Pagination
        total_results = objects.count()
        total_pages = ceil(total_results / page_size)
        start_index = (page - 1) * page_size
        end_index = start_index + page_size
        objects = objects[start_index:end_index]

        # Prepare results
        results = []
        for obj in objects:
            linked_types = obj.objectlinkobject_set.values(
                'linkedobjectid__objectid',
                'linkedobjectid__typeid__typename'
            )

            # Fetch sample and compositions safely
            sample = Sample.objects.filter(sampleid=obj.objectid).first()
            compositions = []
            if sample:
                compositions = Composition.objects.filter(sampleid=sample)

            # Format created time with AM/PM
            created_time = localtime(obj.field_created).strftime("%m/%d/%Y %I:%M:%S %p")

            results.append({
                'objectid': obj.objectid,
                'objectname': obj.objectname,
                'typename': obj.typeid.typename,
                'associatedTypes': [
                    link['linkedobjectid__typeid__typename'] for link in linked_types
                ],
                'created': created_time,
                'elements': sample.elements if sample else '',
                'compositions': [
                    {
                        'element': comp.elementname,
                        'percentage': comp.valuepercent
                    } for comp in compositions
                ],
            })

        return JsonResponse({
            'results': results,
            'totalPages': total_pages,
            'currentPage': page,
        }, safe=False)

    except Exception as e:
        import traceback
        print("Error in object_search_view:", traceback.format_exc())
        return JsonResponse({'error': 'An internal server error occurred.'}, status=500)
