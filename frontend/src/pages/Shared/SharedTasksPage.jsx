import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";

import pendingIcon from "../../assets/icons/pending.svg";
import sharedIcon from "../../assets/icons/shared.svg";
import completedIcon from "../../assets/icons/completed.svg";

import AppSidebar from "../../components/AppSidebar/AppSidebar";

import "../Tasks/TasksPage.css";

const PAGE_SIZE = 3;

function SharedTasksPage() {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("username");

    navigate("/login", { replace: true });
  }

  useEffect(() => {
    async function loadSharedTasks() {
      const accessToken =
        localStorage.getItem("access_token");

      if (!accessToken) {
        handleLogout();
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const response = await api.get("/tasks/", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            scope: "shared",
            page: currentPage,
          },
        });

        const responseData = response.data;
        const count = responseData.count || 0;

        setTasks(responseData.results || []);
        setTotalTasks(count);
        setTotalPages(
          Math.max(
            1,
            Math.ceil(count / PAGE_SIZE),
          ),
        );
      } catch (requestError) {
        if (
          requestError.response?.status === 401
        ) {
          handleLogout();
          return;
        }

        setError(
          "Não foi possível carregar as tarefas compartilhadas.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadSharedTasks();
  }, [currentPage]);

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
      <AppSidebar activePage="shared" />

      <main className="tasks-content">
        <header className="tasks-header">
          <div>
            <h1>Tarefas compartilhadas</h1>

            <p>
              Tarefas que outros usuários compartilharam
              com você.
            </p>
          </div>
        </header>

        {error && (
          <p className="tasks-error" role="alert">
            {error}
          </p>
        )}

        <section className="tasks-panel">
          <header className="tasks-panel__header">
            <div>
              <h2>Compartilhadas comigo</h2>

              <p>
                {totalTasks}{" "}
                {totalTasks === 1
                  ? "tarefa compartilhada"
                  : "tarefas compartilhadas"}
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
                src={sharedIcon}
                alt=""
                aria-hidden="true"
              />

              <h3>Nenhuma tarefa compartilhada</h3>

              <p>
                As tarefas compartilhadas com você
                aparecerão aqui.
              </p>
            </div>
          ) : (
            <div className="tasks-list">
              {tasks.map((task) => (
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
                    disabled
                    title="Tarefa compartilhada: somente leitura"
                  >
                    <img
                      src={ task.completed
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

                      <span>
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
                        {task.category_name ||
                          "Sem categoria"}
                      </span>

                      <span>
                        Prazo:{" "}
                        {formatDueDate(
                          task.due_date,
                        )}
                      </span>

                      <span>
                        Compartilhada por {task.owner}
                      </span>
                    </div>

                    <p className="tasks-item__readonly">
                      Somente leitura
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}

          {!isLoading && totalTasks > 0 && (
            <footer className="tasks-pagination">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() =>
                  setCurrentPage(
                    (page) => page - 1,
                  )
                }
              >
                Anterior
              </button>

              <span>
                Página {currentPage} de {totalPages}
              </span>

              <button
                type="button"
                disabled={
                  currentPage >= totalPages
                }
                onClick={() =>
                  setCurrentPage(
                    (page) => page + 1,
                  )
                }
              >
                Próxima
              </button>
            </footer>
          )}
        </section>
      </main>
    </div>
  );
}

export default SharedTasksPage;