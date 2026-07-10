import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

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

  const formattedDate = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(new Date());

  const currentDate =
    formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");

    if (!accessToken) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    navigate("/login", { replace: true });
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
              <strong>0</strong>
            </div>
          </article>

          <article className="dashboard-summary__card">
            <div className="dashboard-summary__icon">
              <img src={pendingIcon} alt="" aria-hidden="true" />
            </div>

            <div>
              <p>Pendentes</p>
              <strong>0</strong>
            </div>
          </article>

          <article className="dashboard-summary__card">
            <div className="dashboard-summary__icon">
              <img src={completedIcon} alt="" aria-hidden="true" />
            </div>

            <div>
              <p>Concluídas</p>
              <strong>0</strong>
            </div>
          </article>

          <article className="dashboard-summary__card">
            <div className="dashboard-summary__icon">
              <img src={sharedIcon} alt="" aria-hidden="true" />
            </div>

            <div>
              <p>Compartilhadas</p>
              <strong>0</strong>
            </div>
          </article>
        </section>

        <section className="dashboard-grid">
          <article className="dashboard-panel dashboard-panel--tasks">
            <header className="dashboard-panel__header">
              <div>
                <h2>Tarefas recentes</h2>
                <p>Suas últimas tarefas aparecerão aqui.</p>
              </div>

              <button type="button">Ver todas</button>
            </header>

            <div className="dashboard-empty-state">
              <div className="dashboard-empty-state__icon" aria-hidden="true">
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

                Criar tarefa
              </button>
            </div>
          </article>

          <article className="dashboard-panel dashboard-panel--categories">
            <header className="dashboard-panel__header">
              <div>
                <h2>Categorias</h2>
                <p>Organize suas tarefas por assunto.</p>
              </div>
            </header>

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
          </article>
        </section>
      </main>
    </div>
  );
}

export default DashboardPage;