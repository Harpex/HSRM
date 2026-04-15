import { Link } from "react-router-dom";
import { PageHeader } from "../../components/PageHeader";
import { useApp } from "../../store/AppContext";

export const DietitianCheckins = () => {
  const { state } = useApp();
  const checkins = state.weeklyCheckins.filter((checkin) => checkin.dietitianUserId === state.currentUserId);

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Haftalık Kontroller" title="Kontrol Geçmişi" description="Danışanlar için oluşturulan haftalık değerlendirme kayıtları." />
      <section className="panel client-table">
        {checkins.map((checkin) => {
          const patient = state.healthProfiles.find((profile) => profile.userId === checkin.patientUserId);
          return (
            <article className="client-card" key={checkin.id}>
              <div><strong>{patient?.fullName || patient?.username}</strong><span>Uyum %{checkin.adherenceScore}</span></div>
              <p>{checkin.summary}</p>
              <span>{checkin.nextGoal}</span>
              <Link className="secondary-button" to={`/dietitian/patients/${checkin.patientUserId}`}>Danışan Detayı</Link>
            </article>
          );
        })}
        {!checkins.length ? <p className="analysis-text">Henüz haftalık kontrol yok. Danışan detayından ilk kontrolü oluşturabilirsin.</p> : null}
      </section>
    </div>
  );
};
