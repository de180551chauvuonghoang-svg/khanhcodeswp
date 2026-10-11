import { Link } from "react-router-dom";
import { useAuth } from "../../app/AuthProvider";
import Brand from "../Brand";

interface AdminSidebarProps {
  activeTab: "overview" | "users";
  setActiveTab: (tab: "overview" | "users") => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function AdminSidebar({
  activeTab,
  setActiveTab,
  isOpen = false,
  onClose,
}: AdminSidebarProps) {
  const { user, signOut } = useAuth();

  const handleNavClick = (tab: "overview" | "users") => {
    setActiveTab(tab);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="admin-sidebar-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`admin-sidebar ${isOpen ? "is-open" : ""}`}>
        <div className="admin-sidebar-header">
          <div className="admin-sidebar-brand-wrap">
            <Brand compact />
            <span className="admin-badge-portal">SYSTEM ADMIN</span>
          </div>

          {/* Close button on mobile */}
          <button
            className="admin-sidebar-close-btn"
            onClick={onClose}
            aria-label="Đóng menu"
          >
            ✕
          </button>
        </div>

        {/* Current Admin Profile Card */}
        <div className="admin-current-user">
          <div className="admin-user-avatar">
            {(user?.name || "A").slice(0, 2).toUpperCase()}
          </div>
          <div className="admin-user-info">
            <span className="admin-user-name" title={user?.name}>
              {user?.name}
            </span>
            <span className="admin-user-email" title={user?.email}>
              {user?.email}
            </span>
            <span className="admin-user-role-badge">
              🛡️ {user?.role || "Systemadmin"}
            </span>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="admin-nav">
          <div className="admin-nav-section-label">QUẢN TRỊ</div>
          <button
            className={`admin-nav-item ${activeTab === "users" ? "is-active" : ""}`}
            onClick={() => handleNavClick("users")}
          >
            <span className="admin-nav-icon">👥</span>
            <span className="admin-nav-label">Quản lý người dùng</span>
          </button>
          <button
            className={`admin-nav-item ${activeTab === "overview" ? "is-active" : ""}`}
            onClick={() => handleNavClick("overview")}
          >
            <span className="admin-nav-icon">📊</span>
            <span className="admin-nav-label">Chỉ số hệ thống</span>
          </button>

          <div className="admin-nav-section-label">CÁ NHÂN</div>
          <Link
            to="/profile"
            className="admin-nav-item"
            onClick={onClose}
          >
            <span className="admin-nav-icon">👤</span>
            <span className="admin-nav-label">Hồ sơ của tôi</span>
          </Link>
        </nav>

        {/* Sidebar Footer with Logout */}
        <div className="admin-sidebar-footer">
          <button
            className="button button-quiet admin-logout-btn"
            onClick={() => void signOut()}
          >
            <span>Đăng xuất</span>
            <span aria-hidden="true">↗</span>
          </button>
        </div>
      </aside>
    </>
  );
}
