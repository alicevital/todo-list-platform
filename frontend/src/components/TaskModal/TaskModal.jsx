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
  task,
  onClose,
  onTaskSaved,
}) {
  const [formData, setFormData] = useState(initialFormData);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isEditing = Boolean(task);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (task) {
      setFormData({
        title: task.title || "",
        description: task.description || "",
        dueDate: task.due_date || "",
        category: task.category ? String(task.category) : "",
      });
    } else {
      setFormData(initialFormData);
    }

    setError("");
  }, [isOpen, task]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

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

    const taskData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      due_date: formData.dueDate || null,
      category: formData.category
        ? Number(formData.category)
        : null,
    };

    if (!isEditing) {
      taskData.completed = false;
    }

    setError("");
    setIsLoading(true);

    try {
      const requestConfig = {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      };

      const response = isEditing
        ? await api.patch(
            `/tasks/${task.id}/`,
            taskData,
            requestConfig,
          )
        : await api.post(
            "/tasks/",
            taskData,
            requestConfig,
          );

      onTaskSaved(response.data);
    } catch (requestError) {
      const responseData = requestError.response?.data;

      if (responseData?.title) {
        setError("Informe um título válido para a tarefa.");
      } else if (responseData?.category) {
        setError("A categoria selecionada não é válida.");
      } else if (requestError.response?.status === 401) {
        setError("Sua sessão expirou. Faça login novamente.");
      } else if (requestError.response?.status === 403) {
        setError("Você não possui permissão para editar esta tarefa.");
      } else {
        setError(
          isEditing
            ? "Não foi possível atualizar a tarefa."
            : "Não foi possível criar a tarefa.",
        );
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
            <h2 id="task-modal-title">
              {isEditing ? "Editar tarefa" : "Nova tarefa"}
            </h2>

            <p>
              {isEditing
                ? "Atualize as informações da sua atividade."
                : "Adicione as informações da sua atividade."}
            </p>
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
              <label htmlFor="task-due-date">
                Data de expiração
              </label>

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
              {isLoading
                ? isEditing
                  ? "Salvando..."
                  : "Criando..."
                : isEditing
                  ? "Salvar alterações"
                  : "Criar tarefa"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default TaskModal;