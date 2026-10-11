import type { AdminStats } from "../../types/admin";

interface AdminStatsGridProps {
  stats: AdminStats | null;
}

export default function AdminStatsGrid({ stats }: AdminStatsGridProps) {
  const activePercent =
    stats && stats.totalUsers > 0
      ? Math.round((stats.activeUsers / stats.totalUsers) * 100)
      : 100;

  return (
    <section className="admin-metrics-grid">
      {/* Metric 1: Total Users */}
      <div className="admin-metric-card metric-card-total">
        <div className="metric-header">
          <span className="metric-title">Tổng số tài khoản</span>
          <div className="metric-icon-box icon-total">👥</div>
        </div>
        <div className="metric-body">
          <span className="metric-value">{stats ? stats.totalUsers : "--"}</span>
          <span className="metric-pill pill-neutral">Đã lưu trữ DB</span>
        </div>
        <span className="metric-sub">Tất cả người dùng trong hệ thống</span>
      </div>

      {/* Metric 2: Active Users */}
      <div className="admin-metric-card metric-card-active">
        <div className="metric-header">
          <span className="metric-title">Đang hoạt động</span>
          <div className="metric-icon-box icon-active">⚡</div>
        </div>
        <div className="metric-body">
          <span className="metric-value is-success">
            {stats ? stats.activeUsers : "--"}
          </span>
          <span className="metric-pill pill-success">{activePercent}% khả dụng</span>
        </div>
        <span className="metric-sub">Tài khoản ở trạng thái Active</span>
      </div>

      {/* Metric 3: System Admins */}
      <div className="admin-metric-card metric-card-admin">
        <div className="metric-header">
          <span className="metric-title">Quản trị viên</span>
          <div className="metric-icon-box icon-admin">🛡️</div>
        </div>
        <div className="metric-body">
          <span className="metric-value is-accent">
            {stats ? stats.adminCount : "--"}
          </span>
          <span className="metric-pill pill-accent">Systemadmin</span>
        </div>
        <span className="metric-sub">Được cấp quyền quản trị tối cao</span>
      </div>

      {/* Metric 4: Blocked / Inactive */}
      <div className="admin-metric-card metric-card-blocked">
        <div className="metric-header">
          <span className="metric-title">Bị khóa / Tạm dừng</span>
          <div className="metric-icon-box icon-blocked">🔒</div>
        </div>
        <div className="metric-body">
          <span className="metric-value is-muted">
            {stats ? stats.inactiveUsers : "--"}
          </span>
          <span className="metric-pill pill-muted">
            {stats && stats.inactiveUsers > 0 ? "Cần chú ý" : "An toàn"}
          </span>
        </div>
        <span className="metric-sub">Tài khoản bị hạn chế truy cập</span>
      </div>
    </section>
  );
}
