import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from tasks.models import Task
from users.models import User
from categories.models import Category


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

    """
    Verifica se um usuário autenticado consegue criar uma tarefa
    e se a tarefa criada fica vinculada ao usuário responsável.
    """

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

    """
    Verifica se a API impede que usuários não autenticados
    visualizem a lista de tarefas.
    """

    client = APIClient()

    response = client.get(reverse("task-list"))

    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_user_only_sees_own_tasks(authenticated_client, user):

    """
    Verifica se um usuário não consegue visualizar tarefas de
    outras pessoas que não foram compartilhadas com ele.
    """

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

    """
    Verifica se o proprietário consegue atualizar os dados
    de uma tarefa criada por ele.
    """

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

    """
    Verifica se o proprietário consegue excluir uma tarefa
    e se ela é removida do banco de dados.
    """

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

    """
    Verifica se um usuário diferente do proprietário não consegue
    alterar uma tarefa que não pertence a ele.
    """

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

    """
    Verifica se um usuário diferente do proprietário não consegue
    excluir uma tarefa que não pertence a ele.
    """

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


@pytest.mark.django_db
def test_owner_can_share_task(authenticated_client, user):

    """
    Verifica se o proprietário consegue compartilhar uma tarefa
    com outro usuário cadastrado no sistema.
    """

    shared_user = User.objects.create_user(
        username="maria",
        password="senha123",
    )

    task = Task.objects.create(
        owner=user,
        title="Tarefa compartilhada",
    )

    response = authenticated_client.patch(
        reverse(
            "task-detail",
            kwargs={"pk": task.id},
        ),
        {
            "shared_with": [shared_user.id],
        },
        format="json",
    )

    assert response.status_code == status.HTTP_200_OK

    task.refresh_from_db()

    assert task.shared_with.filter(
        id=shared_user.id,
    ).exists()


@pytest.mark.django_db
def test_shared_user_can_view_shared_task(user):

    """
    Verifica se o usuário selecionado no compartilhamento consegue
    visualizar a tarefa na lista de tarefas compartilhadas.
    """

    shared_user = User.objects.create_user(
        username="maria",
        password="senha123",
    )

    task = Task.objects.create(
        owner=user,
        title="Tarefa compartilhada",
    )

    task.shared_with.add(shared_user)

    client = APIClient()
    client.force_authenticate(user=shared_user)

    response = client.get(
        reverse("task-list"),
        {"scope": "shared"},
    )

    assert response.status_code == status.HTTP_200_OK

    results = response.data["results"]

    assert len(results) == 1
    assert results[0]["id"] == task.id
    assert results[0]["owner"] == user.username


@pytest.mark.django_db
def test_shared_user_cannot_update_task(user):

    """
    Verifica se uma tarefa compartilhada permanece somente para
    leitura e não pode ser alterada pelo usuário convidado.
    """

    shared_user = User.objects.create_user(
        username="maria",
        password="senha123",
    )

    task = Task.objects.create(
        owner=user,
        title="Tarefa somente leitura",
    )

    task.shared_with.add(shared_user)

    client = APIClient()
    client.force_authenticate(user=shared_user)

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

    assert response.status_code == status.HTTP_403_FORBIDDEN

    task.refresh_from_db()

    assert task.title == "Tarefa somente leitura"


@pytest.mark.django_db
def test_removed_shared_user_cannot_view_task(
    authenticated_client,
    user,
):

    """
    Verifica se o usuário deixa de visualizar a tarefa após ser
    removido da lista de compartilhamento.
    """

    shared_user = User.objects.create_user(
        username="maria",
        password="senha123",
    )

    task = Task.objects.create(
        owner=user,
        title="Tarefa compartilhada",
    )

    task.shared_with.add(shared_user)

    response = authenticated_client.patch(
        reverse(
            "task-detail",
            kwargs={"pk": task.id},
        ),
        {
            "shared_with": [],
        },
        format="json",
    )

    assert response.status_code == status.HTTP_200_OK

    client = APIClient()
    client.force_authenticate(user=shared_user)

    shared_response = client.get(
        reverse("task-list"),
        {"scope": "shared"},
    )

    assert shared_response.status_code == status.HTTP_200_OK
    assert shared_response.data["results"] == []

