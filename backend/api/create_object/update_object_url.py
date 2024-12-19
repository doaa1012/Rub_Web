from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from ..models import Objectinfo
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
@api_view(['PATCH'])
@permission_classes([AllowAny])  
def update_object_url(request, objectid):
    try:
        obj = Objectinfo.objects.get(objectid=objectid)
        obj.objectnameurl = request.data.get('objectnameurl', obj.objectnameurl)
        obj.save()

        # Return the updated URL along with the success message
        return Response({
            "message": "Object URL updated successfully!",
            "updated_url": obj.objectnameurl
        })
    except Objectinfo.DoesNotExist:
        return Response({"error": "Object not found."}, status=404)
    except Exception as e:
        # Log the error to help with debugging
        print(f"Error updating object URL: {e}")
        return Response({"error": "Internal Server Error"}, status=500)



