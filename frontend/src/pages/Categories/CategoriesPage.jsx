import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";

import categoriesIcon from "../../assets/icons/categories.svg";
import plusIcon from "../../assets/icons/plus.svg";

import AppSidebar from "../../components/AppSidebar/AppSidebar";
import CategoryModal from "../../components/CategoryModal/CategoryModal";

import "./CategoriesPage.css";

const PAGE_SIZE = 10;

function CategoriesPage() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCategories, setTotalCategories] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const [isCategoryModalOpen, setIsCategoryModalOpen] =
    useState(false);

  const [categoryToEdit, setCategoryToEdit] = useState(null);

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
      const requestConfig = getRequestConfig({
        page: currentPage,
      });

      if (!requestConfig) {
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const response = await api.get(
          "/categories/",
          requestConfig,
        );

        const responseData = response.data;

        if (Array.isArray(responseData)) {
          setCategories(responseData);
          setTotalCategories(responseData.length);
          setTotalPages(1);
        } else {
          const count = responseData.count || 0;
          const calculatedPages = Math.max(
            1,
            Math.ceil(count / PAGE_SIZE),
          );

          setCategories(responseData.results || []);
          setTotalCategories(count);
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

        setError("Não foi possível carregar as categorias.");
      } finally {
        setIsLoading(false);
      }
    }

    loadCategories();
  }, [currentPage, refreshKey]);

  function openCreateCategoryModal() {
    setCategoryToEdit(null);
    setIsCategoryModalOpen(true);
  }

  function openEditCategoryModal(category) {
    setCategoryToEdit(category);
    setIsCategoryModalOpen(true);
  }

  function closeCategoryModal() {
    setIsCategoryModalOpen(false);
    setCategoryToEdit(null);
  }

  function handleCategorySaved() {
    closeCategoryModal();
    setRefreshKey((currentKey) => currentKey + 1);
  }

  async function handleDeleteCategory(category) {
    const shouldDelete = window.confirm(
      `Tem certeza que deseja excluir a categoria "${category.name}"? As tarefas vinculadas ficarão sem categoria.`,
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
        `/categories/${category.id}/`,
        requestConfig,
      );

      if (categories.length === 1 && currentPage > 1) {
        setCurrentPage((page) => page - 1);
      } else {
        setRefreshKey((currentKey) => currentKey + 1);
      }
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        handleLogout();
        return;
      }

      setError("Não foi possível excluir a categoria.");
    }
  }

  return (
    <div className="categories-page">
      <AppSidebar activePage="categories" />

      <main className="categories-content">
        <header className="categories-header">
          <div>
            <p className="categories-header__label">
              Organização
            </p>

            <h1>Categorias</h1>

            <p>
              Crie categorias para organizar suas tarefas por
              assunto.
            </p>
          </div>

          <button
            className="categories-header__button"
            type="button"
            onClick={openCreateCategoryModal}
          >
            <img
              src={plusIcon}
              alt=""
              aria-hidden="true"
            />

            Nova categoria
          </button>
        </header>

        {error && (
          <p className="categories-error" role="alert">
            {error}
          </p>
        )}

        <section className="categories-panel">
          <header className="categories-panel__header">
            <div>
              <h2>Suas categorias</h2>

              <p>
                {totalCategories}{" "}
                {totalCategories === 1
                  ? "categoria cadastrada"
                  : "categorias cadastradas"}
              </p>
            </div>
          </header>

          {isLoading ? (
            <div className="categories-feedback">
              <p>Carregando categorias...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="categories-feedback">
              <div className="categories-feedback__icon">
                <img
                  src={categoriesIcon}
                  alt=""
                  aria-hidden="true"
                />
              </div>

              <h3>Nenhuma categoria cadastrada</h3>

              <p>
                Crie sua primeira categoria para organizar suas
                tarefas.
              </p>

              <button
                type="button"
                onClick={openCreateCategoryModal}
              >
                <img
                  src={plusIcon}
                  alt=""
                  aria-hidden="true"
                />

                Criar primeira categoria
              </button>
            </div>
          ) : (
            <div className="categories-grid">
              {categories.map((category) => (
                <article
                  className="category-card"
                  key={category.id}
                >
                  <div className="category-card__icon">
                    <img
                      src={categoriesIcon}
                      alt=""
                      aria-hidden="true"
                    />
                  </div>

                  <div className="category-card__content">
                    <h3>{category.name}</h3>

                    <p>
                      Use esta categoria para organizar suas
                      tarefas.
                    </p>
                  </div>

                  <div className="category-card__actions">
                    <button
                      className="category-card__edit"
                      type="button"
                      onClick={() =>
                        openEditCategoryModal(category)
                      }
                    >
                      Editar
                    </button>

                    <button
                      className="category-card__delete"
                      type="button"
                      onClick={() =>
                        handleDeleteCategory(category)
                      }
                    >
                      Excluir
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

          {!isLoading && totalCategories > 0 && (
            <footer className="categories-pagination">
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

      <CategoryModal
        isOpen={isCategoryModalOpen}
        category={categoryToEdit}
        onClose={closeCategoryModal}
        onCategorySaved={handleCategorySaved}
      />
    </div>
  );
}

export default CategoriesPage;