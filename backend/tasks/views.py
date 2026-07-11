from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Task
from rest_framework.decorators import action
from rest_framework.response import Response
from .permissions import IsTaskOwnerOrReadOnly
from .serializers import TaskSerializer


class TaskPagination(PageNumberPagination):
    page_size = 2
    page_size_query_param = "page_size"
    max_page_size = 10


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

        queryset = Task.objects.filter(
            Q(owner=user) | Q(shared_with=user)
        ).distinct()

        scope = self.request.query_params.get("scope")

        if scope == "owned":
            queryset = queryset.filter(owner=user)

        if scope == "shared":
            queryset = queryset.filter(
                shared_with=user,
            ).exclude(owner=user)

        return queryset.order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=False, methods=["get"])
    def summary(self, request):
        user = request.user

        queryset = Task.objects.filter(
            Q(owner=user) | Q(shared_with=user)
        ).distinct()

        return Response(
            {
                "total": queryset.count(),
                "pending": queryset.filter(
                    completed=False,
                ).count(),
                "completed": queryset.filter(
                    completed=True,
                ).count(),
                "shared": Task.objects.filter(
                    shared_with=user,
                ).distinct().count(),
            }
        )
