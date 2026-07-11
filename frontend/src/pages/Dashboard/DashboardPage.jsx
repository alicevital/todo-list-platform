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

import CategoryModal from "../../components/CategoryModal/CategoryModal";
import TaskModal from "../../components/TaskModal/TaskModal";

import "./DashboardPage.css";

function DashboardPage() {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [today, setToday] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] =
    useState(false);

  const [taskToEdit, setTaskToEdit] = useState(null);

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

        const [tasksResponse, categoriesResponse] =
          await Promise.all([
            api.get("/tasks/", requestConfig),
            api.get("/categories/", requestConfig),
          ]);

        const tasksData = Array.isArray(tasksResponse.data)
          ? tasksResponse.data
          : tasksResponse.data.results || [];

        const categoriesData = Array.isArray(
          categoriesResponse.data,
        )
          ? categoriesResponse.data
          : categoriesResponse.data.results || [];

        setTasks(tasksData);
        setCategories(categoriesData);
      } catch (requestError) {
        if (requestError.response?.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("username");

          navigate("/login", { replace: true });
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
    formattedDate.charAt(0).toUpperCase() +
    formattedDate.slice(1);

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

  function getRequestConfig() {
    const accessToken = localStorage.getItem("access_token");

    if (!accessToken) {
      handleLogout();
      return null;
    }

    return {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };
  }

  function getCategoryName(categoryId) {
    if (!categoryId) {
      return "Sem categoria";
    }

    const category = categories.find(
      (currentCategory) =>
        currentCategory.id === categoryId,
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

  function openCreateTaskModal() {
    setTaskToEdit(null);
    setIsTaskModalOpen(true);
  }

  function openEditTaskModal(task) {
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  }

  function closeTaskModal() {
    setIsTaskModalOpen(false);
    setTaskToEdit(null);
  }

  function handleTaskSaved(savedTask) {
    setTasks((currentTasks) => {
      const taskAlreadyExists = currentTasks.some(
        (task) => task.id === savedTask.id,
      );

      if (taskAlreadyExists) {
        return currentTasks.map((task) =>
          task.id === savedTask.id ? savedTask : task,
        );
      }

      return [savedTask, ...currentTasks];
    });

    closeTaskModal();
  }

  function handleCategoryCreated(createdCategory) {
    setCategories((currentCategories) =>
      [...currentCategories, createdCategory].sort(
        (firstCategory, secondCategory) =>
          firstCategory.name.localeCompare(
            secondCategory.name,
            "pt-BR",
          ),
      ),
    );

    setIsCategoryModalOpen(false);
  }

  async function handleToggleTask(task) {
    if (task.owner !== username) {
      return;
    }

    const requestConfig = getRequestConfig();

    if (!requestConfig) {
      return;
    }

    setError("");

    try {
      const response = await api.patch(
        `/tasks/${task.id}/`,
        {
          completed: !task.completed,
        },
        requestConfig,
      );

      setTasks((currentTasks) =>
        currentTasks.map((currentTask) =>
          currentTask.id === task.id
            ? response.data
            : currentTask,
        ),
      );
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        handleLogout();
        return;
      }

      if (requestError.response?.status === 403) {
        setError(
          "Você não possui permissão para alterar esta tarefa.",
        );
        return;
      }

      setError(
        "Não foi possível alterar o status da tarefa.",
      );
    }
  }

  async function handleDeleteTask(task) {
    if (task.owner !== username) {
      return;
    }

    const shouldDelete = window.confirm(
      `Tem certeza que deseja excluir a tarefa "${task.title}"?`,
    );

    if (!shouldDelete) {
      return;
    }

    const requestConfig = getRequestConfig();

    if (!requestConfig) {
      return;
    }

    setError("");

    try {
      await api.delete(
        `/tasks/${task.id}/`,
        requestConfig,
      );

      setTasks((currentTasks) =>
        currentTasks.filter(
          (currentTask) => currentTask.id !== task.id,
        ),
      );
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        handleLogout();
        return;
      }

      if (requestError.response?.status === 403) {
        setError(
          "Você não possui permissão para excluir esta tarefa.",
        );
        return;
      }

      setError("Não foi possível excluir a tarefa.");
    }
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

            <button
              className="dashboard-sidebar__item"
              type="button"
            >
              <img
                className="dashboard-sidebar__icon"
                src={myTasksIcon}
                alt=""
                aria-hidden="true"
              />

              Minhas tarefas
            </button>

            <button
              className="dashboard-sidebar__item"
              type="button"
            >
              <img
                className="dashboard-sidebar__icon"
                src={categoriesIcon}
                alt=""
                aria-hidden="true"
              />

              Categorias
            </button>

            <button
              className="dashboard-sidebar__item"
              type="button"
            >
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
            <p className="dashboard-header__date">
              {currentDate}
            </p>

            <h1>Olá! Vamos organizar suas tarefas?</h1>

            <p className="dashboard-header__description">
              Acompanhe suas tarefas por aqui!.
            </p>
          </div>

          <button
            className="dashboard-header__button"
            type="button"
            onClick={openCreateTaskModal}
          >
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
              <img
                src={tasksIcon}
                alt=""
                aria-hidden="true"
              />
            </div>

            <div>
              <p>Total de tarefas</p>
              <strong>
                {isLoading ? "..." : totalTasks}
              </strong>
            </div>
          </article>

          <article className="dashboard-summary__card">
            <div className="dashboard-summary__icon">
              <img
                src={pendingIcon}
                alt=""
                aria-hidden="true"
              />
            </div>

            <div>
              <p>Pendentes</p>
              <strong>
                {isLoading ? "..." : pendingTasks}
              </strong>
            </div>
          </article>

          <article className="dashboard-summary__card">
            <div className="dashboard-summary__icon">
              <img
                src={completedIcon}
                alt=""
                aria-hidden="true"
              />
            </div>

            <div>
              <p>Concluídas</p>
              <strong>
                {isLoading ? "..." : completedTasks}
              </strong>
            </div>
          </article>

          <article className="dashboard-summary__card">
            <div className="dashboard-summary__icon">
              <img
                src={sharedIcon}
                alt=""
                aria-hidden="true"
              />
            </div>

            <div>
              <p>Compartilhadas</p>
              <strong>
                {isLoading ? "..." : sharedTasks}
              </strong>
            </div>
          </article>
        </section>

        <section className="dashboard-grid">
          <article className="dashboard-panel dashboard-panel--tasks">
            <header className="dashboard-panel__header">
              <div>
                <h2>Tarefas recentes</h2>
                <p>
                  Suas últimas atividades aparecerão aqui.
                </p>
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
                  Crie sua primeira tarefa para começar a organizá-las.
                </p>

                <button
                  type="button"
                  onClick={openCreateTaskModal}
                >
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
                {recentTasks.map((task) => {
                  const isTaskOwner =
                    task.owner === username;

                  return (
                    <article
                      className="dashboard-task"
                      key={task.id}
                    >
                      <button
                        className={`dashboard-task__status ${
                          task.completed
                            ? "dashboard-task__status--completed"
                            : ""
                        }`}
                        type="button"
                        aria-label={
                          task.completed
                            ? "Marcar tarefa como pendente"
                            : "Marcar tarefa como concluída"
                        }
                        title={
                          isTaskOwner
                            ? task.completed
                              ? "Marcar como pendente"
                              : "Marcar como concluída"
                            : "Tarefa compartilhada: somente leitura"
                        }
                        disabled={!isTaskOwner}
                        onClick={() =>
                          handleToggleTask(task)
                        }
                      >
                        <img
                          src={
                            task.completed
                              ? completedIcon
                              : pendingIcon
                          }
                          alt=""
                          aria-hidden="true"
                        />
                      </button>

                      <div className="dashboard-task__content">
                        <div className="dashboard-task__title">
                          <h3>{task.title}</h3>

                          <span
                            className={
                              task.completed
                                ? "dashboard-task__badge--completed"
                                : ""
                            }
                          >
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
                            {getCategoryName(
                              task.category,
                            )}
                          </span>

                          <span>
                            Prazo:{" "}
                            {formatDueDate(
                              task.due_date,
                            )}
                          </span>

                          {!isTaskOwner && (
                            <span>
                              Compartilhada por{" "}
                              {task.owner}
                            </span>
                          )}
                        </div>

                        {isTaskOwner ? (
                          <div className="dashboard-task__actions">
                            <button
                              className="dashboard-task__edit"
                              type="button"
                              onClick={() =>
                                openEditTaskModal(task)
                              }
                            >
                              Editar
                            </button>

                            <button
                              className="dashboard-task__delete"
                              type="button"
                              onClick={() =>
                                handleDeleteTask(task)
                              }
                            >
                              Excluir
                            </button>
                          </div>
                        ) : (
                          <p className="dashboard-task__readonly">
                            Somente leitura
                          </p>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </article>

          <article className="dashboard-panel dashboard-panel--categories">
            <header className="dashboard-panel__header">
              <div>
                <h2>Categorias</h2>

                <p>
                  Organize suas tarefas por assunto.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setIsCategoryModalOpen(true)
                }
              >
                Nova categoria
              </button>
            </header>

            {isLoading ? (
              <div className="dashboard-loading">
                <p>Carregando categorias...</p>
              </div>
            ) : categories.length === 0 ? (
              <div className="dashboard-categories">
                <p>Nenhuma categoria cadastrada.</p>

                <button
                  type="button"
                  onClick={() =>
                    setIsCategoryModalOpen(true)
                  }
                >
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
                {categories
                  .slice(0, 6)
                  .map((category) => (
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

      <TaskModal
        isOpen={isTaskModalOpen}
        categories={categories}
        task={taskToEdit}
        onClose={closeTaskModal}
        onTaskSaved={handleTaskSaved}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() =>
          setIsCategoryModalOpen(false)
        }
        onCategoryCreated={handleCategoryCreated}
      />
    </div>
  );
}

export default DashboardPage;