import { FormEvent, useMemo, useState } from "react";
import { Plus, Search, Trash2 } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";
import { useApp } from "../store/AppContext";
import { Priority, TaskStatus } from "../types";
import { todayIso } from "../utils/date";
import { tasksForDate } from "../utils/metrics";

export const Planner = () => {
  const { state, dispatch } = useApp();
  const [date, setDate] = useState(todayIso());
  const [query, setQuery] = useState("");
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [status, setStatus] = useState<TaskStatus>("pending");
  const [priority, setPriority] = useState<Priority>("medium");
  const [reminder, setReminder] = useState("08:50");
  const [note, setNote] = useState(state.notes.find((item) => item.date === date)?.text ?? "");
  const [reflection, setReflection] = useState(state.notes.find((item) => item.date === date)?.reflection ?? "");
  const [error, setError] = useState("");

  const tasks = useMemo(
    () => tasksForDate(state.tasks, date).filter((task) => task.title.toLowerCase().includes(query.toLowerCase())),
    [date, query, state.tasks],
  );

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (title.trim().length < 3) {
      setError("Görev başlığı en az 3 karakter olmalı.");
      return;
    }
    dispatch({
      type: "ADD_TASK",
      payload: { id: "", title, date, startTime, endTime, status, priority, reminder, notes: "" },
    });
    setTitle("");
    setError("");
  };

  const saveNotes = () => dispatch({ type: "UPSERT_NOTE", payload: { date, text: note, reflection } });

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Günlük program" title="Saat bazlı planlayıcı" description="Görevlerini öncelik, durum ve hatırlatıcıyla birlikte düzenle." />
      <div className="toolbar">
        <label>
          Tarih
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        </label>
        <label className="search-field">
          <Search size={16} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Görev ara" />
        </label>
      </div>
      <div className="content-grid">
        <form className="panel form-grid" onSubmit={submit}>
          <div className="section-title">
            <h2>Görev ekle</h2>
            <Plus size={18} />
          </div>
          <label>Başlık<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Yeni görev" /></label>
          <div className="two-col">
            <label>Başlangıç<input type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} /></label>
            <label>Bitiş<input type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} /></label>
          </div>
          <div className="two-col">
            <label>Durum<select value={status} onChange={(event) => setStatus(event.target.value as TaskStatus)}><option value="pending">Bekliyor</option><option value="active">Devam ediyor</option><option value="done">Tamamlandı</option></select></label>
            <label>Öncelik<select value={priority} onChange={(event) => setPriority(event.target.value as Priority)}><option value="low">Düşük</option><option value="medium">Orta</option><option value="high">Yüksek</option></select></label>
          </div>
          <label>Hatırlatıcı<input type="time" value={reminder} onChange={(event) => setReminder(event.target.value)} /></label>
          {error ? <p className="form-error">{error}</p> : null}
          <button className="primary-button" type="submit">Görevi kaydet</button>
        </form>
        <section className="panel">
          <div className="section-title">
            <h2>Günlük akış</h2>
            <span>{tasks.length} görev</span>
          </div>
          <div className="task-list">
            {tasks.map((task) => (
              <article className="task-row" key={task.id}>
                <time>{task.startTime}</time>
                <div>
                  <strong>{task.title}</strong>
                  <span>{task.endTime} · <StatusBadge value={task.priority} /></span>
                </div>
                <select value={task.status} onChange={(event) => dispatch({ type: "UPDATE_TASK", payload: { ...task, status: event.target.value as TaskStatus } })}>
                  <option value="pending">Bekliyor</option>
                  <option value="active">Devam ediyor</option>
                  <option value="done">Tamamlandı</option>
                </select>
                <button className="icon-button" onClick={() => dispatch({ type: "DELETE_TASK", payload: task.id })}><Trash2 size={16} /></button>
              </article>
            ))}
          </div>
        </section>
      </div>
      <section className="panel form-grid">
        <div className="section-title"><h2>Günlük not ve değerlendirme</h2></div>
        <textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Bugünün odağı" />
        <textarea value={reflection} onChange={(event) => setReflection(event.target.value)} placeholder="Gün sonu değerlendirmesi" />
        <button className="secondary-button" onClick={saveNotes}>Notları kaydet</button>
      </section>
    </div>
  );
};
