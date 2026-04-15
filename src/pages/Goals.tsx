import { FormEvent, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { ProgressBar } from "../components/ProgressBar";
import { StatusBadge } from "../components/StatusBadge";
import { useApp } from "../store/AppContext";
import { GoalStatus } from "../types";
import { todayIso } from "../utils/date";

export const Goals = () => {
  const { state, dispatch } = useApp();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [endDate, setEndDate] = useState(todayIso());
  const [error, setError] = useState("");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (title.trim().length < 3 || description.trim().length < 8) {
      setError("Başlık ve açıklama daha net olmalı.");
      return;
    }
    dispatch({
      type: "ADD_GOAL",
      payload: { id: "", title, description, startDate: todayIso(), endDate, progress: 0, status: "active", term: "short", subtasks: [] },
    });
    setTitle("");
    setDescription("");
    setError("");
  };

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Hedef takibi" title="Kısa ve uzun vadeli hedefler" description="Her hedefi tarih, durum, alt görev ve ilerleme yüzdesiyle takip et." />
      <div className="content-grid">
        <form className="panel form-grid" onSubmit={submit}>
          <div className="section-title"><h2>Hedef ekle</h2><Plus size={18} /></div>
          <label>Başlık<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Örn. 10 km koşu" /></label>
          <label>Açıklama<textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Başarı kriteri" /></label>
          <label>Bitiş tarihi<input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} /></label>
          {error ? <p className="form-error">{error}</p> : null}
          <button className="primary-button">Hedefi kaydet</button>
        </form>
        <section className="cards-grid">
          {state.goals.map((goal) => (
            <article className="panel goal-card" key={goal.id}>
              <div className="section-title">
                <h2>{goal.title}</h2>
                <StatusBadge value={goal.status} />
              </div>
              <p>{goal.description}</p>
              <ProgressBar value={goal.progress} label="Hedef ilerlemesi" />
              <div className="subtasks">{goal.subtasks.map((item) => <span key={item}>{item}</span>)}</div>
              <div className="goal-controls">
                <input type="range" min="0" max="100" value={goal.progress} onChange={(event) => dispatch({ type: "UPDATE_GOAL", payload: { ...goal, progress: Number(event.target.value) } })} />
                <select value={goal.status} onChange={(event) => dispatch({ type: "UPDATE_GOAL", payload: { ...goal, status: event.target.value as GoalStatus } })}>
                  <option value="active">Aktif</option>
                  <option value="completed">Tamamlandı</option>
                  <option value="paused">Ertelendi</option>
                </select>
                <button className="icon-button" onClick={() => dispatch({ type: "DELETE_GOAL", payload: goal.id })}><Trash2 size={16} /></button>
              </div>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
};
