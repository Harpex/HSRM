import { Activity, Apple, CheckCircle2, Droplets, Moon, Smile, Target } from "lucide-react";
import { MetricCard } from "../components/MetricCard";
import { PageHeader } from "../components/PageHeader";
import { ProgressBar } from "../components/ProgressBar";
import { SimpleChart } from "../components/SimpleChart";
import { StatusBadge } from "../components/StatusBadge";
import { useApp } from "../store/AppContext";
import { badgeCount, dailyCalories, goalProgressAverage, healthForDate, mealsForDate, taskCompletionRate, tasksForDate, weeklyTaskChart } from "../utils/metrics";

export const Dashboard = () => {
  const { state } = useApp();
  const todayTasks = tasksForDate(state.tasks);
  const doneTasks = todayTasks.filter((task) => task.status === "done").length;
  const meals = mealsForDate(state.meals);
  const calories = dailyCalories(meals);
  const health = healthForDate(state.health);
  const goalAverage = goalProgressAverage(state);

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Günün özeti"
        title={`Merhaba, ${state.profile.name.split(" ")[0]}`}
        description="Bugünün akışını, enerji seviyeni ve hedeflerine yaklaşma durumunu buradan takip et."
      />
      <div className="metric-grid">
        <MetricCard title="Tamamlanan görev" value={`${doneTasks}/${todayTasks.length}`} detail={`${taskCompletionRate(todayTasks)}% günlük tamamlama`} icon={<CheckCircle2 />} tone="green" />
        <MetricCard title="Kalori" value={calories} detail={`${state.profile.calorieTarget - calories} kcal kaldı`} icon={<Apple />} tone="coral" />
        <MetricCard title="Su" value={`${health.water} L`} detail={`${state.profile.waterTarget} L hedef`} icon={<Droplets />} tone="teal" />
        <MetricCard title="Uyku" value={`${health.sleep} sa`} detail={`${state.profile.sleepTarget} sa hedef`} icon={<Moon />} tone="amber" />
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
