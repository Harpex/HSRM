import { AlertTriangle, CheckCircle2, ClipboardList, UsersRound } from "lucide-react";
import { MetricCard } from "../../components/MetricCard";
import { PageHeader } from "../../components/PageHeader";
import { useApp } from "../../store/AppContext";
import { getDietitianPatientProfiles, patientSummary } from "../../utils/dietitian";
import { todayIso } from "../../utils/date";

export const DietitianDashboard = () => {
  const { state } = useApp();
  const dietitianId = state.currentUserId ?? "";
  const patients = getDietitianPatientProfiles(state, dietitianId);
  const summaries = patients.map((patient) => patientSummary(patient, state));
  const todayActive = patients.filter((patient) => state.dailyLogs.some((log) => log.userId === patient.userId && log.date === todayIso())).length;
  const attention = summaries.filter((summary) => summary.status === "Takip Gerekli").length;
  const closeToGoal = summaries.filter((summary) => summary.status === "Hedefe Yakın").length;
  const missing = summaries.filter((summary) => summary.status === "Veri Eksik").length;

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Diyetisyen Paneli" title="Takip Özeti" description="Danışanlarını sade, hızlı taranabilir ve veri odaklı bir ekranda izle." />
      <div className="metric-grid">
        <MetricCard title="Toplam danışan" value={patients.length} detail="Aktif bağlantı" icon={<UsersRound />} tone="teal" />
        <MetricCard title="Bugün veri giren" value={todayActive} detail="Günlük takip" icon={<CheckCircle2 />} tone="green" />
        <MetricCard title="Takip bekleyen" value={attention} detail="Dikkat gerekli" icon={<AlertTriangle />} tone="coral" />
        <MetricCard title="Hedefe yaklaşan" value={closeToGoal} detail={`${missing} eksik veri`} icon={<ClipboardList />} tone="amber" />
      </div>
      <section className="panel">
        <div className="section-title"><h2>Son güncellenen danışanlar</h2><span>{patients.length} kişi</span></div>
        <div className="client-table">
          {patients.slice(0, 6).map((patient) => {
            const summary = patientSummary(patient, state);
            return (
              <div className="client-row" key={patient.userId}>
                <strong>{patient.fullName || patient.username}</strong>
                <span>BMI {summary.bmi} · {summary.bmiCategory}</span>
                <span>Su %{summary.waterProgress}</span>
                <span>Adım %{summary.stepsProgress}</span>
                <span className="client-status">{summary.status}</span>
              </div>
            );
          })}
          {!patients.length ? <p className="analysis-text">Henüz atanmış danışan yok. Danışanlar ekranından kayıtlı kullanıcıyı e-posta veya kullanıcı adıyla ekleyebilirsin.</p> : null}
        </div>
      </section>
    </div>
  );
};
