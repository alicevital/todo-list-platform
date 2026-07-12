import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from users.models import User


@pytest.fixture
def user():
    """
    Cria o usuário principal utilizado nos testes de autenticação.
    """
    return User.objects.create_user(
        username="alice",
        email="alice@example.com",
        password="senha123",
    )


@pytest.fixture
def authenticated_client(user):
    """
    Retorna um cliente da API autenticado com o usuário principal.
    """
    client = APIClient()
    client.force_authenticate(user=user)

    return client


@pytest.mark.django_db
def test_user_registration():
    """
    Verifica se um novo usuário consegue se cadastrar e se sua
    senha é armazenada de forma segura no banco de dados.
    """

    # Arrange
    client = APIClient()

    payload = {
        "username": "alice",
        "email": "alice@example.com",
        "password": "senha123",
    }

    # Act
    response = client.post(
        reverse("user-register"),
        payload,
        format="json",
    )

    # Assert
    assert response.status_code == status.HTTP_201_CREATED
    assert User.objects.filter(username="alice").exists()

    user = User.objects.get(username="alice")

    assert user.email == "alice@example.com"
    assert user.check_password("senha123")
    assert "password" not in response.data


@pytest.mark.django_db
def test_user_cannot_register_with_short_password():
    """
    Verifica se o cadastro é recusado quando a senha possui
    menos caracteres que o mínimo exigido pelo sistema.
    """

    # Arrange
    client = APIClient()

    payload = {
        "username": "alice",
        "email": "alice@example.com",
        "password": "123",
    }

    # Act
    response = client.post(
        reverse("user-register"),
        payload,
        format="json",
    )

    # Assert
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert User.objects.count() == 0


@pytest.mark.django_db
def test_registered_user_can_login(user):
    """
    Verifica se um usuário cadastrado consegue realizar login
    e receber os tokens JWT de acesso e atualização.
    """

    # Arrange
    client = APIClient()

    # Act
    response = client.post(
        "/api/auth/login/",
        {
            "username": user.username,
            "password": "senha123",
        },
        format="json",
    )

    # Assert
    assert response.status_code == status.HTTP_200_OK
    assert "access" in response.data
    assert "refresh" in response.data


@pytest.mark.django_db
def test_user_cannot_login_with_invalid_password(user):
    """
    Verifica se o login é recusado quando a senha informada
    não corresponde à senha cadastrada.
    """

    # Arrange
    client = APIClient()

    # Act
    response = client.post(
        "/api/auth/login/",
        {
            "username": user.username,
            "password": "senha-incorreta",
        },
        format="json",
    )

    # Assert
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert "access" not in response.data


@pytest.mark.django_db
def test_authenticated_user_can_list_other_users(
    authenticated_client,
    user,
):
    """
    Verifica se o usuário autenticado consegue listar outros
    usuários disponíveis para compartilhamento de tarefas.
    """

    # Arrange
    another_user = User.objects.create_user(
        username="maria",
        email="maria@example.com",
        password="senha123",
    )

    # Act
    response = authenticated_client.get(
        reverse("user-list"),
    )

    # Assert
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 1
    assert response.data[0]["id"] == another_user.id
    assert response.data[0]["username"] == "maria"

    returned_user_ids = [
        returned_user["id"]
        for returned_user in response.data
    ]

    assert user.id not in returned_user_ids


@pytest.mark.django_db
def test_unauthenticated_user_cannot_list_users():
    """
    Verifica se usuários não autenticados são impedidos de
    acessar a lista utilizada no compartilhamento de tarefas.
    """

    # Arrange
    client = APIClient()

    # Act
    response = client.get(reverse("user-list"))

    # Assert
    assert response.status_code == status.HTTP_401_UNAUTHORIZED