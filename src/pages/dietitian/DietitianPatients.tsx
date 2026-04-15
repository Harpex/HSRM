import { FormEvent, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, UserPlus } from "lucide-react";
import { PageHeader } from "../../components/PageHeader";
import { ProgressBar } from "../../components/ProgressBar";
import { useApp } from "../../store/AppContext";
import { createEmptyHealthProfile } from "../../utils/healthCalculations";
import { createRelation, getDietitianPatientProfiles, patientSummary } from "../../utils/dietitian";

export const DietitianPatients = () => {
  const { state, dispatch } = useApp();
  const dietitianId = state.currentUserId ?? "";
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("updated");
  const [invite, setInvite] = useState("");
  const [message, setMessage] = useState("");
  const patients = getDietitianPatientProfiles(state, dietitianId);

  const visiblePatients = useMemo(() => {
    return patients
      .filter((patient) => {
        const summary = patientSummary(patient, state);
        const matchesQuery = `${patient.fullName} ${patient.username} ${patient.email}`.toLowerCase().includes(query.toLowerCase());
        const matchesFilter =
          filter === "all" ||
          (filter === "missing" && summary.status === "Veri Eksik") ||
          (filter === "attention" && summary.status === "Takip Gerekli") ||
          (filter === "near" && summary.status === "Hedefe Yakın") ||
          (filter === "high_bmi" && summary.bmi >= 30) ||
          (filter === "low_water" && summary.waterProgress < 50) ||
          (filter === "low_steps" && summary.stepsProgress < 50);
        return matchesQuery && matchesFilter;
      })
      .sort((a, b) => {
        if (sort === "name") return (a.fullName || a.username).localeCompare(b.fullName || b.username);
        if (sort === "weight") return b.weightKg - a.weightKg;
        if (sort === "target") return Math.abs(a.weightKg - a.targetWeightKg) - Math.abs(b.weightKg - b.targetWeightKg);
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [filter, patients, query, sort, state]);

  const assignPatient = (event: FormEvent) => {
    event.preventDefault();
    const identifier = invite.trim().toLowerCase();
    const user = state.users.find((candidate) => candidate.role === "user" && (candidate.email.toLowerCase() === identifier || candidate.username.toLowerCase() === identifier));
    if (!user) {
      setMessage("Bu e-posta veya kullanıcı adıyla normal kullanıcı bulunamadı.");
      return;
    }
    if (state.dietitianPatients.some((relation) => relation.dietitianUserId === dietitianId && relation.patientUserId === user.id)) {
      setMessage("Bu danışan zaten listende.");
      return;
    }
    if (!state.healthProfiles.some((profile) => profile.userId === user.id)) {
      dispatch({
        type: "UPSERT_HEALTH_PROFILE",
        payload: createEmptyHealthProfile(user.id, user.username, user.email, user.fullName),
      });
    }
    dispatch({ type: "ASSIGN_PATIENT", payload: createRelation(dietitianId, user.id) });
    setInvite("");
    setMessage("Danışan listene eklendi.");
  };

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Danışanlar" title="Danışan Listesi" description="Arama, filtreleme ve sıralama ile danışanlarını hızlıca takip et." />
      <form className="panel toolbar" onSubmit={assignPatient}>
        <label>Danışan ekle<input value={invite} onChange={(event) => setInvite(event.target.value)} placeholder="e-posta veya kullanıcı adı" /></label>
        <button className="primary-button" type="submit"><UserPlus size={16} /> Danışan Ekle</button>
        {message ? <p className={message.includes("eklendi") ? "form-success" : "form-error"}>{message}</p> : null}
      </form>
      <div className="toolbar">
        <label className="search-field"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="İsim, kullanıcı adı, e-posta ara" /></label>
        <label>Filtre<select value={filter} onChange={(event) => setFilter(event.target.value)}><option value="all">Tümü</option><option value="attention">Takip Gerekli</option><option value="missing">Veri Eksik</option><option value="near">Hedefe Yakın</option><option value="high_bmi">Yüksek BMI</option><option value="low_water">Düşük su</option><option value="low_steps">Düşük adım</option></select></label>
        <label>Sıralama<select value={sort} onChange={(event) => setSort(event.target.value)}><option value="updated">Son güncelleme</option><option value="name">İsim</option><option value="weight">Kilo</option><option value="target">Hedefe yakınlık</option></select></label>
      </div>
      <section className="panel client-table">
        {visiblePatients.map((patient) => {
          const summary = patientSummary(patient, state);
          return (
            <article className="client-card" key={patient.userId}>
              <div><strong>{patient.fullName || patient.username}</strong><span>{patient.email}</span></div>
              <span>Yaş {patient.age}</span>
              <span>{patient.weightKg} kg / hedef {patient.targetWeightKg} kg</span>
              <span>BMI {summary.bmi}</span>
              <ProgressBar value={summary.waterProgress} label="Su" />
              <ProgressBar value={summary.stepsProgress} label="Adım" />
              <span className="client-status">{summary.status}</span>
              <Link className="secondary-button" to={`/dietitian/patients/${patient.userId}`}>Detay</Link>
            </article>
          );
        })}
        {!visiblePatients.length ? <p className="analysis-text">Bu kriterlere uygun danışan bulunamadı.</p> : null}
      </section>
    </div>
  );
};
