import { Download, Moon, User } from "lucide-react";
import { DailyTrackingForm } from "../components/DailyTrackingForm";
import { HealthProfileForm } from "../components/HealthProfileForm";
import { PageHeader } from "../components/PageHeader";
import { ProgressBar } from "../components/ProgressBar";
import { useApp } from "../store/AppContext";
import { calculateBmi, bmiCategory, emptyDailyLog, estimatedDailyCalorieNeed, getDailyLog, getUserHealthProfile, idealWeightRangeText, progressPercent, weightDifferenceToTarget } from "../utils/healthCalculations";
import { todayIso } from "../utils/date";

export const Profile = () => {
  const { state, dispatch } = useApp();
  const healthProfile = getUserHealthProfile(state.healthProfiles, state.currentUserId);
  const dailyLog = getDailyLog(state.dailyLogs, state.currentUserId, todayIso()) ?? emptyDailyLog(state.currentUserId ?? "");

  if (!healthProfile) return null;

  const bmi = calculateBmi(healthProfile.weightKg, healthProfile.heightCm);

  const exportData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "lifetrack-veri.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Profil ve ayarlar"
        title="Profil Bilgileri ve Günlük Takip"
        description="Sağlık profilini, hedeflerini ve bugünkü takip verilerini istediğin zaman güncelle."
      />
      <div className="content-grid">
        <section className="panel">
          <div className="section-title"><h2>Kişisel Özet</h2><User size={18} /></div>
          <div className="profile-summary-grid compact-grid">
            <span>BMI <strong>{bmi}</strong></span>
            <span>Kategori <strong>{bmiCategory(bmi)}</strong></span>
            <span>Hedef farkı <strong>{weightDifferenceToTarget(healthProfile.weightKg, healthProfile.targetWeightKg)} kg</strong></span>
            <span>Kalori ihtiyacı <strong>{estimatedDailyCalorieNeed(healthProfile)} kcal</strong></span>
            <span>İdeal aralık <strong>{idealWeightRangeText(healthProfile.heightCm)}</strong></span>
          </div>
          <ProgressBar value={progressPercent(dailyLog.waterIntakeMl, healthProfile.dailyWaterGoalMl)} label="Su Tüketimi" />
          <ProgressBar value={progressPercent(dailyLog.stepsCount, healthProfile.dailyStepGoal)} label="Adım Hedefi" />
        </section>
        <section className="panel">
          <div className="section-title"><h2>Veri dışa aktarımı</h2><Download size={18} /></div>
          <p className="analysis-text">Kendi hesabına bağlı profil, günlük takip, görev ve hedef verilerini JSON olarak indirebilirsin.</p>
          <button className="secondary-button" onClick={exportData}>JSON dışa aktar</button>
          <button className="ghost-button" onClick={() => dispatch({ type: "UPDATE_PROFILE", payload: { darkMode: !state.profile.darkMode } })}>
            <Moon size={18} />
            {state.profile.darkMode ? "Açık mod" : "Koyu mod"}
          </button>
        </section>
      </div>
      <HealthProfileForm
        initialProfile={healthProfile}
        submitLabel="Profili Güncelle"
        onSubmit={(profile) => dispatch({ type: "UPSERT_HEALTH_PROFILE", payload: { ...profile, onboardingCompleted: true } })}
      />
      <DailyTrackingForm
        initialLog={dailyLog}
        onSubmit={(log) => {
          dispatch({ type: "UPSERT_DAILY_LOG", payload: log });
          if (log.weightKgSnapshot) {
            dispatch({ type: "UPDATE_WEIGHT", payload: { userId: healthProfile.userId, weightKg: log.weightKgSnapshot, date: log.date } });
          }
        }}
      />
    </div>
  );
};
