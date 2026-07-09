from django.shortcuts import render
from rest_framework import generics
from rest_framework.permissions import AllowAny
from .models import User
from .serializers import UserRegisterSerializer


class UserRegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer
    permission_classes = [AllowAny]

