import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useApp } from "../store/AppContext";

export const Login = () => {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [name, setName] = useState(state.profile.name);
  const [email, setEmail] = useState(state.profile.email);
  const [error, setError] = useState("");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (name.trim().length < 2 || !email.includes("@")) {
      setError("Lütfen geçerli bir ad ve e-posta gir.");
      return;
    }
    dispatch({ type: "LOGIN", payload: { name, email } });
    navigate("/dashboard");
  };

  return (
    <main className="auth-page">
      <section className="auth-copy">
        <span className="eyebrow">Kişisel gelişim ve yaşam takibi</span>
        <h1>Bugününü planla, haftanı ölç, ayını güçlendir.</h1>
        <p>Görevler, hedefler, kalori, sağlık ve alışkanlıklar tek düzenli panelde.</p>
        <div className="quote">
          <Sparkles size={18} />
          Küçük ritimler büyük değişimleri taşır.
        </div>
      </section>
      <form className="auth-card" onSubmit={submit}>
        <h2>Giriş / kayıt</h2>
        <label>
          Ad soyad
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Adın" />
        </label>
        <label>
          E-posta
          <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="ornek@mail.com" />
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        <button className="primary-button" type="submit">
          Demo panele geç
        </button>
      </form>
    </main>
  );
};
