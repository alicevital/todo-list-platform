from rest_framework import serializers
from .models import Task

class TaskSerializer(serializers.ModelSerializer):

    owner = serializers.ReadOnlyField(source="owner.username")

    class Meta:
        model = Task 
        fields = "__all__"
        read_only_fields = ["owner", "created_at", "updated_at"]