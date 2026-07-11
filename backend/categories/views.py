from rest_framework import viewsets
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated

from .models import Category
from .serializers import CategorySerializer


class CategoryPagination(PageNumberPagination):
    page_size = 6


class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]
    pagination_class = CategoryPagination

    def get_queryset(self):
        return Category.objects.filter(
            owner=self.request.user,
        ).order_by("name")

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)