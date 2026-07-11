from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated

from .models import Task
from .permissions import IsTaskOwnerOrReadOnly
from .serializers import TaskSerializer


class TaskPagination(PageNumberPagination):
    page_size = 2


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [
        IsAuthenticated,
        IsTaskOwnerOrReadOnly,
    ]
    pagination_class = TaskPagination

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    filterset_fields = [
        "completed",
        "category",
        "due_date",
    ]

    search_fields = [
        "title",
        "description",
    ]

    ordering_fields = [
        "created_at",
        "updated_at",
        "due_date",
        "title",
    ]

    def get_queryset(self):
        user = self.request.user

        return (
            Task.objects.filter(
                Q(owner=user) | Q(shared_with=user)
            )
            .distinct()
            .order_by("-created_at")
        )

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
