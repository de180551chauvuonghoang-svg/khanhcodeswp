import type { User } from "../../types/auth";

export type AdminUserRow = User & { _id: string };

interface AdminUserTableProps {
  users: AdminUserRow[];
  totalCount?: number;
  currentAdminEmail?: string;
  isLoading: boolean;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  roleFilter: string;
  setRoleFilter: (val: string) => void;
  updatingId: string | null;
  onToggleRole: (user: AdminUserRow) => void;
  onToggleStatus: (user: AdminUserRow) => void;
}

export default function AdminUserTable({
  users,
  totalCount,
  currentAdminEmail,
  isLoading,
  searchQuery,
  setSearchQuery,
  roleFilter,
  setRoleFilter,
  updatingId,
  onToggleRole,
  onToggleStatus,
}: AdminUserTableProps) {
  return (
    <section className="admin-card">
      {/* Card Header & Controls */}
      <div className="admin-card-header">
        <div className="admin-card-title-group">
          <div className="admin-card-title-row">
            <h2>Danh sách người dùng hệ thống</h2>
            <span className="admin-count-pill">
              {users.length} {totalCount && totalCount !== users.length ? `/ ${totalCount}` : ""} tài khoản
            </span>
          </div>
          <p>Xem thông tin, phân quyền và kiểm soát bảo mật tài khoản.</p>
        </div>

        {/* Search and Filters */}
        <div className="admin-table-filters">
          <div className="admin-search-wrapper">
            <span className="search-icon" aria-hidden="true">🔍</span>
            <input
              type="text"
              placeholder="Tìm theo tên, email, ID..."
              className="admin-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="search-clear-btn"
                onClick={() => setSearchQuery("")}
                aria-label="Xóa tìm kiếm"
              >
                ✕
              </button>
            )}
          </div>

          <div className="admin-filter-wrapper">
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
      </div>

      {/* Desktop Table View (≥ 768px) */}
      <div className="admin-table-wrap desktop-only-table">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Người dùng</th>
              <th>Mã ID</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th>Điểm tin cậy</th>
              <th>Ngày tạo</th>
              <th className="th-actions">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={7} className="admin-table-empty">
                  {isLoading ? (
                    <div className="table-loading-spinner">Đang tải dữ liệu...</div>
                  ) : (
                    <div className="empty-state">
                      <span className="empty-icon">📂</span>
                      <p>Không tìm thấy người dùng phù hợp với bộ lọc.</p>
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const isAdmin = (u.role || "").toLowerCase() === "systemadmin";
                const isSelf = u.email === currentAdminEmail;
                const isUpdating = updatingId === u._id;

                return (
                  <tr key={u._id} className={isSelf ? "is-self-row" : ""}>
                    <td>
                      <div className="admin-user-cell">
                        <div className="table-user-avatar">
                          {u.name.slice(0, 1).toUpperCase()}
                        </div>
                        <div className="table-user-meta">
                          <span className="user-cell-name">
                            {u.name} {isSelf && <span className="self-badge">(Tôi)</span>}
                          </span>
                          <span className="user-cell-email">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <code className="admin-id-code" title={u.User_Id || u._id}>
                        {(u.User_Id || u._id).slice(0, 8)}...
                      </code>
                    </td>
                    <td>
                      <span
                        className={`role-tag ${
                          isAdmin ? "role-tag-admin" : "role-tag-user"
                        }`}
                      >
                        {isAdmin ? "🛡️ Systemadmin" : "👤 User"}
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
                        <span className="status-indicator-dot"></span>
                        {u.status === "active" ? "Hoạt động" : "Bị khóa"}
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
                    <td className="td-actions">
                      <div className="admin-actions">
                        <button
                          className="button button-quiet button-compact"
                          onClick={() => onToggleRole(u)}
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
                          onClick={() => onToggleStatus(u)}
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

      {/* Mobile Card List View (< 768px) */}
      <div className="admin-mobile-cards mobile-only-list">
        {users.length === 0 ? (
          <div className="admin-table-empty">
            {isLoading ? (
              <div className="table-loading-spinner">Đang tải dữ liệu...</div>
            ) : (
              <div className="empty-state">
                <span className="empty-icon">📂</span>
                <p>Không tìm thấy người dùng phù hợp.</p>
              </div>
            )}
          </div>
        ) : (
          users.map((u) => {
            const isAdmin = (u.role || "").toLowerCase() === "systemadmin";
            const isSelf = u.email === currentAdminEmail;
            const isUpdating = updatingId === u._id;

            return (
              <div
                key={u._id}
                className={`admin-user-mobile-card ${isSelf ? "is-self-card" : ""}`}
              >
                {/* Header: Avatar, Name, Email, Self badge */}
                <div className="mobile-card-header">
                  <div className="table-user-avatar">
                    {u.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="mobile-card-user-info">
                    <span className="user-cell-name">
                      {u.name} {isSelf && <span className="self-badge">(Tôi)</span>}
                    </span>
                    <span className="user-cell-email">{u.email}</span>
                  </div>
                </div>

                {/* Details row: Role, Status, ID, Date */}
                <div className="mobile-card-details">
                  <div className="mobile-detail-item">
                    <span className="mobile-detail-label">Vai trò:</span>
                    <span
                      className={`role-tag ${
                        isAdmin ? "role-tag-admin" : "role-tag-user"
                      }`}
                    >
                      {isAdmin ? "🛡️ Systemadmin" : "👤 User"}
                    </span>
                  </div>

                  <div className="mobile-detail-item">
                    <span className="mobile-detail-label">Trạng thái:</span>
                    <span
                      className={`status-tag ${
                        u.status === "active"
                          ? "status-tag-active"
                          : "status-tag-blocked"
                      }`}
                    >
                      <span className="status-indicator-dot"></span>
                      {u.status === "active" ? "Hoạt động" : "Bị khóa"}
                    </span>
                  </div>

                  <div className="mobile-detail-item">
                    <span className="mobile-detail-label">Mã ID:</span>
                    <code className="admin-id-code">
                      {(u.User_Id || u._id).slice(0, 8)}...
                    </code>
                  </div>

                  <div className="mobile-detail-item">
                    <span className="mobile-detail-label">Ngày tạo:</span>
                    <span className="date-cell">
                      {u.createdAt
                        ? new Date(u.createdAt).toLocaleDateString("vi-VN")
                        : "--"}
                    </span>
                  </div>
                </div>

                {/* Action buttons for mobile */}
                <div className="mobile-card-actions">
                  <button
                    className="button button-quiet mobile-action-btn"
                    onClick={() => onToggleRole(u)}
                    disabled={isUpdating || isSelf}
                  >
                    {isAdmin ? "Hạ xuống User" : "Cấp Systemadmin"}
                  </button>
                  <button
                    className={`button mobile-action-btn ${
                      u.status === "active"
                        ? "button-danger"
                        : "button-secondary"
                    }`}
                    onClick={() => onToggleStatus(u)}
                    disabled={isUpdating || isSelf}
                  >
                    {u.status === "active" ? "Khóa tài khoản" : "Mở khóa"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
