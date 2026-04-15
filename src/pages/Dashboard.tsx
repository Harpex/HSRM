import { Activity, Apple, CheckCircle2, Droplets, Footprints, Moon, Scale, Smile, Target } from "lucide-react";
import { MetricCard } from "../components/MetricCard";
import { PageHeader } from "../components/PageHeader";
import { ProgressBar } from "../components/ProgressBar";
import { SimpleChart } from "../components/SimpleChart";
import { StatusBadge } from "../components/StatusBadge";
import { useApp } from "../store/AppContext";
import { activityLabels, bmiCategory, calculateBmi, emptyDailyLog, estimatedDailyCalorieNeed, getDailyLog, getUserHealthProfile, idealWeightRangeText, progressPercent, weightDifferenceToTarget } from "../utils/healthCalculations";
import { todayIso } from "../utils/date";
import { badgeCount, dailyCalories, goalProgressAverage, healthForDate, mealsForDate, taskCompletionRate, tasksForDate, weeklyTaskChart } from "../utils/metrics";

export const Dashboard = () => {
  const { state, dispatch } = useApp();
  const healthProfile = getUserHealthProfile(state.healthProfiles, state.currentUserId);
  const dailyLog = getDailyLog(state.dailyLogs, state.currentUserId, todayIso()) ?? emptyDailyLog(state.currentUserId ?? "");
  const todayTasks = tasksForDate(state.tasks);
  const doneTasks = todayTasks.filter((task) => task.status === "done").length;
  const meals = mealsForDate(state.meals);
  const calories = dailyCalories(meals);
  const health = healthForDate(state.health);
  const goalAverage = goalProgressAverage(state);
  const bmi = healthProfile ? calculateBmi(healthProfile.weightKg, healthProfile.heightCm) : 0;
  const waterProgress = healthProfile ? progressPercent(dailyLog.waterIntakeMl, healthProfile.dailyWaterGoalMl) : 0;
  const stepProgress = healthProfile ? progressPercent(dailyLog.stepsCount, healthProfile.dailyStepGoal) : 0;

  if (!healthProfile) return null;

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Bugünkü İlerleme"
        title={`Merhaba, ${healthProfile.username}`}
        description="Kişisel sağlık profilini, günlük hedeflerini ve bugünkü takibini tek panelde izle."
      />
      <div className="metric-grid">
        <MetricCard title="BMI / VKİ" value={bmi} detail={bmiCategory(bmi)} icon={<Activity />} tone="teal" />
        <MetricCard title="Hedef Kilo" value={`${Math.abs(weightDifferenceToTarget(healthProfile.weightKg, healthProfile.targetWeightKg))} kg`} detail={weightDifferenceToTarget(healthProfile.weightKg, healthProfile.targetWeightKg) > 0 ? "hedefe kalan" : "hedefin altında"} icon={<Scale />} tone="green" />
        <MetricCard title="Su Tüketimi" value={`${dailyLog.waterIntakeMl} ml`} detail={`${waterProgress}% tamamlandı`} icon={<Droplets />} tone="teal" />
        <MetricCard title="Adım Hedefi" value={dailyLog.stepsCount} detail={`${stepProgress}% tamamlandı`} icon={<Footprints />} tone="amber" />
      </div>
      <section className="panel">
        <div className="section-title">
          <h2>Profil Özeti</h2>
          <span>{activityLabels[healthProfile.activityLevel]}</span>
        </div>
        <div className="profile-summary-grid">
          <span>Kullanıcı adı <strong>{healthProfile.username}</strong></span>
          <span>E-posta <strong>{healthProfile.email}</strong></span>
          <span>Yaş <strong>{healthProfile.age}</strong></span>
          <span>Boy <strong>{healthProfile.heightCm} cm</strong></span>
          <span>Kilo <strong>{healthProfile.weightKg} kg</strong></span>
          <span>Hedef kilo <strong>{healthProfile.targetWeightKg} kg</strong></span>
        </div>
      </section>
      <div className="content-grid">
        <section className="panel">
          <div className="section-title">
            <h2>Sağlık Kartları</h2>
            <Activity size={20} />
          </div>
          <ProgressBar value={waterProgress} label="Su hedefi" />
          <ProgressBar value={stepProgress} label="Adım hedefi" />
          <ProgressBar value={progressPercent(dailyLog.sleepHours, healthProfile.sleepGoalHours)} label="Uyku hedefi" />
          <div className="insight-card">
            <Apple size={20} />
            <p>Tahmini günlük kalori ihtiyacı {estimatedDailyCalorieNeed(healthProfile)} kcal. İdeal kilo aralığı: {idealWeightRangeText(healthProfile.heightCm)}.</p>
          </div>
        </section>
        <section className="panel form-grid">
          <div className="section-title">
            <h2>Hızlı Günlük Veri Güncelle</h2>
            <Droplets size={20} />
          </div>
          <button className="secondary-button" onClick={() => dispatch({ type: "ADD_WATER", payload: { userId: healthProfile.userId, date: todayIso(), amountMl: 250 } })}>+250 ml su ekle</button>
          <label>Adım Güncelle<input type="number" min="0" max="150000" value={dailyLog.stepsCount} onChange={(event) => dispatch({ type: "UPSERT_DAILY_LOG", payload: { ...dailyLog, stepsCount: Number(event.target.value), updatedAt: new Date().toISOString() } })} /></label>
          <label>Kilo Güncelle<input type="number" min="20" max="500" step="0.1" value={healthProfile.weightKg} onChange={(event) => dispatch({ type: "UPDATE_WEIGHT", payload: { userId: healthProfile.userId, weightKg: Number(event.target.value), date: todayIso() } })} /></label>
          <span className="form-success">Değişiklikler cihazında kalıcı olarak saklanır.</span>
        </section>
      </div>
      <div className="content-grid">
        <section className="panel">
          <div className="section-title">
            <h2>Bugünkü görevler</h2>
            <span>{todayTasks.length} kayıt</span>
          </div>
          <div className="task-list">
            {todayTasks.map((task) => (
              <article className="task-row" key={task.id}>
                <time>{task.startTime}</time>
                <div>
                  <strong>{task.title}</strong>
                  <span>{task.endTime} bitiş · {task.reminder} hatırlatma</span>
                </div>
                <StatusBadge value={task.status} />
              </article>
            ))}
          </div>
        </section>
        <section className="panel">
          <div className="section-title">
            <h2>Hedef yaklaşımı</h2>
            <Target size={20} />
          </div>
          <ProgressBar value={goalAverage} label="Aktif hedef ortalaması" />
          <ProgressBar value={Math.round((calories / state.profile.calorieTarget) * 100)} label="Kalori hedefi" />
          <ProgressBar value={Math.round((health.steps / state.profile.stepTarget) * 100)} label="Adım hedefi" />
          <div className="insight-card">
            <Smile size={20} />
            <p>Enerjin {health.energy}/100. En güçlü ivme, sabah tamamlanan görevlerden geliyor.</p>
          </div>
          <div className="badges-line">
            <Activity size={18} />
            {badgeCount(state)} başarı rozeti kazanıldı
          </div>
        </section>
      </div>
      <SimpleChart title="Haftalık ilerleme" data={weeklyTaskChart(state)} />
    </div>
  );
};
