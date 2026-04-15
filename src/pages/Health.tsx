import { FormEvent, useState } from "react";
import { Activity, Droplets, Footprints, HeartPulse, Moon } from "lucide-react";
import { MetricCard } from "../components/MetricCard";
import { PageHeader } from "../components/PageHeader";
import { SimpleChart } from "../components/SimpleChart";
import { useApp } from "../store/AppContext";
import { Mood } from "../types";
import { todayIso } from "../utils/date";
import { healthForDate } from "../utils/metrics";

export const Health = () => {
  const { state, dispatch } = useApp();
  const latest = healthForDate(state.health);
  const [entry, setEntry] = useState(latest);
  const [error, setError] = useState("");

  const update = (key: keyof typeof entry, value: string | number) => setEntry({ ...entry, [key]: value });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (entry.weight <= 0 || entry.height <= 0) {
      setError("Kilo ve boy değerleri geçerli olmalı.");
      return;
    }
    dispatch({ type: "UPSERT_HEALTH", payload: { ...entry, id: entry.id || `health-${Date.now()}`, date: todayIso() } });
    setError("");
  };

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Sağlık takibi" title="Günlük temel sağlık verileri" description="Kilo, su, uyku, adım, tansiyon, nabız, ruh hali ve enerji kaydını güncelle." />
      <div className="metric-grid">
        <MetricCard title="Kilo" value={`${latest.weight.toFixed(1)} kg`} detail={`${latest.height} cm`} icon={<Activity />} tone="teal" />
        <MetricCard title="Su" value={`${latest.water} L`} detail={`${state.profile.waterTarget} L hedef`} icon={<Droplets />} tone="green" />
        <MetricCard title="Uyku" value={`${latest.sleep} sa`} detail="Son kayıt" icon={<Moon />} tone="amber" />
        <MetricCard title="Adım" value={latest.steps} detail={`${state.profile.stepTarget} hedef`} icon={<Footprints />} tone="coral" />
      </div>
      <div className="content-grid">
        <form className="panel form-grid" onSubmit={submit}>
          <div className="section-title"><h2>Bugünkü kayıt</h2><HeartPulse size={18} /></div>
          <div className="two-col"><label>Kilo<input type="number" value={entry.weight} onChange={(event) => update("weight", Number(event.target.value))} /></label><label>Boy<input type="number" value={entry.height} onChange={(event) => update("height", Number(event.target.value))} /></label></div>
          <div className="two-col"><label>Su<input type="number" step="0.1" value={entry.water} onChange={(event) => update("water", Number(event.target.value))} /></label><label>Uyku<input type="number" step="0.1" value={entry.sleep} onChange={(event) => update("sleep", Number(event.target.value))} /></label></div>
          <div className="two-col"><label>Adım<input type="number" value={entry.steps} onChange={(event) => update("steps", Number(event.target.value))} /></label><label>Nabız<input type="number" value={entry.pulse} onChange={(event) => update("pulse", Number(event.target.value))} /></label></div>
          <div className="two-col"><label>Tansiyon<input value={entry.bloodPressure} onChange={(event) => update("bloodPressure", event.target.value)} /></label><label>Ruh hali<select value={entry.mood} onChange={(event) => update("mood", event.target.value as Mood)}><option value="dusuk">Düşük</option><option value="dengeli">Dengeli</option><option value="iyi">İyi</option><option value="harika">Harika</option></select></label></div>
          <label>Enerji seviyesi<input type="range" min="0" max="100" value={entry.energy} onChange={(event) => update("energy", Number(event.target.value))} /></label>
          {error ? <p className="form-error">{error}</p> : null}
          <button className="primary-button">Sağlık kaydını güncelle</button>
        </form>
        <SimpleChart title="Su tüketimi" suffix="L" data={state.health.slice(-7).map((item) => ({ label: item.date.slice(5), value: item.water }))} />
      </div>
      <SimpleChart title="Uyku ve enerji görünümü" data={state.health.slice(-7).map((item) => ({ label: item.date.slice(5), value: Math.round((item.sleep / state.profile.sleepTarget) * 100) }))} suffix="%" />
    </div>
  );
};
