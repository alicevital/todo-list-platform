from django.shortcuts import render
from rest_framework import viewsets
from .models import Task
from .serializers import TaskSerializer
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        return Task.objects.filter(
            Q(owner=user) | Q(shared_with=user)
        ).distinct().order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

# Create your views here.
