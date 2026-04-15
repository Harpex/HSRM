import { FormEvent, useState } from "react";
import { DailyLog } from "../types";
import { validateDailyLog } from "../utils/healthCalculations";

interface DailyTrackingFormProps {
  initialLog: DailyLog;
  onSubmit: (log: DailyLog) => void;
}

export const DailyTrackingForm = ({ initialLog, onSubmit }: DailyTrackingFormProps) => {
  const [log, setLog] = useState(initialLog);
  const [message, setMessage] = useState("");

  const update = <Key extends keyof DailyLog>(key: Key, value: DailyLog[Key]) => {
    setLog((current) => ({ ...current, [key]: value }));
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const error = validateDailyLog(log);
    if (error) {
      setMessage(error);
      return;
    }
    setMessage("");
    onSubmit({ ...log, updatedAt: new Date().toISOString() });
  };

  return (
    <form className="panel form-grid" onSubmit={submit}>
      <div className="section-title">
        <h2>Günlük Takip</h2>
      </div>
      <label>Tarih<input type="date" value={log.date} onChange={(event) => update("date", event.target.value)} /></label>
      <div className="two-col">
        <label>Su Tüketimi (ml)<input type="number" min="0" max="15000" value={log.waterIntakeMl} onChange={(event) => update("waterIntakeMl", Number(event.target.value))} /></label>
        <label>Bugünkü adım sayısı<input type="number" min="0" max="150000" value={log.stepsCount} onChange={(event) => update("stepsCount", Number(event.target.value))} /></label>
      </div>
      <div className="two-col">
        <label>Bugünkü uyku süresi<input type="number" min="0" max="24" step="0.1" value={log.sleepHours} onChange={(event) => update("sleepHours", Number(event.target.value))} /></label>
        <label>Kalori alımı<input type="number" min="0" max="20000" value={log.calorieIntake ?? 0} onChange={(event) => update("calorieIntake", Number(event.target.value))} /></label>
      </div>
      <label>Günlük kilo kaydı<input type="number" min="0" max="500" step="0.1" value={log.weightKgSnapshot ?? 0} onChange={(event) => update("weightKgSnapshot", Number(event.target.value))} /></label>
      {message ? <p className="form-error">{message}</p> : null}
      <button className="primary-button" type="submit">Verileri Kaydet</button>
    </form>
  );
};