@pytest.mark.django_db
def test_owner_can_mark_task_as_completed(
    authenticated_client,
    user,
):
    """
    Verifica se o proprietário consegue marcar uma tarefa
    pendente como concluída.
    """

    # Arrange
    task = Task.objects.create(
        owner=user,
        title="Finalizar documentação",
        completed=False,
    )

    # Act
    response = authenticated_client.patch(
        reverse(
            "task-detail",
            kwargs={"pk": task.id},
        ),
        {"completed": True},
        format="json",
    )

    # Assert
    assert response.status_code == status.HTTP_200_OK

    task.refresh_from_db()

    assert task.completed is True
    assert response.data["completed"] is True


@pytest.mark.django_db
def test_owner_can_mark_task_as_pending(
    authenticated_client,
    user,
):
    """
    Verifica se o proprietário consegue reabrir uma tarefa
    concluída, marcando-a novamente como pendente.
    """

    # Arrange
    task = Task.objects.create(
        owner=user,
        title="Revisar documentação",
        completed=True,
    )

    # Act
    response = authenticated_client.patch(
        reverse(
            "task-detail",
            kwargs={"pk": task.id},
        ),
        {"completed": False},
        format="json",
    )

    # Assert
    assert response.status_code == status.HTTP_200_OK

    task.refresh_from_db()

    assert task.completed is False
    assert response.data["completed"] is False


@pytest.mark.django_db
def test_user_can_filter_tasks_by_completed_status(
    authenticated_client,
    user,
):
    """
    Verifica se o usuário consegue filtrar suas tarefas
    pelo status de conclusão.
    """

    # Arrange
    completed_task = Task.objects.create(
        owner=user,
        title="Tarefa concluída",
        completed=True,
    )

    Task.objects.create(
        owner=user,
        title="Tarefa pendente",
        completed=False,
    )

    # Act
    response = authenticated_client.get(
        reverse("task-list"),
        {"completed": "true"},
    )

    # Assert
    assert response.status_code == status.HTTP_200_OK

    results = response.data["results"]

    assert len(results) == 1
    assert results[0]["id"] == completed_task.id
    assert results[0]["completed"] is True


@pytest.mark.django_db
def test_user_can_filter_tasks_by_category(
    authenticated_client,
    user,
):
    """
    Verifica se o usuário consegue visualizar apenas as tarefas
    pertencentes à categoria selecionada.
    """

    # Arrange
    studies_category = Category.objects.create(
        owner=user,
        name="Estudos",
    )

    work_category = Category.objects.create(
        owner=user,
        name="Trabalho",
    )

    studies_task = Task.objects.create(
        owner=user,
        title="Estudar Django",
        category=studies_category,
    )

    Task.objects.create(
        owner=user,
        title="Preparar reunião",
        category=work_category,
    )

    # Act
    response = authenticated_client.get(
        reverse("task-list"),
        {"category": studies_category.id},
    )

    # Assert
    assert response.status_code == status.HTTP_200_OK

    results = response.data["results"]

    assert len(results) == 1
    assert results[0]["id"] == studies_task.id
    assert results[0]["category"] == studies_category.id


@pytest.mark.django_db
def test_user_can_search_tasks_by_title(
    authenticated_client,
    user,
):
    """
    Verifica se a busca retorna tarefas cujo título corresponde
    ao texto informado pelo usuário.
    """

    # Arrange
    django_task = Task.objects.create(
        owner=user,
        title="Estudar Django REST Framework",
    )

    Task.objects.create(
        owner=user,
        title="Organizar documentos",
    )

    # Act
    response = authenticated_client.get(
        reverse("task-list"),
        {"search": "Django"},
    )

    # Assert
    assert response.status_code == status.HTTP_200_OK

    results = response.data["results"]

    assert len(results) == 1
    assert results[0]["id"] == django_task.id


@pytest.mark.django_db
def test_task_list_is_paginated(
    authenticated_client,
    user,
):
    """
    Verifica se a listagem de tarefas utiliza paginação e limita
    a quantidade de resultados exibidos por página.
    """

    # Arrange
    for task_number in range(5):
        Task.objects.create(
            owner=user,
            title=f"Tarefa {task_number + 1}",
        )

    # Act
    response = authenticated_client.get(
        reverse("task-list"),
    )

    # Assert
    assert response.status_code == status.HTTP_200_OK
    assert response.data["count"] == 5
    assert len(response.data["results"]) == 2
    assert response.data["next"] is not None
    assert response.data["previous"] is None