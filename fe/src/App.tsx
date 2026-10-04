import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./app/AuthProvider";
import AuthLayout from "./layouts/AuthLayout";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import RegisterPage from "./pages/RegisterPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

function HomeRedirect() {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return <div className="app-loading">Đang tải tài khoản...</div>;
  }
  return <Navigate to={user ? "/profile" : "/login"} replace />;
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/" element={<HomeRedirect />} />
        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
