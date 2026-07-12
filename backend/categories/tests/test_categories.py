import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from categories.models import Category
from users.models import User


@pytest.fixture
def user():
    """
    Cria o usuário principal utilizado nos testes de categorias.
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
def test_authenticated_user_can_create_category(
    authenticated_client,
    user,
):
    """
    Verifica se um usuário autenticado consegue criar uma categoria
    e se ela fica vinculada ao seu usuário.
    """

    # Act
    response = authenticated_client.post(
        reverse("category-list"),
        {"name": "Estudos"},
        format="json",
    )

    # Assert
    assert response.status_code == status.HTTP_201_CREATED
    assert Category.objects.count() == 1

    category = Category.objects.first()

    assert category.name == "Estudos"
    assert category.owner == user


@pytest.mark.django_db
def test_unauthenticated_user_cannot_list_categories():
    """
    Verifica se usuários não autenticados não conseguem visualizar
    a lista de categorias.
    """

    # Arrange
    client = APIClient()

    # Act
    response = client.get(reverse("category-list"))

    # Assert
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_user_only_sees_own_categories(
    authenticated_client,
    user,
):
    """
    Verifica se cada usuário visualiza somente as categorias
    cadastradas por ele.
    """

    # Arrange
    own_category = Category.objects.create(
        owner=user,
        name="Trabalho",
    )

    another_user = User.objects.create_user(
        username="maria",
        password="senha123",
    )

    Category.objects.create(
        owner=another_user,
        name="Pessoal",
    )

    # Act
    response = authenticated_client.get(
        reverse("category-list"),
    )

    # Assert
    assert response.status_code == status.HTTP_200_OK

    results = response.data["results"]

    assert len(results) == 1
    assert results[0]["id"] == own_category.id
    assert results[0]["name"] == "Trabalho"


@pytest.mark.django_db
def test_owner_can_update_category(
    authenticated_client,
    user,
):
    """
    Verifica se o proprietário consegue atualizar o nome de uma
    categoria criada por ele.
    """

    # Arrange
    category = Category.objects.create(
        owner=user,
        name="Nome antigo",
    )

    # Act
    response = authenticated_client.patch(
        reverse(
            "category-detail",
            kwargs={"pk": category.id},
        ),
        {"name": "Nome atualizado"},
        format="json",
    )

    # Assert
    assert response.status_code == status.HTTP_200_OK

    category.refresh_from_db()

    assert category.name == "Nome atualizado"


@pytest.mark.django_db
def test_owner_can_delete_category(
    authenticated_client,
    user,
):
    """
    Verifica se o proprietário consegue excluir uma categoria
    e se ela é removida do banco de dados.
    """

    # Arrange
    category = Category.objects.create(
        owner=user,
        name="Categoria temporária",
    )

    # Act
    response = authenticated_client.delete(
        reverse(
            "category-detail",
            kwargs={"pk": category.id},
        ),
    )

    # Assert
    assert response.status_code == status.HTTP_204_NO_CONTENT

    assert not Category.objects.filter(
        id=category.id,
    ).exists()