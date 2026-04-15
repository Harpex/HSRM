import { FormEvent, useState } from "react";
import { CheckCircle2, Flame, Plus } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { ProgressBar } from "../components/ProgressBar";
import { useApp } from "../store/AppContext";
import { todayIso, weekDates, weekday } from "../utils/date";

export const Habits = () => {
  const { state, dispatch } = useApp();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Sağlık");
  const [target, setTarget] = useState(5);
  const [error, setError] = useState("");
  const days = weekDates();

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (title.trim().length < 3) {
      setError("Alışkanlık adı en az 3 karakter olmalı.");
      return;
    }
    dispatch({ type: "ADD_HABIT", payload: { id: "", title, category, targetPerWeek: target, streak: 0, completedDates: [] } });
    setTitle("");
    setError("");
  };

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Alışkanlık takibi" title="Seri ve devamlılık sistemi" description="Günlük işaretlemelerle alışkanlık zincirini görünür kıl." />
      <div className="content-grid">
        <form className="panel form-grid" onSubmit={submit}>
          <div className="section-title"><h2>Alışkanlık ekle</h2><Plus size={18} /></div>
          <label>Ad<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Örn. Egzersiz" /></label>
          <label>Kategori<input value={category} onChange={(event) => setCategory(event.target.value)} /></label>
          <label>Haftalık hedef<input type="number" min="1" max="7" value={target} onChange={(event) => setTarget(Number(event.target.value))} /></label>
          {error ? <p className="form-error">{error}</p> : null}
          <button className="primary-button">Alışkanlığı kaydet</button>
        </form>
        <section className="cards-grid">
          {state.habits.map((habit) => {
            const weeklyDone = days.filter((day) => habit.completedDates.includes(day)).length;
            return (
              <article className="panel habit-card" key={habit.id}>
                <div className="section-title"><h2>{habit.title}</h2><span>{habit.category}</span></div>
                <div className="streak"><Flame size={18} /> {habit.streak} gün seri</div>
                <ProgressBar value={Math.round((weeklyDone / habit.targetPerWeek) * 100)} label="Haftalık hedef" />
                <div className="week-checks">
                  {days.map((day) => (
                    <button
                      className={habit.completedDates.includes(day) ? "checked" : ""}
                      key={day}
                      onClick={() => dispatch({ type: "TOGGLE_HABIT_DATE", payload: { habitId: habit.id, date: day } })}
                    >
                      <span>{weekday(day)}</span>
                      <CheckCircle2 size={16} />
                    </button>
                  ))}
                </div>
                <button className="secondary-button" onClick={() => dispatch({ type: "TOGGLE_HABIT_DATE", payload: { habitId: habit.id, date: todayIso() } })}>
                  Bugünü işaretle
                </button>
              </article>
            );
          })}
        </section>
      </div>
    </div>
  );
};
