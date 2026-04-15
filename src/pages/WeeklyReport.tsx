import { Award, CalendarCheck, TrendingUp } from "lucide-react";
import { MetricCard } from "../components/MetricCard";
import { PageHeader } from "../components/PageHeader";
import { SimpleChart } from "../components/SimpleChart";
import { useApp } from "../store/AppContext";
import { weekDates } from "../utils/date";
import { tasksForDate, weeklyTaskChart } from "../utils/metrics";

export const WeeklyReport = () => {
  const { state } = useApp();
  const days = weekDates();
  const weekTasks = state.tasks.filter((task) => days.includes(task.date));
  const done = weekTasks.filter((task) => task.status === "done").length;
  const bestDay = weeklyTaskChart(state).sort((a, b) => b.value - a.value)[0];
  const habitRate = Math.round(
    (state.habits.reduce((total, habit) => total + days.filter((day) => habit.completedDates.includes(day)).length, 0) /
      Math.max(1, state.habits.reduce((total, habit) => total + habit.targetPerWeek, 0))) *
      100,
  );

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Haftalık rapor" title="Bu haftanın gelişim özeti" description="Tamamlanan işler, alışkanlık devamlılığı ve en verimli günlerini incele." />
      <div className="metric-grid">
        <MetricCard title="Tamamlanan görev" value={done} detail={`${weekTasks.length} görev içinde`} icon={<CalendarCheck />} tone="green" />
        <MetricCard title="En verimli gün" value={bestDay.label} detail={`${bestDay.value} görev tamamlandı`} icon={<TrendingUp />} tone="teal" />
        <MetricCard title="Alışkanlık devamı" value={`${habitRate}%`} detail="Haftalık hedeflere göre" icon={<Award />} tone="amber" />
      </div>
      <SimpleChart title="Günlere göre görevler" data={weeklyTaskChart(state)} />
      <section className="panel">
        <div className="section-title"><h2>Kısa analiz</h2></div>
        <p className="analysis-text">
          Bu hafta en güçlü performans {bestDay.label} günü görülüyor. Alışkanlık oranı {habitRate}% seviyesinde; su ve okuma rutinleri haftalık ritmi destekliyor.
          Günlük planını sabah ilk blokta netleştirmek tamamlanma oranını artırabilir.
        </p>
        <div className="mini-table">
          {days.map((day) => <span key={day}>{day.slice(5)} · {tasksForDate(state.tasks, day).filter((task) => task.status === "done").length} tamamlandı</span>)}
        </div>
      </section>
    </div>
  );
};
