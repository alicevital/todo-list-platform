import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from users.models import User


@pytest.mark.django_db
def test_user_registration():
    client = APIClient()

    payload = {
        "username": "alice",
        "email": "alice@example.com",
        "password": "senha123",
    }

    response = client.post(
        reverse("user-register"),
        payload,
        format="json",
    )

    assert response.status_code == status.HTTP_201_CREATED
    assert User.objects.filter(username="alice").exists()

    user = User.objects.get(username="alice")
    assert user.check_password("senha123")