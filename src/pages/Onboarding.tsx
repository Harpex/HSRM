import { Navigate, useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { DailyTrackingForm } from "../components/DailyTrackingForm";
import { HealthProfileForm } from "../components/HealthProfileForm";
import { PageHeader } from "../components/PageHeader";
import { useApp } from "../store/AppContext";
import { createEmptyHealthProfile, emptyDailyLog, getDailyLog, getUserHealthProfile } from "../utils/healthCalculations";
import { todayIso } from "../utils/date";

export const Onboarding = () => {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const currentUser = state.users.find((user) => user.id === state.currentUserId);

  if (!currentUser) return <Navigate to="/login" replace />;

  const existingProfile = getUserHealthProfile(state.healthProfiles, currentUser.id);
  const profile = existingProfile ?? createEmptyHealthProfile(currentUser.id, currentUser.username, currentUser.email, currentUser.fullName);
  const todayLog = getDailyLog(state.dailyLogs, currentUser.id, todayIso()) ?? emptyDailyLog(currentUser.id);

  return (
    <main className="standalone-page">
      <div className="page-stack">
        <PageHeader
          eyebrow="Profil tamamlama"
          title="Kişisel sağlık panelini hazırlayalım"
          description="Birkaç temel bilgiyle BMI, hedef kilo farkı, günlük su/adım ilerlemesi ve kalori ihtiyacı hesaplanacak."
        />
        <div className="onboarding-steps">
          <span><CheckCircle2 size={16} /> Temel bilgiler</span>
          <span><CheckCircle2 size={16} /> Sağlık bilgileri</span>
          <span><CheckCircle2 size={16} /> Hedefler</span>
          <span><CheckCircle2 size={16} /> Günlük başlangıç</span>
        </div>
        <HealthProfileForm
          initialProfile={profile}
          submitLabel="Profili Güncelle"
          onSubmit={(nextProfile) => dispatch({ type: "UPSERT_HEALTH_PROFILE", payload: { ...nextProfile, onboardingCompleted: false } })}
        />
        <DailyTrackingForm initialLog={todayLog} onSubmit={(log) => dispatch({ type: "UPSERT_DAILY_LOG", payload: log })} />
        <button
          className="primary-button"
          onClick={() => {
            dispatch({
              type: "UPSERT_HEALTH_PROFILE",
              payload: { ...profile, onboardingCompleted: true, updatedAt: new Date().toISOString() },
            });
            navigate("/dashboard");
          }}
        >
          Tamamla ve Dashboard'a Geç
        </button>
      </div>
    </main>
  );
};
