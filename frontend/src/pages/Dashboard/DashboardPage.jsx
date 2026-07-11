import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";

import categoriesIcon from "../../assets/icons/categories.svg";
import completedIcon from "../../assets/icons/completed.svg";
import homeIcon from "../../assets/icons/home.svg";
import logoutIcon from "../../assets/icons/logout.svg";
import myTasksIcon from "../../assets/icons/my-tasks.svg";
import pendingIcon from "../../assets/icons/pending.svg";
import plusIcon from "../../assets/icons/plus.svg";
import sharedIcon from "../../assets/icons/shared.svg";
import tasksIcon from "../../assets/icons/tasks.svg";

import "./DashboardPage.css";

function DashboardPage() {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [today, setToday] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const username = localStorage.getItem("username");

  useEffect(() => {
    const intervalId = setInterval(() => {
      setToday(new Date());
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    async function loadDashboardData() {
      const accessToken = localStorage.getItem("access_token");

      if (!accessToken) {
        navigate("/login", { replace: true });
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const requestConfig = {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        };

        const [tasksResponse, categoriesResponse] = await Promise.all([
          api.get("/tasks/", requestConfig),
          api.get("/categories/", requestConfig),
        ]);

        const tasksData = Array.isArray(tasksResponse.data)
          ? tasksResponse.data
          : tasksResponse.data.results || [];

        const categoriesData = Array.isArray(categoriesResponse.data)
          ? categoriesResponse.data
          : categoriesResponse.data.results || [];

        setTasks(tasksData);
        setCategories(categoriesData);
      } catch (requestError) {
        if (requestError.response?.status === 401) {
          handleLogout();
          return;
        }

        setError(
          "Não foi possível carregar as informações do dashboard.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, [navigate]);

  const formattedDate = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(today);

  const currentDate =
    formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  const totalTasks = tasks.length;

  const pendingTasks = tasks.filter(
    (task) => !task.completed,
  ).length;

  const completedTasks = tasks.filter(
    (task) => task.completed,
  ).length;

  const sharedTasks = tasks.filter(
    (task) => username && task.owner !== username,
  ).length;

  const recentTasks = tasks.slice(0, 4);

  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("username");

    navigate("/login", { replace: true });
  }

  function getCategoryName(categoryId) {
    if (!categoryId) {
      return "Sem categoria";
    }

    const category = categories.find(
      (currentCategory) => currentCategory.id === categoryId,
    );

    return category?.name || "Sem categoria";
  }

  function formatDueDate(date) {
    if (!date) {
      return "Sem prazo";
    }

    return new Intl.DateTimeFormat("pt-BR").format(
      new Date(`${date}T00:00:00`),
    );
  }

  return (
    <div className="dashboard-page">
      <aside className="dashboard-sidebar">
        <div>
          <div className="dashboard-sidebar__brand">
            <span>Tasks</span>Hub
          </div>

          <nav
            className="dashboard-sidebar__navigation"
            aria-label="Navegação principal"
          >
            <button
              className="dashboard-sidebar__item dashboard-sidebar__item--active"
              type="button"
            >
              <img
                className="dashboard-sidebar__icon"
                src={homeIcon}
                alt=""
                aria-hidden="true"
              />

              Visão geral
            </button>

            <button className="dashboard-sidebar__item" type="button">
              <img
                className="dashboard-sidebar__icon"
                src={myTasksIcon}
                alt=""
                aria-hidden="true"
              />

              Minhas tarefas
            </button>

            <button className="dashboard-sidebar__item" type="button">
              <img
                className="dashboard-sidebar__icon"
                src={categoriesIcon}
                alt=""
                aria-hidden="true"
              />

              Categorias
            </button>

            <button className="dashboard-sidebar__item" type="button">
              <img
                className="dashboard-sidebar__icon"
                src={sharedIcon}
                alt=""
                aria-hidden="true"
              />

              Compartilhadas
            </button>
          </nav>
        </div>

        <button
          className="dashboard-sidebar__logout"
          type="button"
          onClick={handleLogout}
        >
          <img
            className="dashboard-sidebar__icon"
            src={logoutIcon}
            alt=""
            aria-hidden="true"
          />

          Sair
        </button>
      </aside>

      <main className="dashboard-content">
        <header className="dashboard-header">
          <div>
            <p className="dashboard-header__date">{currentDate}</p>

            <h1>Olá! Vamos organizar suas tarefas?</h1>

            <p className="dashboard-header__description">
              Acompanhe suas atividades e mantenha tudo sob controle.
            </p>
          </div>

          <button className="dashboard-header__button" type="button">
            <img
              className="dashboard-button__icon"
              src={plusIcon}
              alt=""
              aria-hidden="true"
            />

            Nova tarefa
          </button>
        </header>

        {error && (
          <p className="dashboard-error" role="alert">
            {error}
          </p>
        )}

        <section
          className="dashboard-summary"
          aria-label="Resumo das tarefas"
        >
          <article className="dashboard-summary__card">
            <div className="dashboard-summary__icon">
              <img src={tasksIcon} alt="" aria-hidden="true" />
            </div>

            <div>
              <p>Total de tarefas</p>
              <strong>{isLoading ? "..." : totalTasks}</strong>
            </div>
          </article>

          <article className="dashboard-summary__card">
            <div className="dashboard-summary__icon">
              <img src={pendingIcon} alt="" aria-hidden="true" />
            </div>

            <div>
              <p>Pendentes</p>
              <strong>{isLoading ? "..." : pendingTasks}</strong>
            </div>
          </article>

          <article className="dashboard-summary__card">
            <div className="dashboard-summary__icon">
              <img src={completedIcon} alt="" aria-hidden="true" />
            </div>

            <div>
              <p>Concluídas</p>
              <strong>{isLoading ? "..." : completedTasks}</strong>
            </div>
          </article>

          <article className="dashboard-summary__card">
            <div className="dashboard-summary__icon">
              <img src={sharedIcon} alt="" aria-hidden="true" />
            </div>

            <div>
              <p>Compartilhadas</p>
              <strong>{isLoading ? "..." : sharedTasks}</strong>
            </div>
          </article>
        </section>

        <section className="dashboard-grid">
          <article className="dashboard-panel dashboard-panel--tasks">
            <header className="dashboard-panel__header">
              <div>
                <h2>Tarefas recentes</h2>
                <p>Suas últimas atividades aparecerão aqui.</p>
              </div>

              <button type="button">Ver todas</button>
            </header>

            {isLoading ? (
              <div className="dashboard-loading">
                <p>Carregando tarefas...</p>
              </div>
            ) : recentTasks.length === 0 ? (
              <div className="dashboard-empty-state">
                <div
                  className="dashboard-empty-state__icon"
                  aria-hidden="true"
                >
                  <img src={tasksIcon} alt="" />
                </div>

                <h3>Nenhuma tarefa cadastrada</h3>

                <p>
                  Crie sua primeira tarefa para começar a organizar suas
                  atividades.
                </p>

                <button type="button">
                  <img
                    className="dashboard-button__icon"
                    src={plusIcon}
                    alt=""
                    aria-hidden="true"
                  />

                  Criar primeira tarefa
                </button>
              </div>
            ) : (
              <div className="dashboard-task-list">
                {recentTasks.map((task) => (
                  <article
                    className="dashboard-task"
                    key={task.id}
                  >
                    <div
                      className={`dashboard-task__status ${
                        task.completed
                          ? "dashboard-task__status--completed"
                          : ""
                      }`}
                      aria-hidden="true"
                    >
                      <img
                        src={
                          task.completed
                            ? completedIcon
                            : pendingIcon
                        }
                        alt=""
                      />
                    </div>

                    <div className="dashboard-task__content">
                      <div className="dashboard-task__title">
                        <h3>{task.title}</h3>

                        <span>
                          {task.completed
                            ? "Concluída"
                            : "Pendente"}
                        </span>
                      </div>

                      {task.description && (
                        <p>{task.description}</p>
                      )}

                      <div className="dashboard-task__details">
                        <span>
                          {getCategoryName(task.category)}
                        </span>

                        <span>
                          Prazo: {formatDueDate(task.due_date)}
                        </span>

                        {task.owner !== username && (
                          <span>Compartilhada por {task.owner}</span>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </article>

          <article className="dashboard-panel dashboard-panel--categories">
            <header className="dashboard-panel__header">
              <div>
                <h2>Categorias</h2>
                <p>Organize suas tarefas por assunto.</p>
              </div>
            </header>

            {isLoading ? (
              <div className="dashboard-loading">
                <p>Carregando categorias...</p>
              </div>
            ) : categories.length === 0 ? (
              <div className="dashboard-categories">
                <p>Nenhuma categoria cadastrada.</p>

                <button type="button">
                  <img
                    className="dashboard-button__icon"
                    src={plusIcon}
                    alt=""
                    aria-hidden="true"
                  />

                  Criar categoria
                </button>
              </div>
            ) : (
              <div className="dashboard-category-list">
                {categories.slice(0, 6).map((category) => (
                  <div
                    className="dashboard-category"
                    key={category.id}
                  >
                    <div className="dashboard-category__icon">
                      <img
                        src={categoriesIcon}
                        alt=""
                        aria-hidden="true"
                      />
                    </div>

                    <span>{category.name}</span>
                  </div>
                ))}
              </div>
            )}
          </article>
        </section>
      </main>
    </div>
  );
}

export default DashboardPage;