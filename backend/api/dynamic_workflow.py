from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from .models import Typeinfo, Workflow, Stage
import json
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.core.paginator import Paginator
from .models import Objectinfo, Objectlinkobject, Workflow

# Get available typenames
def get_typenames(request):
    # Fetch all available typename entries from the Typeinfo model
    typenamelist = list(Typeinfo.objects.values_list('typename', flat=True))
    return JsonResponse({'typenames': typenamelist})


# Save Workflow
@csrf_exempt
def save_workflow(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        title = data.get('title', 'Untitled Workflow')
        stages_data = data.get('stages', [])

        # Create Workflow
        workflow = Workflow.objects.create(title=title)

        # Create Stages
        for stage_data in stages_data:
            stage_name = stage_data.get('name', 'Unnamed Stage')
            typenames = stage_data.get('typenames', [])
            steps = stage_data.get('steps', [])
            Stage.objects.create(
                workflow=workflow,
                name=stage_name,
                typenames=typenames,
                steps=steps
            )

        return JsonResponse({'message': 'Workflow saved successfully!', 'workflow_id': workflow.id})


# Retrieve all workflows
def get_workflows(request):
    workflows = Workflow.objects.all()
    workflow_list = []
    for workflow in workflows:
        stages = workflow.stages.all()
        workflow_data = {
            'id': workflow.id,
            'title': workflow.title,
            'stages': [{'name': stage.name, 'typenames': stage.typenames, 'steps': stage.steps} for stage in stages]
        }
        workflow_list.append(workflow_data)

    # Make sure the return statement is inside the function
    return JsonResponse({'workflows': workflow_list})


# Retrieve a specific workflow detail
@api_view(['GET'])
def get_workflow_detail(request, id):
    try:
        workflow = Workflow.objects.get(id=id)
        stages = workflow.stages.all().values('id', 'name', 'typenames', 'steps')
        return Response({
            "id": workflow.id,
            "title": workflow.title,
            "created_at": workflow.created_at,
            "stages": list(stages)  # Convert queryset to list of dictionaries
        })
    except Workflow.DoesNotExist:
        return Response({"error": "Workflow not found"}, status=404)


from django.http import JsonResponse
from django.core.paginator import Paginator
from .models import Workflow, Objectinfo, Objectlinkobject

def get_sample_associated_data_workflow(request, workflow_id):
    try:
        # Fetch the workflow and its stages
        workflow = Workflow.objects.get(id=workflow_id)
        stages = workflow.stages.all().values('id', 'name', 'steps')

        table_data = []
        column_headers = []

        # Build columns based on stage and typename
        for stage in stages:
            step_typenames = []
            for step in stage['steps']:
                typenames = step.get('typenames', [])
                step_typenames.extend(typenames)

            # Add each typename as a sub-column under the stage
            column_headers.append({
                'stage_name': stage['name'],
                'typenames': step_typenames
            })

        # Get all samples (main objects) and ensure the query is ordered
        samples = Objectinfo.objects.filter(typeid__typename='Sample').order_by('objectid')  # Ensure the query is ordered

        # Pagination logic
        paginator = Paginator(samples, 10)  # Paginate by 10 samples per page
        page_number = request.GET.get('page', 1)  # Get the page number from request, default to 1
        page_obj = paginator.get_page(page_number)  # Get the appropriate page

        # Loop through paginated samples and match linked/reverse-linked objects
        for sample in page_obj:
            row = {
                'objectid': sample.objectid,
                'objectname': sample.objectname,
                'data': {}  # Store data for each typename under stages
            }

            # Loop through each stage and typename to populate the row
            for stage in column_headers:
                stage_name = stage['stage_name']
                row['data'][stage_name] = {}

                # Check linked and reverse-linked objects
                linked_objects = Objectlinkobject.objects.filter(objectid=sample.objectid)
                reverse_linked_objects = Objectlinkobject.objects.filter(linkedobjectid=sample.objectid)

                linked_object_ids = linked_objects.values_list('linkedobjectid', flat=True)
                reverse_linked_object_ids = reverse_linked_objects.values_list('objectid', flat=True)

                all_object_ids = set(linked_object_ids).union(set(reverse_linked_object_ids))

                related_objects = Objectinfo.objects.filter(objectid__in=all_object_ids)

                # Check main sample and linked/reverse-linked objects for each typename
                for typename in stage['typenames']:
                    # Check if the main sample matches the typename
                    sample_match = sample.typeid.typename == typename

                    # Check if any linked or reverse-linked objects match the typename
                    linked_match = any(obj.typeid.typename == typename for obj in related_objects)

                    # Mark as '✓' if either the sample or linked objects match the typename
                    row['data'][stage_name][typename] = '✓' if sample_match or linked_match else '✗'

            table_data.append(row)

        # Return the data along with pagination info
        return JsonResponse({
            'columns': column_headers,
            'data': table_data,
            'page_number': page_obj.number,
            'total_pages': paginator.num_pages,
        })

    except Workflow.DoesNotExist:
        return JsonResponse({"error": "Workflow not found"}, status=404)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)  # Catch all exceptions
