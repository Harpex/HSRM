import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Calories } from "./pages/Calories";
import { Dashboard } from "./pages/Dashboard";
import { Goals } from "./pages/Goals";
import { Habits } from "./pages/Habits";
import { Health } from "./pages/Health";
import { Login } from "./pages/Login";
import { MonthlyReport } from "./pages/MonthlyReport";
import { Planner } from "./pages/Planner";
import { Profile } from "./pages/Profile";
import { WeeklyReport } from "./pages/WeeklyReport";
import { useApp } from "./store/AppContext";

const Protected = () => {
  const { state } = useApp();
  if (!state.isAuthenticated) return <Navigate to="/login" replace />;
  return <Layout />;
};

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Protected />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/planner" element={<Planner />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/calories" element={<Calories />} />
        <Route path="/health" element={<Health />} />
        <Route path="/habits" element={<Habits />} />
        <Route path="/weekly" element={<WeeklyReport />} />
        <Route path="/monthly" element={<MonthlyReport />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
