from unittest.mock import patch

import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from integrations.services import HolidayServiceError
from users.models import User


@pytest.fixture
def user():
    """
    Cria um usuário para os testes que exigem autenticação.
    """
    return User.objects.create_user(
        username="alice",
        email="alice@example.com",
        password="senha123",
    )


@pytest.fixture
def authenticated_client(user):
    """
    Retorna um cliente da API autenticado com o usuário de teste.
    """
    client = APIClient()
    client.force_authenticate(user=user)

    return client


def test_unauthenticated_user_cannot_access_next_holiday():
    """
    Verifica se usuários não autenticados são impedidos de
    consultar o endpoint do próximo feriado.
    """

    # Arrange
    client = APIClient()

    # Act
    response = client.get(reverse("next-holiday"))

    # Assert
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
@patch("integrations.views.get_next_holiday")
def test_authenticated_user_can_get_next_holiday(
    mocked_get_next_holiday,
    authenticated_client,
):
    """
    Verifica se o endpoint retorna corretamente os dados do
    próximo feriado fornecidos pelo serviço externo.
    """

    # Arrange
    mocked_get_next_holiday.return_value = {
        "date": "2026-09-07",
        "name": "Independence Day",
        "localName": "Independência do Brasil",
        "countryCode": "BR",
        "nationalHoliday": True,
        "holidayTypes": ["Public"],
    }

    # Act
    response = authenticated_client.get(
        reverse("next-holiday"),
    )

    # Assert
    assert response.status_code == status.HTTP_200_OK
    assert response.data["date"] == "2026-09-07"
    assert (
        response.data["local_name"]
        == "Independência do Brasil"
    )
    assert response.data["country_code"] == "BR"
    assert response.data["national_holiday"] is True
    assert response.data["holiday_types"] == ["Public"]

    mocked_get_next_holiday.assert_called_once_with("BR")


@pytest.mark.django_db
@patch("integrations.views.get_next_holiday")
def test_country_code_is_sent_to_holiday_service(
    mocked_get_next_holiday,
    authenticated_client,
):
    """
    Verifica se o código do país informado na URL é encaminhado
    corretamente para o serviço de feriados.
    """

    # Arrange
    mocked_get_next_holiday.return_value = {
        "date": "2026-12-25",
        "name": "Christmas Day",
        "localName": "Natal",
        "countryCode": "PT",
        "nationalHoliday": True,
        "holidayTypes": ["Public"],
    }

    # Act
    response = authenticated_client.get(
        reverse("next-holiday"),
        {"country": "PT"},
    )

    # Assert
    assert response.status_code == status.HTTP_200_OK
    assert response.data["country_code"] == "PT"

    mocked_get_next_holiday.assert_called_once_with("PT")


@pytest.mark.django_db
@patch("integrations.views.get_next_holiday")
def test_holiday_endpoint_returns_503_when_service_fails(
    mocked_get_next_holiday,
    authenticated_client,
):
    """
    Verifica se uma falha na API externa é tratada e convertida
    em uma resposta HTTP 503, sem derrubar a aplicação.
    """

    # Arrange
    mocked_get_next_holiday.side_effect = HolidayServiceError(
        "Serviço de feriados indisponível.",
    )

    # Act
    response = authenticated_client.get(
        reverse("next-holiday"),
    )

    # Assert
    assert (
        response.status_code
        == status.HTTP_503_SERVICE_UNAVAILABLE
    )

    assert response.data["detail"] == (
        "Serviço de feriados indisponível."
    )


@pytest.mark.django_db
@patch("integrations.views.get_next_holiday")
def test_holiday_endpoint_returns_404_when_no_holiday_exists(
    mocked_get_next_holiday,
    authenticated_client,
):
    """
    Verifica se o endpoint retorna HTTP 404 quando o serviço
    não encontra nenhum próximo feriado.
    """

    # Arrange
    mocked_get_next_holiday.return_value = None

    # Act
    response = authenticated_client.get(
        reverse("next-holiday"),
    )

    # Assert
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.data["detail"] == (
        "Nenhum feriado encontrado."
    )