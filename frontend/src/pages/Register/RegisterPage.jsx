import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../../services/api";
import "./RegisterPage.css";

function RegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    if (formData.password.length < 8) {
      setError("A senha deve possuir pelo menos 8 caracteres.");
      return;
    }

    setIsLoading(true);

    try {
      const registerData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      };

      await api.post("/auth/register/", registerData);

      navigate("/login", {
        state: {
          message: "Cadastro realizado com sucesso. Faça seu login.",
        },
      });
    } catch (requestError) {
      const responseData = requestError.response?.data;

      if (responseData?.username) {
        setError("Este nome de usuário já está sendo utilizado.");
      } else if (responseData?.email) {
        setError("Este e-mail já está sendo utilizado.");
      } else if (responseData?.password) {
        setError("A senha informada não atende aos requisitos.");
      } else if (responseData?.detail) {
        setError(responseData.detail);
      } else {
        setError(
          "Não foi possível realizar o cadastro. Verifique se o servidor está funcionando.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="register-page">
      <section className="register-brand">
        <div className="register-brand__content">
          <h1>TasksHub</h1>

          <p>
            Gerencie suas tarefas, organize categorias e compartilhe-as com outras pessoas.
          </p>
        </div>
      </section>

      <section className="register-form-section">
        <div className="register-card">
          <header className="register-card__header">
            <h2>Crie sua conta</h2>
            <p>Preencha seus dados para começar.</p>
          </header>

          <form className="register-form" onSubmit={handleSubmit}>
            <div className="register-form__field">
              <label htmlFor="username">Nome de usuário</label>

              <input
                id="username"
                name="username"
                type="text"
                placeholder="Digite seu nome de usuário"
                value={formData.username}
                onChange={handleChange}
                autoComplete="username"
                required
              />
            </div>

            <div className="register-form__field">
              <label htmlFor="email">E-mail</label>

              <input
                id="email"
                name="email"
                type="email"
                placeholder="Digite seu e-mail"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
            </div>

            <div className="register-form__field">
              <label htmlFor="password">Senha</label>

              <input
                id="password"
                name="password"
                type="password"
                placeholder="Digite sua senha"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>

            <div className="register-form__field">
              <label htmlFor="confirmPassword">Confirme sua senha</label>

              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Digite sua senha novamente"
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>

            {error && (
              <p className="register-form__error" role="alert">
                {error}
              </p>
            )}

            <button
              className="register-form__button"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Cadastrando..." : "Cadastrar"}
            </button>
          </form>

          <p className="register-card__login">
            Já possui uma conta? <Link to="/login">Entre aqui</Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default RegisterPage;