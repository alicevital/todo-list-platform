import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../../services/api";
import "./LoginPage.css";

function LoginPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
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
    setIsLoading(true);

    try {
      const response = await api.post("/auth/login/", formData);

      localStorage.setItem("access_token", response.data.access);
      localStorage.setItem("refresh_token", response.data.refresh);

      navigate("/dashboard");
    } catch (requestError) {
      const responseData = requestError.response?.data;

      if (responseData?.detail) {
        setError("Usuário ou senha inválidos.");
      } else {
        setError(
          "Não foi possível realizar o login. Verifique se o servidor está funcionando.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-brand">
        <div className="login-brand__content">

          <h1>TasksHub</h1>

          <p>
            Gerencie suas tarefas, organize categorias e compartilhe-as com outras pessoas.
          </p>

        </div>
      </section>

      <section className="login-form-section">
        <div className="login-card">
          <header className="login-card__header">

            <div>
              <h2>Seja bem-vindo!</h2>
              <p>Entre na sua conta para continuar.</p>
            </div>
          </header>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="username">Usuário</label>

              <input
                id="username"
                name="username"
                type="text"
                placeholder="Digite seu usuário"
                value={formData.username}
                onChange={handleChange}
                autoComplete="username"
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="password">Senha</label>

              <input
                id="password"
                name="password"
                type="password"
                placeholder="Digite sua senha"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <p className="login-form__error" role="alert">
                {error}
              </p>
            )}

            <button
              className="login-form__button"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <p className="login-card__register">
            Ainda não possui uma conta?{" "}
            <Link to="/register">Cadastre-se</Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default LoginPage;