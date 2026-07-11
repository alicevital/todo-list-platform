import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";

import completedIcon from "../../assets/icons/completed.svg";
import pendingIcon from "../../assets/icons/pending.svg";
import plusIcon from "../../assets/icons/plus.svg";
import tasksIcon from "../../assets/icons/tasks.svg";

import AppSidebar from "../../components/AppSidebar/AppSidebar";
import TaskModal from "../../components/TaskModal/TaskModal";

import "./TasksPage.css";

const PAGE_SIZE = 2;

function TasksPage() {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);

  const [searchText, setSearchText] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [ordering, setOrdering] = useState("-created_at");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);

  const username = localStorage.getItem("username");

  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("username");

    navigate("/login", { replace: true });
  }

  function getRequestConfig(params = {}) {
    const accessToken = localStorage.getItem("access_token");

    if (!accessToken) {
      handleLogout();
      return null;
    }

    return {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params,
    };
  }

  useEffect(() => {
    async function loadCategories() {
      const requestConfig = getRequestConfig();

      if (!requestConfig) {
        return;
      }

      try {
        const response = await api.get(
          "/categories/",
          requestConfig,
        );

        const categoriesData = Array.isArray(response.data)
          ? response.data
          : response.data.results || [];

        setCategories(categoriesData);
      } catch (requestError) {
        if (requestError.response?.status === 401) {
          handleLogout();
        }
      }
    }

    loadCategories();
  }, []);

  useEffect(() => {
    async function loadTasks() {
      const params = {
        page: currentPage,
        ordering,
      };

      if (appliedSearch) {
        params.search = appliedSearch;
      }

      if (statusFilter === "pending") {
        params.completed = false;
      }

      if (statusFilter === "completed") {
        params.completed = true;
      }

      if (categoryFilter !== "all") {
        params.category = categoryFilter;
      }

      const requestConfig = getRequestConfig(params);

      if (!requestConfig) {
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const response = await api.get(
          "/tasks/",
          requestConfig,
        );

        const responseData = response.data;

        if (Array.isArray(responseData)) {
          setTasks(responseData);
          setTotalTasks(responseData.length);
          setTotalPages(1);
        } else {
          const count = responseData.count || 0;
          const calculatedPages = Math.max(
            1,
            Math.ceil(count / PAGE_SIZE),
          );

          setTasks(responseData.results || []);
          setTotalTasks(count);
          setTotalPages(calculatedPages);

          if (currentPage > calculatedPages) {
            setCurrentPage(calculatedPages);
          }
        }
      } catch (requestError) {
        if (requestError.response?.status === 401) {
          handleLogout();
          return;
        }

        setError("Não foi possível carregar as tarefas.");
      } finally {
        setIsLoading(false);
      }
    }

    loadTasks();
  }, [
    appliedSearch,
    categoryFilter,
    currentPage,
    ordering,
    refreshKey,
    statusFilter,
  ]);

  function handleSearch(event) {
    event.preventDefault();

    setCurrentPage(1);
    setAppliedSearch(searchText.trim());
  }

  function handleClearFilters() {
    setSearchText("");
    setAppliedSearch("");
    setStatusFilter("all");
    setCategoryFilter("all");
    setOrdering("-created_at");
    setCurrentPage(1);
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

  function handleTaskSaved() {
    closeTaskModal();
    setRefreshKey((currentKey) => currentKey + 1);
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
      await api.patch(
        `/tasks/${task.id}/`,
        {
          completed: !task.completed,
        },
        requestConfig,
      );

      setRefreshKey((currentKey) => currentKey + 1);
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        handleLogout();
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

      if (tasks.length === 1 && currentPage > 1) {
        setCurrentPage((page) => page - 1);
      } else {
        setRefreshKey((currentKey) => currentKey + 1);
      }
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        handleLogout();
        return;
      }

      setError("Não foi possível excluir a tarefa.");
    }
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

  return (
    <div className="tasks-page">
      <AppSidebar activePage="tasks" />

      <main className="tasks-content">
        <header className="tasks-header">
          <div>

            <h1>Minhas tarefas</h1>

            <p>
              Encontre, filtre e organize todas as suas tarefas por aqui.
            </p>
          </div>

          <button
            className="tasks-header__button"
            type="button"
            onClick={openCreateTaskModal}
          >
            <img
              src={plusIcon}
              alt=""
              aria-hidden="true"
            />

            Nova tarefa
          </button>
        </header>

        <section
          className="tasks-filters"
          aria-label="Filtros de tarefas"
        >
          <form
            className="tasks-search"
            onSubmit={handleSearch}
          >
            <input
              type="search"
              placeholder="Buscar por título ou descrição"
              value={searchText}
              onChange={(event) =>
                setSearchText(event.target.value)
              }
            />

            <button type="submit">Buscar</button>
          </form>

          <div className="tasks-filter-grid">
            <label>
              Status

              <select
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">Todos</option>
                <option value="pending">Pendentes</option>
                <option value="completed">Concluídas</option>
              </select>
            </label>

            <label>
              Categoria

              <select
                value={categoryFilter}
                onChange={(event) => {
                  setCategoryFilter(event.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">Todas</option>

                {categories.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Ordenar por

              <select
                value={ordering}
                onChange={(event) => {
                  setOrdering(event.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="-created_at">
                  Mais recentes
                </option>

                <option value="created_at">
                  Mais antigas
                </option>

                <option value="due_date">
                  Prazo mais próximo
                </option>

                <option value="-due_date">
                  Prazo mais distante
                </option>

                <option value="title">
                  Título de A a Z
                </option>
              </select>
            </label>

            <button
              className="tasks-clear"
              type="button"
              onClick={handleClearFilters}
            >
              Limpar filtros
            </button>
          </div>
        </section>

        {error && (
          <p className="tasks-error" role="alert">
            {error}
          </p>
        )}

        <section className="tasks-panel">
          <header className="tasks-panel__header">
            <div>
              <h2>Tarefas</h2>

              <p>
                {totalTasks}{" "}
                {totalTasks === 1
                  ? "tarefa encontrada"
                  : "tarefas encontradas"}
              </p>
            </div>
          </header>

          {isLoading ? (
            <div className="tasks-feedback">
              <p>Carregando tarefas...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="tasks-feedback">
              <img
                src={tasksIcon}
                alt=""
                aria-hidden="true"
              />

              <h3>Nenhuma tarefa encontrada</h3>

              <p>
                Altere os filtros ou crie uma nova tarefa.
              </p>
            </div>
          ) : (
            <div className="tasks-list">
              {tasks.map((task) => {
                const isTaskOwner =
                  task.owner === username;

                return (
                  <article
                    className="tasks-item"
                    key={task.id}
                  >
                    <button
                      className={`tasks-item__status ${
                        task.completed
                          ? "tasks-item__status--completed"
                          : ""
                      }`}
                      type="button"
                      disabled={!isTaskOwner}
                      onClick={() =>
                        handleToggleTask(task)
                      }
                      title={
                        isTaskOwner
                          ? task.completed
                            ? "Marcar como pendente"
                            : "Marcar como concluída"
                          : "Tarefa compartilhada: somente leitura"
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

                    <div className="tasks-item__content">
                      <div className="tasks-item__title">
                        <h3>{task.title}</h3>

                        <span
                          className={
                            task.completed
                              ? "tasks-item__badge--completed"
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

                      <div className="tasks-item__details">
                        <span>
                          {getCategoryName(task.category)}
                        </span>

                        <span>
                          Prazo:{" "}
                          {formatDueDate(task.due_date)}
                        </span>

                        {!isTaskOwner && (
                          <span>
                            Compartilhada por {task.owner}
                          </span>
                        )}
                      </div>

                      {isTaskOwner ? (
                        <div className="tasks-item__actions">
                          <button
                            className="tasks-item__edit"
                            type="button"
                            onClick={() =>
                              openEditTaskModal(task)
                            }
                          >
                            Editar
                          </button>

                          <button
                            className="tasks-item__delete"
                            type="button"
                            onClick={() =>
                              handleDeleteTask(task)
                            }
                          >
                            Excluir
                          </button>
                        </div>
                      ) : (
                        <p className="tasks-item__readonly">
                          Somente leitura
                        </p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {!isLoading && totalTasks > 0 && (
            <footer className="tasks-pagination">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() =>
                  setCurrentPage((page) => page - 1)
                }
              >
                Anterior
              </button>

              <span>
                Página {currentPage} de {totalPages}
              </span>

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((page) => page + 1)
                }
              >
                Próxima
              </button>
            </footer>
          )}
        </section>
      </main>

      <TaskModal
        isOpen={isTaskModalOpen}
        categories={categories}
        task={taskToEdit}
        onClose={closeTaskModal}
        onTaskSaved={handleTaskSaved}
      />
    </div>
  );
}

export default TasksPage;