# TasksHub

Plataforma full stack para gerenciamento de tarefas pessoais e compartilhadas.

O projeto foi desenvolvido para ter autenticação de usuários, organização de tarefas por categorias, filtros, compartilhamento de tarefas e integração com uma API externa de feriados.

## Funcionalidades

* Cadastro e login de usuários;
* Autenticação com JWT;
* Criação, edição e exclusão de tarefas;
* Organização por categorias;
* Tarefas pendentes e concluídas;
* Compartilhamento entre usuários;
* Pesquisa, filtros e paginação;
* Consulta do próximo feriado;
* Dashboard responsivo.

## Tecnologias

### Backend

* Python
* Django
* Django REST Framework
* Simple JWT
* SQLite

### Frontend

* React
* Vite
* React Router
* Axios
* JavaScript
* CSS

## Como executar

### Clonar o projeto

```bash
git clone https://github.com/alicevital/todo-list-platform.git
cd todo-list-platform
```

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

## Próximos passos

* Finalizar a integração entre frontend e backend;
* Adicionar testes automatizados;
* Configurar PostgreSQL;
* Adicionar Docker;
* Publicar a aplicação;
* Adicionar imagens ao README.

## Autora

Desenvolvido por **Alice Nascimento**.

* GitHub: [@alicevital](https://github.com/alicevital)
* LinkedIn: **[https://www.linkedin.com/in/alice-nascimento-3821bb2b7/]**
* Portfólio: **[https://alicevital.vercel.app/]**

## Demonstração

```text
[aaaaaaaaaaaa]
```
