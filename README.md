# TasksHub

O TasksHub é uma plataforma full stack para gerenciamento de tarefas pessoais e compartilhadas. A aplicação permite cadastrar usuários, criar e organizar tarefas por categorias, aplicar filtros, marcar atividades como concluídas e compartilhar tarefas com outros usuários em modo somente leitura.

O projeto foi desenvolvido com React, Vite, JavaScript e CSS no frontend, e Python, Django e Django REST Framework no backend, utilizando JWT para autenticação, PostgreSQL em produção, Pytest e Selenium para testes, Docker para conteinerização, GitHub Actions para integração contínua e Render para deploy.

## Acesse a plataforma por aqui:

Frontend: https://taskshub-frontend.onrender.com
Documentação da API: https://todo-list-platform.onrender.com/api/docs/

## Funcionalidades: 

* Cadastro e login de usuários;
* Autenticação com JWT;
* Criação, edição e exclusão de tarefas;
* Organização por categorias;
* Tarefas pendentes e concluídas;
* Compartilhamento entre usuários;
* Pesquisa, filtros e paginação;
* Consulta do próximo feriado;
* Dashboard responsivo.

## Tecnologias:

| Camada | Tecnologia |
|---|---|
| Frontend | React + Axios + Vite +  CSS + JavaScript |
| Backend | Python + Django REST Framework + PostgreSQL + Simple JWT|
| Deploy | Render | 

## Como executar localmente:

1. Clone o repositório e entre na pasta do projeto:
```bash
git clone https://github.com/alicevital/todo-list-platform.git

cd todo-list-platform
```

2. Configure o backend

Crie o ambiente virtual e ative:

```bash
python -m venv venv

venv\Scripts\activate
```

Instale as dependências:

```bash
pip install -r requirements.txt
```

3. Configure as variáveis de ambiente

Crie o .env

Use o arquivo .env.example como referência:

```bash
DJANGO_SECRET_KEY=sua-chave-secreta
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
CSRF_TRUSTED_ORIGINS=
DJANGO_SECURE_SSL_REDIRECT=False
DATABASE_URL=
SQLITE_PATH=
```

Para gerar uma chave secreta:

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

4. Execute as migrações

```bash
python manage.py migrate
```

6. Inicie o backend

```bash
python manage.py runserver
```

O backend estará disponível em:

http://127.0.0.1:8000

A documentação da API estará em:

http://127.0.0.1:8000/api/docs/

6. Configure o frontend

Abra outro terminal e, a partir da raiz do projeto, execute:

```bash
cd frontend

npm install
```

Inicie o frontend:

```bash
npm run dev
```

O frontend estará disponível em:

http://localhost:5173

## Testes

### O projeto possui:

* 33 testes automatizados no backend com Pytest;
* testes da integração externa utilizando mocks;
* teste end-to-end do fluxo de login com Selenium;
* pipeline de CI no GitHub Actions para testes do backend e build do frontend.

### Para executar os testes do backend:

```bash
cd backend
pytest
```

### Para executar o teste com Selenium, mantenha o backend e o frontend locais em execução e use:

```bash
pytest e2e_tests/selenium_login.py -v
```

## Docker

### Para executar o projeto completo com Docker:

Abra o Docker Desktop e execute no terminal:

```bash
docker compose up --build
```
Frontend:

http://localhost:5173

Backend:

http://localhost:8000

## CI com GitHub Actions:

O projeto possui um pipeline configurado no GitHub Actions.

A cada `push` ou `pull request` para a branch `main`, o pipeline executa:

```text
Backend
├── Instalação das dependências
├── Verificação do Django
└── Execução dos testes com Pytest
Frontend
├── Instalação das dependências
└── Geração do build com Vite
```

## Possíveis melhorias futuras:

* Migrar a infraestrutura para Microsoft Azure, utilizando App Service, Static Web Apps e Azure Database for PostgreSQL.
* Permitir a criação de grupos para compartilhamento coletivo de tarefas.
* Adicionar um quadro Kanban para movimentação das tarefas;
* Adionar calendário para organização de usuários.
* Adicionar recuperação e redefinição de senha.
* Criar notificações para tarefas próximas do vencimento.
* Adicionar monitoramento de erros e logs centralizados.

## Autora:

Desenvolvido por **Alice Nascimento**.
* GitHub: [@alicevital](https://github.com/alicevital)
* LinkedIn: [Alice Nascimento](https://www.linkedin.com/in/alice-nascimento-3821bb2b7/)
* Portfólio: [alicevital.vercel.app](https://alicevital.vercel.app/)

