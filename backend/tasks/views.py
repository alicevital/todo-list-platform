from django.shortcuts import render
from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .models import Task
from .serializers import TaskSerializer

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["completed", "category", "due_date"]
    search_fields = ["title", "description"]
    ordering_fields = ["created_at", "updated_at", "due_date", "title"]

    def get_queryset(self):
        user = self.request.user

        return Task.objects.filter(
            Q(owner=user) | Q(shared_with=user)
        ).distinct().order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
