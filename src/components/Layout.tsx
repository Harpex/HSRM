import {
  Activity,
  Apple,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Gauge,
  HeartPulse,
  LogOut,
  Moon,
  Settings,
  Target,
  User,
  UsersRound,
} from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useApp } from "../store/AppContext";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: Gauge },
  { to: "/planner", label: "Günlük plan", icon: CalendarDays },
  { to: "/goals", label: "Hedefler", icon: Target },
  { to: "/calories", label: "Kalori", icon: Apple },
  { to: "/health", label: "Sağlık", icon: HeartPulse },
  { to: "/habits", label: "Alışkanlık", icon: CheckCircle2 },
  { to: "/weekly", label: "Haftalık", icon: BarChart3 },
  { to: "/monthly", label: "Aylık", icon: Activity },
  { to: "/profile", label: "Profil", icon: User },
];

const dietitianNavItems = [
  { to: "/dietitian", label: "Dashboard", icon: Gauge },
  { to: "/dietitian/patients", label: "Danışanlar", icon: UsersRound },
  { to: "/dietitian", label: "Takip Özeti", icon: BarChart3 },
  { to: "/dietitian/plans", label: "Beslenme Planları", icon: Apple },
  { to: "/dietitian/checkins", label: "Haftalık Kontroller", icon: CalendarDays },
  { to: "/dietitian", label: "Mesajlar", icon: Activity },
];

export const Layout = () => {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const currentUser = state.users.find((user) => user.id === state.currentUserId);
  const visibleNavItems = currentUser?.role === "dietitian" ? dietitianNavItems : navItems;

  const logout = () => {
    dispatch({ type: "LOGOUT" });
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">LT</div>
          <div>
            <strong>LifeTrack</strong>
            <span>Gelişim paneli</span>
          </div>
        </div>
        <nav>
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to}>
                <Icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
        <button className="ghost-button" onClick={() => dispatch({ type: "UPDATE_PROFILE", payload: { darkMode: !state.profile.darkMode } })}>
          <Moon size={18} />
          {state.profile.darkMode ? "Açık mod" : "Koyu mod"}
        </button>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <div>
            <span>Bugün</span>
            <strong>{new Intl.DateTimeFormat("tr-TR", { dateStyle: "full" }).format(new Date())}</strong>
            {currentUser?.role === "dietitian" ? <small>Diyetisyen paneli</small> : null}
          </div>
          <div className="topbar-actions">
            <NavLink className="icon-link" to="/profile">
              <Settings size={18} />
            </NavLink>
            <button className="ghost-button compact" onClick={logout}>
              <LogOut size={18} />
              Çıkış
            </button>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
};
