from rest_framework import serializers
from .models import Aspnetusers  # Adjust the import to your app's structure

class AspnetusersSerializer(serializers.ModelSerializer):
    class Meta:
        model = Aspnetusers
        fields = '__all__'
