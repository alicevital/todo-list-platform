import { Navigate, Route, Routes } from "react-router-dom";

import LoginPage from "./pages/Login/LoginPage";

function RegisterPage() {
  return <h1>Cadastro - TasksHub</h1>;
}

function DashboardPage() {
  return <h1>Dashboard - TasksHub</h1>;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
    </Routes>
  );
}

export default App;