import { useEffect, useState } from "react";

import api from "../../services/api";
import "./TaskModal.css";

const initialFormData = {
  title: "",
  description: "",
  dueDate: "",
  category: "",
};

function TaskModal({
  isOpen,
  categories,
  onClose,
  onTaskCreated,
}) {
  const [formData, setFormData] = useState(initialFormData);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    setFormData(initialFormData);
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

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  function handleOverlayClick(event) {
    if (event.target === event.currentTarget && !isLoading) {
      onClose();
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const accessToken = localStorage.getItem("access_token");

    if (!accessToken) {
      setError("Sua sessão expirou. Faça login novamente.");
      return;
    }

    setError("");
    setIsLoading(true);

    const taskData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      completed: false,
      due_date: formData.dueDate || null,
      category: formData.category
        ? Number(formData.category)
        : null,
    };

    try {
      const response = await api.post("/tasks/", taskData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      onTaskCreated(response.data);
    } catch (requestError) {
      const responseData = requestError.response?.data;

      if (responseData?.title) {
        setError("Informe um título válido para a tarefa.");
      } else if (responseData?.category) {
        setError("A categoria selecionada não é válida.");
      } else if (requestError.response?.status === 401) {
        setError("Sua sessão expirou. Faça login novamente.");
      } else {
        setError("Não foi possível criar a tarefa.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      className="task-modal"
      role="presentation"
      onMouseDown={handleOverlayClick}
    >
      <section
        className="task-modal__content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-modal-title"
      >
        <header className="task-modal__header">
          <div>
            <h2 id="task-modal-title">Nova tarefa</h2>
            <p>Adicione as informações da sua atividade.</p>
          </div>

          <button
            className="task-modal__close"
            type="button"
            aria-label="Fechar"
            disabled={isLoading}
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <form className="task-modal__form" onSubmit={handleSubmit}>
          <div className="task-modal__field">
            <label htmlFor="task-title">Título</label>

            <input
              id="task-title"
              name="title"
              type="text"
              placeholder="Ex.: Finalizar documentação"
              value={formData.title}
              onChange={handleChange}
              maxLength={150}
              autoFocus
              required
            />
          </div>

          <div className="task-modal__field">
            <label htmlFor="task-description">Descrição</label>

            <textarea
              id="task-description"
              name="description"
              placeholder="Adicione mais detalhes sobre a tarefa"
              value={formData.description}
              onChange={handleChange}
              rows={4}
            />
          </div>

          <div className="task-modal__row">
            <div className="task-modal__field">
              <label htmlFor="task-due-date">Data de conclusão</label>

              <input
                id="task-due-date"
                name="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={handleChange}
              />
            </div>

            <div className="task-modal__field">
              <label htmlFor="task-category">Categoria</label>

              <select
                id="task-category"
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="">Sem categoria</option>

                {categories.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {categories.length === 0 && (
            <p className="task-modal__helper">
              Você ainda não possui categorias cadastradas.
            </p>
          )}

          {error && (
            <p className="task-modal__error" role="alert">
              {error}
            </p>
          )}

          <div className="task-modal__actions">
            <button
              className="task-modal__cancel"
              type="button"
              disabled={isLoading}
              onClick={onClose}
            >
              Cancelar
            </button>

            <button
              className="task-modal__submit"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Criando..." : "Criar tarefa"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default TaskModal;