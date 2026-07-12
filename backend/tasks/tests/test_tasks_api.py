import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from tasks.models import Task
from users.models import User


@pytest.fixture
def user():
    return User.objects.create_user(
        username="alice",
        email="alice@example.com",
        password="senha123",
    )


@pytest.fixture
def authenticated_client(user):
    client = APIClient()
    client.force_authenticate(user=user)
    return client


@pytest.mark.django_db
def test_authenticated_user_can_create_task(authenticated_client, user):
    payload = {
        "title": "Estudar Django",
        "description": "Criar testes com pytest",
        "completed": False,
    }

    response = authenticated_client.post(
        reverse("task-list"),
        payload,
        format="json",
    )

    assert response.status_code == status.HTTP_201_CREATED
    assert Task.objects.count() == 1

    task = Task.objects.first()

    assert task.title == "Estudar Django"
    assert task.owner == user


@pytest.mark.django_db
def test_unauthenticated_user_cannot_list_tasks():
    client = APIClient()

    response = client.get(reverse("task-list"))

    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_user_only_sees_own_tasks(authenticated_client, user):
    another_user = User.objects.create_user(
        username="maria",
        password="senha123",
    )

    own_task = Task.objects.create(
        owner=user,
        title="Minha tarefa",
    )

    Task.objects.create(
        owner=another_user,
        title="Tarefa de outra pessoa",
    )

    response = authenticated_client.get(reverse("task-list"))

    assert response.status_code == status.HTTP_200_OK

    results = response.data["results"]

    assert len(results) == 1
    assert results[0]["id"] == own_task.id

@pytest.mark.django_db
def test_owner_can_update_task(authenticated_client, user):
    task = Task.objects.create(
        owner=user,
        title="Título antigo",
    )

    response = authenticated_client.patch(
        reverse(
            "task-detail",
            kwargs={"pk": task.id},
        ),
        {
            "title": "Título atualizado",
        },
        format="json",
    )

    assert response.status_code == status.HTTP_200_OK

    task.refresh_from_db()

    assert task.title == "Título atualizado"


@pytest.mark.django_db
def test_owner_can_delete_task(authenticated_client, user):
    task = Task.objects.create(
        owner=user,
        title="Tarefa para excluir",
    )

    response = authenticated_client.delete(
        reverse(
            "task-detail",
            kwargs={"pk": task.id},
        ),
    )

    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert Task.objects.filter(id=task.id).exists() is False


@pytest.mark.django_db
def test_another_user_cannot_update_task(user):
    task = Task.objects.create(
        owner=user,
        title="Tarefa protegida",
    )

    another_user = User.objects.create_user(
        username="maria",
        password="senha123",
    )

    client = APIClient()
    client.force_authenticate(user=another_user)

    response = client.patch(
        reverse(
            "task-detail",
            kwargs={"pk": task.id},
        ),
        {
            "title": "Tentativa de alteração",
        },
        format="json",
    )

    assert response.status_code in [
        status.HTTP_403_FORBIDDEN,
        status.HTTP_404_NOT_FOUND,
    ]

    task.refresh_from_db()

    assert task.title == "Tarefa protegida"


@pytest.mark.django_db
def test_another_user_cannot_delete_task(user):
    task = Task.objects.create(
        owner=user,
        title="Tarefa protegida",
    )

    another_user = User.objects.create_user(
        username="maria",
        password="senha123",
    )

    client = APIClient()
    client.force_authenticate(user=another_user)

    response = client.delete(
        reverse(
            "task-detail",
            kwargs={"pk": task.id},
        ),
    )

    assert response.status_code in [
        status.HTTP_403_FORBIDDEN,
        status.HTTP_404_NOT_FOUND,
    ]

    assert Task.objects.filter(id=task.id).exists()