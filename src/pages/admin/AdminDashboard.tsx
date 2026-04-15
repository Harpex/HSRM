import { ShieldCheck, Stethoscope, UserRound, UsersRound } from "lucide-react";
import { MetricCard } from "../../components/MetricCard";
import { PageHeader } from "../../components/PageHeader";
import { useApp } from "../../store/AppContext";
import { UserRole } from "../../types";

const roleLabels: Record<UserRole, string> = {
  user: "Normal Kullanıcı",
  dietitian: "Diyetisyen",
  admin: "Admin",
};

export const AdminDashboard = () => {
  const { state, dispatch } = useApp();
  const users = state.users;
  const normalUsers = users.filter((user) => user.role === "user");
  const dietitians = users.filter((user) => user.role === "dietitian");
  const admins = users.filter((user) => user.role === "admin");

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Admin Paneli"
        title="Sistem Yönetimi"
        description="Kullanıcı rolleri, diyetisyen hesapları ve sistem kayıtlarını tek ekranda izle."
      />
      <div className="metric-grid">
        <MetricCard title="Toplam hesap" value={users.length} detail="Tüm roller" icon={<UsersRound />} tone="teal" />
        <MetricCard title="Normal kullanıcı" value={normalUsers.length} detail="Sağlık paneli" icon={<UserRound />} tone="green" />
        <MetricCard title="Diyetisyen" value={dietitians.length} detail="Danışan yönetimi" icon={<Stethoscope />} tone="amber" />
        <MetricCard title="Admin" value={admins.length} detail="Yetkili hesap" icon={<ShieldCheck />} tone="coral" />
      </div>
      <section className="panel client-table">
        <div className="section-title">
          <h2>Kullanıcı Yönetimi</h2>
          <span>{users.length} hesap</span>
        </div>
        {users.map((user) => (
          <article className="admin-user-row" key={user.id}>
            <div>
              <strong>{user.fullName || user.username}</strong>
              <span>{user.username} · {user.email}</span>
            </div>
            <span className="client-status">{roleLabels[user.role]}</span>
            <span>{new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium" }).format(new Date(user.createdAt))}</span>
            <select
              value={user.role}
              disabled={user.id === state.currentUserId}
              onChange={(event) => dispatch({ type: "UPDATE_USER_ROLE", payload: { userId: user.id, role: event.target.value as UserRole } })}
            >
              <option value="user">Normal Kullanıcı</option>
              <option value="dietitian">Diyetisyen</option>
              <option value="admin">Admin</option>
            </select>
          </article>
        ))}
        {!users.length ? <p className="analysis-text">Henüz kayıtlı hesap yok.</p> : null}
      </section>
      <section className="panel">
        <div className="section-title">
          <h2>Güvenlik Notu</h2>
        </div>
        <p className="analysis-text">
          Admin rolü kayıt formunda görünmez. Alpha sürümde ilk admin rolü localStorage üzerinden atanır.
          Production sürümde bu rol sadece Supabase veritabanında yetkili kişi tarafından verilmelidir.
        </p>
      </section>
    </div>
  );
};
