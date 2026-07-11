from django.shortcuts import render
from rest_framework import generics, filters
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import User
from .serializers import ( UserRegisterSerializer, UserListSerializer, )


class UserRegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer
    permission_classes = [AllowAny]

class UserListView(generics.ListAPIView):
    serializer_class = UserListSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ["username"]
    pagination_class = None

    def get_queryset(self):
        return User.objects.exclude(
            id=self.request.user.id,
        ).order_by("username")