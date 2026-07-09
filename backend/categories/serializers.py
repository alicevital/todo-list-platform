from rest_framework import serializers
from .models import Category

class CategorySerializer(serializers.ModelSerializer):
    owner = serializers..ReadOnlyField(source="owner.username")

    class Meta:
        model = Category
        fields = "__all__"
        read_only_fields = ["owner"]