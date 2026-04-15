import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Layout } from "./components/Layout";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { Calories } from "./pages/Calories";
import { Dashboard } from "./pages/Dashboard";
import { DietitianCheckins } from "./pages/dietitian/DietitianCheckins";
import { DietitianDashboard } from "./pages/dietitian/DietitianDashboard";
import { DietitianPatientDetail } from "./pages/dietitian/DietitianPatientDetail";
import { DietitianPatients } from "./pages/dietitian/DietitianPatients";
import { DietitianPlans } from "./pages/dietitian/DietitianPlans";
import { Goals } from "./pages/Goals";
import { Habits } from "./pages/Habits";
import { Health } from "./pages/Health";
import { Login } from "./pages/Login";
import { MonthlyReport } from "./pages/MonthlyReport";
import { Onboarding } from "./pages/Onboarding";
import { Planner } from "./pages/Planner";
import { Profile } from "./pages/Profile";
import { WeeklyReport } from "./pages/WeeklyReport";
import { useApp } from "./store/AppContext";
import { getUserHealthProfile } from "./utils/healthCalculations";

const Protected = () => {
  const { state } = useApp();
  const location = useLocation();
  if (!state.isAuthenticated) return <Navigate to="/login" replace />;
  const currentUser = state.users.find((user) => user.id === state.currentUserId);
  if (currentUser?.role === "admin") {
    if (!location.pathname.startsWith("/admin")) return <Navigate to="/admin" replace />;
    return <Layout />;
  }
  if (currentUser?.role === "dietitian") {
    if (!location.pathname.startsWith("/dietitian")) return <Navigate to="/dietitian" replace />;
    return <Layout />;
  }
  const healthProfile = getUserHealthProfile(state.healthProfiles, state.currentUserId);
  if (!healthProfile?.onboardingCompleted && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }
  return <Layout />;
};

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Protected />}>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/planner" element={<Planner />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/calories" element={<Calories />} />
        <Route path="/health" element={<Health />} />
        <Route path="/habits" element={<Habits />} />
        <Route path="/weekly" element={<WeeklyReport />} />
        <Route path="/monthly" element={<MonthlyReport />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/dietitian" element={<DietitianDashboard />} />
        <Route path="/dietitian/patients" element={<DietitianPatients />} />
        <Route path="/dietitian/patients/:patientId" element={<DietitianPatientDetail />} />
        <Route path="/dietitian/plans" element={<DietitianPlans />} />
        <Route path="/dietitian/checkins" element={<DietitianCheckins />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
