import { FormEvent, useState } from "react";
import { activityLabels, validateHealthProfile } from "../utils/healthCalculations";
import { ActivityLevel, Gender, UserHealthProfile } from "../types";

interface HealthProfileFormProps {
  initialProfile: UserHealthProfile;
  submitLabel: string;
  onSubmit: (profile: UserHealthProfile) => void;
}

export const HealthProfileForm = ({ initialProfile, submitLabel, onSubmit }: HealthProfileFormProps) => {
  const [profile, setProfile] = useState(initialProfile);
  const [message, setMessage] = useState("");

  const update = <Key extends keyof UserHealthProfile>(key: Key, value: UserHealthProfile[Key]) => {
    setProfile((current) => ({ ...current, [key]: value }));
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const error = validateHealthProfile(profile);
    if (error) {
      setMessage(error);
      return;
    }
    setMessage("");
    onSubmit({ ...profile, updatedAt: new Date().toISOString() });
  };

  return (
    <form className="panel form-grid" onSubmit={submit}>
      <div className="section-title">
        <h2>Profil Bilgileri</h2>
      </div>
      <div className="two-col">
        <label>Kullanıcı adı<input value={profile.username} disabled /></label>
        <label>E-posta<input value={profile.email} disabled /></label>
      </div>
      <div className="three-col">
        <label>Yaş<input type="number" min="10" max="120" value={profile.age} onChange={(event) => update("age", Number(event.target.value))} /></label>
        <label>Cinsiyet<select value={profile.gender} onChange={(event) => update("gender", event.target.value as Gender)}><option value="">Seçim yok</option><option value="kadin">Kadın</option><option value="erkek">Erkek</option><option value="belirtmek_istemiyorum">Belirtmek istemiyorum</option></select></label>
        <label>Aktivite seviyesi<select value={profile.activityLevel} onChange={(event) => update("activityLevel", event.target.value as ActivityLevel)}>{Object.entries(activityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      </div>
      <div className="three-col">
        <label>Boy (cm)<input type="number" min="50" max="300" value={profile.heightCm} onChange={(event) => update("heightCm", Number(event.target.value))} /></label>
        <label>Kilo (kg)<input type="number" min="20" max="500" step="0.1" value={profile.weightKg} onChange={(event) => update("weightKg", Number(event.target.value))} /></label>
        <label>Hedef Kilo<input type="number" min="20" max="500" step="0.1" value={profile.targetWeightKg} onChange={(event) => update("targetWeightKg", Number(event.target.value))} /></label>
      </div>
      <div className="three-col">
        <label>Günlük su hedefi (ml)<input type="number" min="1" max="10000" value={profile.dailyWaterGoalMl} onChange={(event) => update("dailyWaterGoalMl", Number(event.target.value))} /></label>
        <label>Adım Hedefi<input type="number" min="0" max="100000" value={profile.dailyStepGoal} onChange={(event) => update("dailyStepGoal", Number(event.target.value))} /></label>
        <label>Kalori hedefi<input type="number" min="0" max="15000" value={profile.dailyCalorieGoal ?? 0} onChange={(event) => update("dailyCalorieGoal", Number(event.target.value))} /></label>
      </div>
      <label>Uyku hedefi (saat)<input type="number" min="0" max="24" step="0.1" value={profile.sleepGoalHours} onChange={(event) => update("sleepGoalHours", Number(event.target.value))} /></label>
      <label>Hedef açıklaması<textarea value={profile.goalDescription} onChange={(event) => update("goalDescription", event.target.value)} placeholder="Bu dönem hedefin ne?" /></label>
      <label>Notlar / kişisel not<textarea value={profile.notes} onChange={(event) => update("notes", event.target.value)} placeholder="Kendine kısa bir not" /></label>
      {message ? <p className="form-error">{message}</p> : null}
      <button className="primary-button" type="submit">{submitLabel}</button>
    </form>
  );
};
