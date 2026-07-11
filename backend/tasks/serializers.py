from rest_framework import serializers
from .models import Task
from users.models import User

class TaskSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(
        source="owner.username",
    )

    category_name = serializers.CharField(
        source="category.name",
        read_only=True,
    )

    shared_with = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        many=True,
        required=False,
    )

    class Meta:
        model = Task
        fields = [
            "id",
            "owner",
            "title",
            "description",
            "completed",
            "created_at",
            "updated_at",
            "due_date",
            "shared_with",
            "category",
            "category_name",
        ]

        read_only_fields = [
            "owner",
            "created_at",
            "updated_at",
            "category_name",
        ]

    def validate_category(self, category):
        request = self.context.get("request")

        if category and category.owner != request.user:
            raise serializers.ValidationError(
                "Você só pode utilizar categorias criadas por você."
            )

        return category

    def validate_shared_with(self, users):
        request = self.context.get("request")

        if request.user in users:
            raise serializers.ValidationError(
                "Você não pode compartilhar uma tarefa consigo mesma."
            )

        return users