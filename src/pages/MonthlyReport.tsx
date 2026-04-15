import { Award, BarChart3, Target } from "lucide-react";
import { MetricCard } from "../components/MetricCard";
import { PageHeader } from "../components/PageHeader";
import { SimpleChart } from "../components/SimpleChart";
import { useApp } from "../store/AppContext";
import { badgeCount, goalProgressAverage } from "../utils/metrics";

export const MonthlyReport = () => {
  const { state } = useApp();
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthTasks = state.tasks.filter((task) => task.date.startsWith(currentMonth));
  const done = monthTasks.filter((task) => task.status === "done").length;
  const weeklyBuckets = [1, 2, 3, 4].map((week) => ({
    label: `${week}. hafta`,
    value: monthTasks.filter((task) => Math.ceil(new Date(task.date).getDate() / 7) === week && task.status === "done").length,
  }));

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Aylık rapor" title="Ayın genel performansı" description="Görev üretimi, hedef ilerlemesi ve kazanılan rozetleri birlikte değerlendir." />
      <div className="metric-grid">
        <MetricCard title="Aylık görev" value={done} detail={`${monthTasks.length} görev içinde`} icon={<BarChart3 />} tone="teal" />
        <MetricCard title="Hedef ortalaması" value={`${goalProgressAverage(state)}%`} detail="Aktif hedefler" icon={<Target />} tone="green" />
        <MetricCard title="Rozetler" value={badgeCount(state)} detail="Başarı sistemi" icon={<Award />} tone="amber" />
      </div>
      <SimpleChart title="Haftalara göre tamamlanan görev" data={weeklyBuckets} />
      <section className="panel">
        <div className="section-title"><h2>Performans yorumu</h2></div>
        <p className="analysis-text">
          Ayın ana kazanımı düzenli sağlık takibi ve sürdürülen alışkanlık serileri. Hedef ilerlemesi {goalProgressAverage(state)}% seviyesinde.
          Gelecek ay için tek ana hedef seçip günlük planla bağlamak odağı keskinleştirir.
        </p>
      </section>
    </div>
  );
};
