import { FormEvent, useState } from "react";
import { Download, Moon, User } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { useApp } from "../store/AppContext";

export const Profile = () => {
  const { state, dispatch } = useApp();
  const [profile, setProfile] = useState(state.profile);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    dispatch({ type: "UPDATE_PROFILE", payload: profile });
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "lifetrack-veri.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Profil ve ayarlar" title="Hedef değerlerini kişiselleştir" description="Kalori, su, adım, uyku ve koyu mod ayarlarını güncelle." />
      <div className="content-grid">
        <form className="panel form-grid" onSubmit={submit}>
          <div className="section-title"><h2>Profil</h2><User size={18} /></div>
          <label>Kullanıcı adı<input value={profile.username} disabled /></label>
          <label>E-posta<input value={profile.email} disabled /></label>
          <div className="two-col"><label>Kalori hedefi<input type="number" value={profile.calorieTarget} onChange={(event) => setProfile({ ...profile, calorieTarget: Number(event.target.value) })} /></label><label>Su hedefi<input type="number" step="0.1" value={profile.waterTarget} onChange={(event) => setProfile({ ...profile, waterTarget: Number(event.target.value) })} /></label></div>
          <div className="two-col"><label>Adım hedefi<input type="number" value={profile.stepTarget} onChange={(event) => setProfile({ ...profile, stepTarget: Number(event.target.value) })} /></label><label>Uyku hedefi<input type="number" step="0.1" value={profile.sleepTarget} onChange={(event) => setProfile({ ...profile, sleepTarget: Number(event.target.value) })} /></label></div>
          <label className="toggle-row"><input type="checkbox" checked={profile.darkMode} onChange={(event) => setProfile({ ...profile, darkMode: event.target.checked })} /><Moon size={18} /> Koyu mod</label>
          <button className="primary-button">Ayarları kaydet</button>
        </form>
        <section className="panel">
          <div className="section-title"><h2>Veri dışa aktarımı</h2><Download size={18} /></div>
          <p className="analysis-text">Tüm demo verisini JSON olarak indirebilirsin. Bu yapı ileride API veya veritabanı katmanına bağlanmaya hazır tutuldu.</p>
          <button className="secondary-button" onClick={exportData}>JSON dışa aktar</button>
        </section>
      </div>
    </div>
  );
};
