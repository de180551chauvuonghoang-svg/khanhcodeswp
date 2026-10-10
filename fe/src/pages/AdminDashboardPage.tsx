import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../app/AuthProvider";
import Brand from "../components/Brand";
import Feedback from "../components/Feedback";
import { adminApi } from "../services/adminApi";
import type { AdminStats } from "../types/admin";
import type { User } from "../types/auth";

type AdminUserRow = User & { _id: string };

export default function AdminDashboardPage() {
  const { user, token, signOut } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [activeTab, setActiveTab] = useState<"overview" | "users">("users");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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
      setSuccess(
        `Đã chuyển trạng thái của ${targetUser.email} thành "${nextStatus}".`
      );
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
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <Brand compact />
          <span className="admin-badge-portal">SYSTEM ADMIN</span>
        </div>

        <div className="admin-current-user">
          <div className="admin-user-avatar">
            {(user?.name || "A").slice(0, 2).toUpperCase()}
          </div>
          <div className="admin-user-info">
            <span className="admin-user-name">{user?.name}</span>
            <span className="admin-user-email">{user?.email}</span>
            <span className="admin-user-role-badge">{user?.role}</span>
          </div>
        </div>

        <nav className="admin-nav">
          <button
            className={`admin-nav-item ${activeTab === "users" ? "is-active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            <span className="admin-nav-icon">👥</span>
            <span>Quản lý người dùng</span>
          </button>
          <button
            className={`admin-nav-item ${activeTab === "overview" ? "is-active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <span className="admin-nav-icon">📊</span>
            <span>Chỉ số hệ thống</span>
          </button>
          <Link to="/profile" className="admin-nav-item">
            <span className="admin-nav-icon">👤</span>
            <span>Hồ sơ cá nhân</span>
          </Link>
        </nav>

        <div className="admin-sidebar-footer">
          <button
            className="button button-quiet admin-logout-btn"
            onClick={() => void signOut()}
          >
            Đăng xuất <span>↗</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main">
        {/* Top bar */}
        <header className="admin-topbar">
          <div>
            <span className="form-kicker">KHÔNG GIAN QUẢN TRỊ VIÊN</span>
            <h1 className="admin-page-title">Bảng điều khiển System Admin</h1>
          </div>
          <div className="admin-topbar-actions">
            <div className="admin-status-pill">
              <span className="status-dot"></span>
              <span>Hệ thống Online</span>
            </div>
            <button
              className="button button-secondary button-compact"
              onClick={loadData}
              disabled={isLoading}
            >
              {isLoading ? "Đang tải..." : "Làm mới dữ liệu ⟳"}
            </button>
          </div>
        </header>

        {/* Feedback alerts */}
        <div className="admin-feedbacks">
          <Feedback message={error} />
          <Feedback message={success} type="success" />
        </div>

        {/* Metrics Row */}
        <section className="admin-metrics-grid">
          <div className="admin-metric-card">
            <span className="metric-title">Tổng số tài khoản</span>
            <span className="metric-value">{stats ? stats.totalUsers : "--"}</span>
            <span className="metric-sub">Đã đăng ký trong cơ sở dữ liệu</span>
          </div>
          <div className="admin-metric-card">
            <span className="metric-title">Tài khoản hoạt động</span>
            <span className="metric-value is-success">
              {stats ? stats.activeUsers : "--"}
            </span>
            <span className="metric-sub">Trạng thái active</span>
          </div>
          <div className="admin-metric-card">
            <span className="metric-title">Tài khoản quản trị</span>
            <span className="metric-value is-accent">
              {stats ? stats.adminCount : "--"}
            </span>
            <span className="metric-sub">Role Systemadmin</span>
          </div>
          <div className="admin-metric-card">
            <span className="metric-title">Tài khoản bị khóa</span>
            <span className="metric-value is-muted">
              {stats ? stats.inactiveUsers : "--"}
            </span>
            <span className="metric-sub">Chưa kích hoạt hoặc blocked</span>
          </div>
        </section>

        {/* Users Table Card */}
        <section className="admin-card">
          <div className="admin-card-header">
            <div>
              <h2>Danh sách người dùng hệ thống</h2>
              <p>Xem, phân quyền và kiểm soát trạng thái các tài khoản.</p>
            </div>
            <div className="admin-table-filters">
              <input
                type="text"
                placeholder="Tìm theo tên, email, ID..."
                className="admin-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select
                className="admin-select"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">Tất cả vai trò</option>
                <option value="systemadmin">Systemadmin</option>
                <option value="user">User</option>
              </select>
            </div>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Người dùng</th>
                  <th>Mã ID</th>
                  <th>Vai trò (Role)</th>
                  <th>Trạng thái</th>
                  <th>Điểm tin cậy</th>
                  <th>Ngày tham gia</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="admin-table-empty">
                      {isLoading
                        ? "Đang tải danh sách người dùng..."
                        : "Không tìm thấy người dùng phù hợp."}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isAdmin = (u.role || "").toLowerCase() === "systemadmin";
                    const isSelf = u.email === user?.email;
                    const isUpdating = updatingId === u._id;

                    return (
                      <tr key={u._id} className={isSelf ? "is-self-row" : ""}>
                        <td>
                          <div className="admin-user-cell">
                            <span className="user-cell-name">{u.name}</span>
                            <span className="user-cell-email">{u.email}</span>
                          </div>
                        </td>
                        <td>
                          <code className="admin-id-code">
                            {(u.User_Id || u._id).slice(0, 8)}...
                          </code>
                        </td>
                        <td>
                          <span
                            className={`role-tag ${
                              isAdmin ? "role-tag-admin" : "role-tag-user"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`status-tag ${
                              u.status === "active"
                                ? "status-tag-active"
                                : "status-tag-blocked"
                            }`}
                          >
                            {u.status}
                          </span>
                        </td>
                        <td>
                          <span className="trust-score">{u.trust_score ?? 0}</span>
                        </td>
                        <td>
                          <span className="date-cell">
                            {u.createdAt
                              ? new Date(u.createdAt).toLocaleDateString("vi-VN")
                              : "--"}
                          </span>
                        </td>
                        <td>
                          <div className="admin-actions">
                            <button
                              className="button button-quiet button-compact"
                              onClick={() => handleToggleRole(u)}
                              disabled={isUpdating || isSelf}
                              title={
                                isSelf
                                  ? "Không thể đổi quyền chính mình"
                                  : "Chuyển đổi vai trò User / Systemadmin"
                              }
                            >
                              {isAdmin ? "Hạ xuống User" : "Cấp Systemadmin"}
                            </button>
                            <button
                              className={`button button-compact ${
                                u.status === "active"
                                  ? "button-danger"
                                  : "button-secondary"
                              }`}
                              onClick={() => handleToggleStatus(u)}
                              disabled={isUpdating || isSelf}
                              title={
                                isSelf
                                  ? "Không thể khóa tài khoản chính mình"
                                  : "Đổi trạng thái tài khoản"
                              }
                            >
                              {u.status === "active" ? "Khóa" : "Mở khóa"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
