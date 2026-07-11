import { Navigate, Route, Routes } from "react-router-dom";

import LoginPage from "./pages/Login/LoginPage";
import RegisterPage from "./pages/Register/RegisterPage";
import DashboardPage from "./pages/Dashboard/DashboardPage";
import TasksPage from "./pages/Tasks/TasksPage";
import CategoriesPage from "./pages/Categories/CategoriesPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/tasks" element={<TasksPage />} />
      <Route path="/categories" element={<CategoriesPage />} />
    </Routes>
  );
}

export default App;