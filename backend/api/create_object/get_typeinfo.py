# views.py

from django.http import JsonResponse
from ..models import Typeinfo

def get_typeinfo(request):
    types = Typeinfo.objects.values('typeid', 'typename')
    return JsonResponse(list(types), safe=False)

