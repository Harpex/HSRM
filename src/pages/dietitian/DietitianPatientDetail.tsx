import { FormEvent, useMemo, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { ClipboardList, NotebookPen, Utensils } from "lucide-react";
import { PageHeader } from "../../components/PageHeader";
import { ProgressBar } from "../../components/ProgressBar";
import { useApp } from "../../store/AppContext";
import { MealPlanItem } from "../../types";
import { bmiCategory, calculateBmi, estimatedDailyCalorieNeed, getDailyLog, idealWeightRangeText, progressPercent } from "../../utils/healthCalculations";
import { isDietitianPatient } from "../../utils/dietitian";
import { todayIso } from "../../utils/date";

const mealTypes = ["Kahvaltı", "Ara Öğün", "Öğle", "Ara Öğün 2", "Akşam", "Gece"];

export const DietitianPatientDetail = () => {
  const { state, dispatch } = useApp();
  const { patientId } = useParams();
  const dietitianId = state.currentUserId ?? "";
  const patient = state.healthProfiles.find((profile) => profile.userId === patientId);
  const log = getDailyLog(state.dailyLogs, patientId ?? "", todayIso());
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [planTitle, setPlanTitle] = useState("");
  const [planDescription, setPlanDescription] = useState("");
  const [planItems, setPlanItems] = useState(mealTypes.map((mealType, index) => ({ mealType, itemText: "", sortOrder: index })));
  const [checkinSummary, setCheckinSummary] = useState("");
  const [adherenceScore, setAdherenceScore] = useState(70);
  const [nextGoal, setNextGoal] = useState("");

  if (!patientId || !patient || !isDietitianPatient(state, dietitianId, patientId)) return <Navigate to="/dietitian/patients" replace />;

  const bmi = calculateBmi(patient.weightKg, patient.heightCm);
  const notes = state.dietitianNotes.filter((note) => note.dietitianUserId === dietitianId && note.patientUserId === patientId);
  const plans = state.mealPlans.filter((plan) => plan.dietitianUserId === dietitianId && plan.patientUserId === patientId);
  const checkins = state.weeklyCheckins.filter((checkin) => checkin.dietitianUserId === dietitianId && checkin.patientUserId === patientId);
  const currentPlanItems = useMemo(() => state.mealPlanItems, [state.mealPlanItems]);

  const addNote = (event: FormEvent) => {
    event.preventDefault();
    if (noteTitle.trim().length < 3 || noteContent.trim().length < 5) return;
    const now = new Date().toISOString();
    dispatch({
      type: "UPSERT_DIETITIAN_NOTE",
      payload: { id: crypto.randomUUID(), dietitianUserId: dietitianId, patientUserId: patientId, title: noteTitle, noteContent, createdAt: now, updatedAt: now },
    });
    setNoteTitle("");
    setNoteContent("");
  };

  const addMealPlan = (event: FormEvent) => {
    event.preventDefault();
    if (planTitle.trim().length < 3) return;
    const now = new Date().toISOString();
    const planId = crypto.randomUUID();
    const items: MealPlanItem[] = planItems
      .filter((item) => item.itemText.trim())
      .map((item) => ({ id: crypto.randomUUID(), mealPlanId: planId, ...item }));
    dispatch({
      type: "UPSERT_MEAL_PLAN",
      payload: {
        plan: {
          id: planId,
          dietitianUserId: dietitianId,
          patientUserId: patientId,
          title: planTitle,
          description: planDescription,
          startDate: todayIso(),
          endDate: todayIso(),
          status: "active",
          createdAt: now,
          updatedAt: now,
        },
        items,
      },
    });
    setPlanTitle("");
    setPlanDescription("");
    setPlanItems(mealTypes.map((mealType, index) => ({ mealType, itemText: "", sortOrder: index })));
  };

  const addCheckin = (event: FormEvent) => {
    event.preventDefault();
    if (checkinSummary.trim().length < 5 || adherenceScore < 0 || adherenceScore > 100) return;
    const now = new Date().toISOString();
    dispatch({
      type: "UPSERT_WEEKLY_CHECKIN",
      payload: {
        id: crypto.randomUUID(),
        dietitianUserId: dietitianId,
        patientUserId: patientId,
        weekStartDate: todayIso(),
        weekEndDate: todayIso(),
        summary: checkinSummary,
        weightComment: `${patient.weightKg} kg güncel kayıt.`,
        waterComment: log ? `Su ilerlemesi %${progressPercent(log.waterIntakeMl, patient.dailyWaterGoalMl)}.` : "Bugün su kaydı yok.",
        stepsComment: log ? `Adım ilerlemesi %${progressPercent(log.stepsCount, patient.dailyStepGoal)}.` : "Bugün adım kaydı yok.",
        adherenceScore,
        nextGoal,
        createdAt: now,
        updatedAt: now,
      },
    });
    setCheckinSummary("");
    setNextGoal("");
  };

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Danışan Detayı" title={patient.fullName || patient.username} description="Genel bilgiler, takip verileri, notlar, beslenme planı ve haftalık kontroller." />
      <div className="metric-grid">
        <section className="panel"><strong>BMI / VKİ</strong><h2>{bmi}</h2><span>{bmiCategory(bmi)}</span></section>
        <section className="panel"><strong>Kilo</strong><h2>{patient.weightKg} kg</h2><span>Hedef {patient.targetWeightKg} kg</span></section>
        <section className="panel"><strong>Kalori ihtiyacı</strong><h2>{estimatedDailyCalorieNeed(patient)}</h2><span>Yaklaşık kcal</span></section>
        <section className="panel"><strong>İdeal aralık</strong><h2>{idealWeightRangeText(patient.heightCm)}</h2><span>Bilgilendirme amaçlı</span></section>
      </div>
      <section className="panel">
        <div className="section-title"><h2>Günlük Takip</h2><span>{log?.date ?? "Bugün kayıt yok"}</span></div>
        <ProgressBar value={log ? progressPercent(log.waterIntakeMl, patient.dailyWaterGoalMl) : 0} label="Su Tüketimi" />
        <ProgressBar value={log ? progressPercent(log.stepsCount, patient.dailyStepGoal) : 0} label="Adım Hedefi" />
        <ProgressBar value={log ? progressPercent(log.sleepHours, patient.sleepGoalHours) : 0} label="Uyku" />
      </section>
      <div className="content-grid">
        <form className="panel form-grid" onSubmit={addNote}>
          <div className="section-title"><h2>Notlar</h2><NotebookPen size={18} /></div>
          <label>Başlık<input value={noteTitle} onChange={(event) => setNoteTitle(event.target.value)} /></label>
          <label>Not<textarea value={noteContent} onChange={(event) => setNoteContent(event.target.value)} /></label>
          <button className="primary-button">Not Ekle</button>
          {notes.map((note) => <article className="mini-record" key={note.id}><strong>{note.title}</strong><p>{note.noteContent}</p><button className="secondary-button" type="button" onClick={() => dispatch({ type: "DELETE_DIETITIAN_NOTE", payload: note.id })}>Sil</button></article>)}
        </form>
        <form className="panel form-grid" onSubmit={addMealPlan}>
          <div className="section-title"><h2>Beslenme Planı</h2><Utensils size={18} /></div>
          <label>Plan başlığı<input value={planTitle} onChange={(event) => setPlanTitle(event.target.value)} /></label>
          <label>Açıklama<textarea value={planDescription} onChange={(event) => setPlanDescription(event.target.value)} /></label>
          {planItems.map((item, index) => <label key={`${item.mealType}-${index}`}>{item.mealType}<input value={item.itemText} onChange={(event) => setPlanItems((items) => items.map((next, nextIndex) => nextIndex === index ? { ...next, itemText: event.target.value } : next))} /></label>)}
          <button className="primary-button">Plan Oluştur</button>
          {plans.map((plan) => <article className="mini-record" key={plan.id}><strong>{plan.title}</strong><p>{plan.description}</p>{currentPlanItems.filter((item) => item.mealPlanId === plan.id).map((item) => <span key={item.id}>{item.mealType}: {item.itemText}</span>)}</article>)}
        </form>
      </div>
      <form className="panel form-grid" onSubmit={addCheckin}>
        <div className="section-title"><h2>Haftalık Kontroller</h2><ClipboardList size={18} /></div>
        <label>Haftalık değerlendirme<textarea value={checkinSummary} onChange={(event) => setCheckinSummary(event.target.value)} /></label>
        <label>Uyum skoru<input type="number" min="0" max="100" value={adherenceScore} onChange={(event) => setAdherenceScore(Number(event.target.value))} /></label>
        <label>Sonraki hedef<textarea value={nextGoal} onChange={(event) => setNextGoal(event.target.value)} /></label>
        <button className="primary-button">Haftalık Kontrol Kaydet</button>
        {checkins.map((checkin) => <article className="mini-record" key={checkin.id}><strong>Uyum %{checkin.adherenceScore}</strong><p>{checkin.summary}</p><span>{checkin.nextGoal}</span></article>)}
      </form>
    </div>
  );
};
