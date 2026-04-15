import { Link } from "react-router-dom";
import { PageHeader } from "../../components/PageHeader";
import { useApp } from "../../store/AppContext";

export const DietitianPlans = () => {
  const { state } = useApp();
  const plans = state.mealPlans.filter((plan) => plan.dietitianUserId === state.currentUserId);

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Beslenme Planları" title="Plan Arşivi" description="Danışanlara tanımlanan aktif, pasif ve taslak beslenme planları." />
      <section className="panel client-table">
        {plans.map((plan) => {
          const patient = state.healthProfiles.find((profile) => profile.userId === plan.patientUserId);
          return (
            <article className="client-card" key={plan.id}>
              <div><strong>{plan.title}</strong><span>{patient?.fullName || patient?.username}</span></div>
              <p>{plan.description}</p>
              <span className="client-status">{plan.status === "active" ? "Aktif" : plan.status === "draft" ? "Taslak" : "Pasif"}</span>
              <Link className="secondary-button" to={`/dietitian/patients/${plan.patientUserId}`}>Danışan Detayı</Link>
            </article>
          );
        })}
        {!plans.length ? <p className="analysis-text">Henüz beslenme planı yok. Danışan detayından yeni plan oluşturabilirsin.</p> : null}
      </section>
    </div>
  );
};
