import jwt
from django.http import JsonResponse
from django.conf import settings
from ..models import Objectinfo

def recent_objects_view(request):
    auth_header = request.headers.get('Authorization', None)
    if not auth_header or not auth_header.startswith("Bearer "):
        return JsonResponse({'error': 'Token missing or invalid'}, status=403)

    token = auth_header.split(' ')[1]

    try:
        decoded_token = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        user_id = decoded_token.get("user_id")
        
        if not user_id:
            return JsonResponse({'error': 'Invalid token payload'}, status=401)

        # Retrieve recent objects for the user
        recent_objects = (
            Objectinfo.objects.filter(field_createdby=user_id)
            .order_by('-field_created')[:5]
            .values('objectid', 'objectname', 'field_created')
        )
        return JsonResponse(list(recent_objects), safe=False)

    except jwt.ExpiredSignatureError:
        return JsonResponse({'error': 'Token has expired'}, status=401)
    except jwt.InvalidTokenError as e:
        return JsonResponse({'error': f'Invalid token: {str(e)}'}, status=401)
    


def recent_activities_view(request):
    recent_activities = (
        Objectinfo.objects.exclude(objectname__isnull=True)  # Exclude entries without a name
        .exclude(field_updated__isnull=True)  # Exclude entries without an update date
        .order_by('-field_updated')[:10]  # Sort by the most recent update
        .values('objectid', 'objectname', 'field_updated')
    )

    # Format data for the frontend
    formatted_activities = [
        {
            "id": activity["objectid"],
            "name": activity["objectname"],
            "updated_at": activity["field_updated"].isoformat()  # Ensure ISO format for dates
        }
        for activity in recent_activities
    ]

    return JsonResponse(formatted_activities, safe=False)
