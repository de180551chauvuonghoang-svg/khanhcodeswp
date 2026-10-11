import { useEffect, useState, useMemo } from "react";
import { useAuth } from "../../app/AuthProvider";
import Feedback from "../../components/Feedback";
import Brand from "../../components/Brand";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminStatsGrid from "../../components/admin/AdminStatsGrid";
import AdminUserTable, { type AdminUserRow } from "../../components/admin/AdminUserTable";
import { adminApi } from "../../services/adminApi";
import type { AdminStats } from "../../types/admin";

export default function AdminDashboard() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [activeTab, setActiveTab] = useState<"overview" | "users">("users");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, [token]);

  async function loadData() {
    if (!token) return;
    setIsLoading(true);
    setError("");
    try {
      const data = await adminApi.getOverview(token);
      setStats(data.stats);
      setUsers(data.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải dữ liệu quản trị.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleToggleRole(targetUser: AdminUserRow) {
    if (!token) return;
    const isCurrentAdmin = (targetUser.role || "").toLowerCase() === "systemadmin";
    const nextRole = isCurrentAdmin ? "user" : "Systemadmin";

    if (!confirm(`Bạn có chắc muốn đổi quyền của "${targetUser.name}" thành "${nextRole}"?`)) {
      return;
    }

    setUpdatingId(targetUser._id);
    setError("");
    setSuccess("");
    try {
      await adminApi.updateUserRole(token, targetUser._id, nextRole);
      setSuccess(`Đã cập nhật quyền của ${targetUser.email} thành "${nextRole}".`);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cập nhật quyền thất bại.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleToggleStatus(targetUser: AdminUserRow) {
    if (!token) return;
    if (targetUser.email === user?.email) {
      setError("Bạn không thể thay đổi trạng thái tài khoản của chính mình.");
      return;
    }

    const nextStatus = targetUser.status === "active" ? "blocked" : "active";
    if (
      !confirm(
        `Bạn có chắc muốn chuyển trạng thái tài khoản "${targetUser.name}" sang "${nextStatus}"?`
      )
    ) {
      return;
    }

    setUpdatingId(targetUser._id);
    setError("");
    setSuccess("");
    try {
      await adminApi.updateUserStatus(token, targetUser._id, nextStatus);
      setSuccess(`Đã chuyển trạng thái của ${targetUser.email} thành "${nextStatus}".`);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cập nhật trạng thái thất bại.");
    } finally {
      setUpdatingId(null);
    }
  }

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.User_Id && u.User_Id.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchRole =
        roleFilter === "all" ||
        (u.role || "").toLowerCase() === roleFilter.toLowerCase();

      return matchSearch && matchRole;
    });
  }, [users, searchQuery, roleFilter]);

  return (
    <div className="admin-layout">
      {/* Admin Mobile App Bar (< 1024px) */}
      <header className="admin-mobile-header">
        <button
          className="admin-hamburger-btn"
          onClick={() => setSidebarOpen(true)}
          aria-label="Mở menu quản trị"
        >
          <span className="hamburger-bar"></span>
          <span className="hamburger-bar"></span>
          <span className="hamburger-bar"></span>
        </button>

        <div className="admin-mobile-brand">
          <Brand compact />
        </div>

        <div className="admin-mobile-avatar">
          {(user?.name || "A").slice(0, 1).toUpperCase()}
        </div>
      </header>

      {/* Admin Sidebar / Mobile Drawer */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Admin Content Container */}
      <main className="admin-main">
        {/* Desktop Topbar */}
        <header className="admin-topbar">
          <div className="admin-topbar-info">
            <span className="form-kicker">KHÔNG GIAN QUẢN TRỊ VIÊN</span>
            <h1 className="admin-page-title">
              {activeTab === "users" ? "Quản lý người dùng" : "Chỉ số toàn hệ thống"}
            </h1>
            <p className="admin-topbar-desc">
              Chào mừng, <strong>{user?.name}</strong>. Giám sát tài khoản và toàn quyền kiểm soát cơ sở dữ liệu.
            </p>
          </div>

          <div className="admin-topbar-actions">
            <div className="admin-status-pill">
              <span className="status-dot"></span>
              <span>Hệ thống Online</span>
            </div>
            <button
              className="button button-secondary button-compact refresh-button"
              onClick={loadData}
              disabled={isLoading}
              title="Tải lại dữ liệu mới nhất"
            >
              <span className={`refresh-icon ${isLoading ? "is-spinning" : ""}`}>⟳</span>
              <span>{isLoading ? "Đang đồng bộ..." : "Làm mới dữ liệu"}</span>
            </button>
          </div>
        </header>

        {/* Feedback Alerts */}
        <div className="admin-feedbacks">
          <Feedback message={error} />
          <Feedback message={success} type="success" />
        </div>

        {/* KPI Metrics Summary Grid */}
        <AdminStatsGrid stats={stats} />

        {/* Users Management Section */}
        {activeTab === "users" ? (
          <AdminUserTable
            users={filteredUsers}
            totalCount={users.length}
            currentAdminEmail={user?.email}
            isLoading={isLoading}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            roleFilter={roleFilter}
            setRoleFilter={setRoleFilter}
            updatingId={updatingId}
            onToggleRole={handleToggleRole}
            onToggleStatus={handleToggleStatus}
          />
        ) : (
          /* System Overview Tab */
          <section className="admin-card admin-overview-card">
            <div className="admin-card-header">
              <div>
                <h2>Chi tiết vận hành hệ thống</h2>
                <p>Thông tin kiến trúc máy chủ và cơ sở dữ liệu kết nối.</p>
              </div>
            </div>
            <div className="overview-details-grid">
              <div className="overview-detail-item">
                <span className="detail-item-label">Cơ sở dữ liệu:</span>
                <span className="detail-item-value">MongoDB Atlas (NoSQL)</span>
              </div>
              <div className="overview-detail-item">
                <span className="detail-item-label">Xác thực:</span>
                <span className="detail-item-value">JSON Web Token + Token Version Revocation</span>
              </div>
              <div className="overview-detail-item">
                <span className="detail-item-label">Bảo mật mật khẩu:</span>
                <span className="detail-item-value">Bcrypt (12 Salt Rounds)</span>
              </div>
              <div className="overview-detail-item">
                <span className="detail-item-label">Phân quyền:</span>
                <span className="detail-item-value">RBAC (Systemadmin, User)</span>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
