from rest_framework.decorators import api_view
from rest_framework.response import Response
from ..models import Rubricinfo

from rest_framework.permissions import AllowAny
from rest_framework.decorators import permission_classes

@api_view(['GET'])
@permission_classes([AllowAny])  # This allows access to anyone without authentication
def get_rubric_id_by_url(request, rubricnameurl):
    try:
        rubric = Rubricinfo.objects.get(rubricnameurl=rubricnameurl)
        data = {"rubricid": rubric.rubricid}
        return Response(data, status=200)
    except Rubricinfo.DoesNotExist:
        return Response({"error": "Rubric not found"}, status=404)

