import json
import os
from urllib.request import Request, urlopen
from uuid import uuid4

import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait


FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "http://localhost:5173",
)

BACKEND_URL = os.getenv(
    "BACKEND_URL",
    "http://127.0.0.1:8000",
)


def create_test_user(username, email, password):
    """
    Cria um usuário diretamente pela API para preparar o cenário
    utilizado no teste de login pelo frontend.
    """
    payload = json.dumps(
        {
            "username": username,
            "email": email,
            "password": password,
        }
    ).encode("utf-8")

    request = Request(
        f"{BACKEND_URL}/api/auth/register/",
        data=payload,
        headers={
            "Content-Type": "application/json",
        },
        method="POST",
    )

    with urlopen(request, timeout=10) as response:
        assert response.status == 201


@pytest.fixture
def browser():
    """
    Abre uma instância do Google Chrome e garante que ela seja
    encerrada ao final do teste, mesmo se ocorrer algum erro.
    """
    driver = webdriver.Chrome()
    driver.set_window_size(1440, 900)

    yield driver

    driver.quit()


def test_user_can_login_through_frontend(browser):
    """
    Verifica se um usuário cadastrado consegue preencher o
    formulário de login e acessar o dashboard pelo navegador.
    """

    # Arrange: cria um usuário exclusivo para o teste
    unique_identifier = uuid4().hex[:8]

    username = f"selenium_{unique_identifier}"
    email = f"{username}@example.com"
    password = "senha12345"

    create_test_user(
        username=username,
        email=email,
        password=password,
    )

    # Act: acessa a página e preenche o formulário
    browser.get(f"{FRONTEND_URL}/login")

    wait = WebDriverWait(browser, 10)

    username_input = wait.until(
        EC.visibility_of_element_located(
            (By.NAME, "username"),
        )
    )

    password_input = browser.find_element(
        By.NAME,
        "password",
    )

    submit_button = browser.find_element(
        By.CSS_SELECTOR,
        "button[type='submit']",
    )

    username_input.send_keys(username)
    password_input.send_keys(password)
    submit_button.click()

    # Assert: confirma o redirecionamento e o token JWT
    wait.until(
        EC.url_contains("/dashboard"),
    )

    access_token = browser.execute_script(
        "return localStorage.getItem('access_token');"
    )

    assert "/dashboard" in browser.current_url
    assert access_token is not None
    assert access_token != ""