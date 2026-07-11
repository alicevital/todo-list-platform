import { useNavigate } from "react-router-dom";

import categoriesIcon from "../../assets/icons/categories.svg";
import homeIcon from "../../assets/icons/home.svg";
import logoutIcon from "../../assets/icons/logout.svg";
import myTasksIcon from "../../assets/icons/my-tasks.svg";
import sharedIcon from "../../assets/icons/shared.svg";

import "./AppSidebar.css";

function AppSidebar({ activePage }) {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("username");

    navigate("/login", { replace: true });
  }

  return (
    <aside className="app-sidebar">
      <div>
        <div className="app-sidebar__brand">
          <span>Tasks</span>Hub
        </div>

        <nav
          className="app-sidebar__navigation"
          aria-label="Navegação principal"
        >
          <button
            className={`app-sidebar__item ${
              activePage === "dashboard"
                ? "app-sidebar__item--active"
                : ""
            }`}
            type="button"
            onClick={() => navigate("/dashboard")}
          >
            <img
              className="app-sidebar__icon"
              src={homeIcon}
              alt=""
              aria-hidden="true"
            />

            Visão geral
          </button>

          <button
            className={`app-sidebar__item ${
              activePage === "tasks"
                ? "app-sidebar__item--active"
                : ""
            }`}
            type="button"
            onClick={() => navigate("/tasks")}
          >
            <img
              className="app-sidebar__icon"
              src={myTasksIcon}
              alt=""
              aria-hidden="true"
            />

            Minhas tarefas
          </button>

          <button
            className="app-sidebar__item"
            type="button"
            title="Página que será criada na próxima etapa"
          >
            <img
              className="app-sidebar__icon"
              src={categoriesIcon}
              alt=""
              aria-hidden="true"
            />

            Categorias
          </button>

          <button
            className="app-sidebar__item"
            type="button"
            title="Página que será criada posteriormente"
          >
            <img
              className="app-sidebar__icon"
              src={sharedIcon}
              alt=""
              aria-hidden="true"
            />

            Compartilhadas
          </button>
        </nav>
      </div>

      <button
        className="app-sidebar__logout"
        type="button"
        onClick={handleLogout}
      >
        <img
          className="app-sidebar__icon"
          src={logoutIcon}
          alt=""
          aria-hidden="true"
        />

        Sair
      </button>
    </aside>
  );
}

export default AppSidebar;