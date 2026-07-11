import { useEffect, useState } from "react";

import api from "../../services/api";
import "./CategoryModal.css";

function CategoryModal({
  isOpen,
  onClose,
  onCategoryCreated,
}) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    setName("");
    setError("");

    function handleKeyDown(event) {
      if (event.key === "Escape" && !isLoading) {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) {
    return null;
  }

  function handleOverlayClick(event) {
    if (event.target === event.currentTarget && !isLoading) {
      onClose();
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const categoryName = name.trim();
    const accessToken = localStorage.getItem("access_token");

    if (!categoryName) {
      setError("Informe o nome da categoria.");
      return;
    }

    if (!accessToken) {
      setError("Sua sessão expirou. Faça login novamente.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const response = await api.post(
        "/categories/",
        {
          name: categoryName,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      onCategoryCreated(response.data);
    } catch (requestError) {
      const responseData = requestError.response?.data;

      if (
        responseData?.name ||
        responseData?.non_field_errors
      ) {
        setError("Você já possui uma categoria com esse nome.");
      } else if (requestError.response?.status === 401) {
        setError("Sua sessão expirou. Faça login novamente.");
      } else {
        setError("Não foi possível criar a categoria.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      className="category-modal"
      role="presentation"
      onMouseDown={handleOverlayClick}
    >
      <section
        className="category-modal__content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="category-modal-title"
      >
        <header className="category-modal__header">
          <div>
            <h2 id="category-modal-title">Nova categoria</h2>

            <p>
              Crie uma categoria para organizar suas tarefas.
            </p>
          </div>

          <button
            className="category-modal__close"
            type="button"
            aria-label="Fechar"
            disabled={isLoading}
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <form
          className="category-modal__form"
          onSubmit={handleSubmit}
        >
          <div className="category-modal__field">
            <label htmlFor="category-name">
              Nome da categoria
            </label>

            <input
              id="category-name"
              name="name"
              type="text"
              placeholder="Ex.: Estudos, Trabalho ou Pessoal"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={100}
              autoFocus
              required
            />
          </div>

          {error && (
            <p className="category-modal__error" role="alert">
              {error}
            </p>
          )}

          <div className="category-modal__actions">
            <button
              className="category-modal__cancel"
              type="button"
              disabled={isLoading}
              onClick={onClose}
            >
              Cancelar
            </button>

            <button
              className="category-modal__submit"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Criando..." : "Criar categoria"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default CategoryModal;