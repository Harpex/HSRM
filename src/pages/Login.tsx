import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LockKeyhole, Sparkles, UserPlus } from "lucide-react";
import { createUser, findLoginUser, validateRegisterInput } from "../services/auth";
import { useApp } from "../store/AppContext";

type AuthMode = "login" | "register";

export const Login = () => {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("login");
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [role, setRole] = useState<"user" | "dietitian">("user");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setError("");
    setSuccess("");
  };

  const submitLogin = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    const result = await findLoginUser({ identifier: loginIdentifier, password: loginPassword }, state.users);

    if (!result.user) {
      setError(result.error);
      return;
    }

    dispatch({ type: "LOGIN_USER", payload: result.user });
    navigate(result.user.role === "dietitian" ? "/dietitian" : "/dashboard");
  };

  const submitRegister = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    const validationError = validateRegisterInput({ username, fullName, email, password, passwordConfirm, role }, state.users);

    if (validationError) {
      setError(validationError);
      return;
    }

    const user = await createUser({ username, fullName, email, password, passwordConfirm, role });
    dispatch({ type: "REGISTER_USER", payload: user });
    setSuccess("Hesap oluşturuldu. Yönlendiriliyorsun.");
    navigate(user.role === "dietitian" ? "/dietitian" : "/onboarding");
  };

  return (
    <main className="auth-page">
      <section className="auth-copy">
        <span className="eyebrow">Kişisel gelişim ve yaşam takibi</span>
        <h1>Bugününü planla, haftanı ölç, ayını güçlendir.</h1>
        <p>Kalıcı hesabınla görevlerini, hedeflerini, kalori ve sağlık kayıtlarını aynı düzende takip et.</p>
        <div className="quote">
          <Sparkles size={18} />
          Küçük ritimler büyük değişimleri taşır.
        </div>
      </section>

      <section className="auth-card">
        <div className="role-tabs" aria-label="Rol seçimi">
          <button className={role === "user" ? "active" : ""} onClick={() => setRole("user")} type="button">
            Normal Kullanıcı
          </button>
          <button className={role === "dietitian" ? "active" : ""} onClick={() => setRole("dietitian")} type="button">
            Diyetisyen
          </button>
        </div>

        <div className="auth-tabs" role="tablist" aria-label="Kimlik doğrulama seçenekleri">
          <button className={mode === "login" ? "active" : ""} onClick={() => switchMode("login")} type="button">
            <LockKeyhole size={17} />
            {role === "dietitian" ? "Diyetisyen Girişi" : "Oturum Aç"}
          </button>
          <button className={mode === "register" ? "active" : ""} onClick={() => switchMode("register")} type="button">
            <UserPlus size={17} />
            {role === "dietitian" ? "Diyetisyen Hesabı Oluştur" : "Hesap Oluştur"}
          </button>
        </div>

        {mode === "login" ? (
          <form className="auth-form" onSubmit={submitLogin}>
            <div>
              <h2>{role === "dietitian" ? "Diyetisyen Girişi" : "Oturum Aç"}</h2>
              <p>
                {role === "dietitian"
                  ? "Diyetisyen hesabınla danışan paneline geç."
                  : "Kayıtlı e-posta adresin veya kullanıcı adınla devam et."}
              </p>
            </div>
            <label>
              E-posta veya Kullanıcı Adı
              <input
                autoComplete="username"
                value={loginIdentifier}
                onChange={(event) => setLoginIdentifier(event.target.value)}
                placeholder="harpex veya ornek@mail.com"
              />
            </label>
            <label>
              Şifre
              <input
                autoComplete="current-password"
                type="password"
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
                placeholder="Şifren"
              />
            </label>
            {error ? <p className="form-error">{error}</p> : null}
            <button className="primary-button" type="submit">
              Oturum Aç
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={submitRegister}>
            <div>
              <h2>{role === "dietitian" ? "Diyetisyen Hesabı Oluştur" : "Hesap Oluştur"}</h2>
              <p>
                {role === "dietitian"
                  ? "Danışanlarını takip etmek için diyetisyen hesabı oluştur."
                  : "Benzersiz kullanıcı adı ve e-posta ile kalıcı alpha hesabı oluştur."}
              </p>
            </div>
            <label>
              Kullanıcı Adı
              <input
                autoComplete="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="harpex"
              />
            </label>
            <label>
              Ad Soyad
              <input
                autoComplete="name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Adın ve soyadın"
              />
            </label>
            <label>
              E-posta
              <input
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="ornek@mail.com"
              />
            </label>
            <label>
              Şifre
              <input
                autoComplete="new-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="En az 8 karakter"
              />
            </label>
            <label>
              Şifre Tekrar
              <input
                autoComplete="new-password"
                type="password"
                value={passwordConfirm}
                onChange={(event) => setPasswordConfirm(event.target.value)}
                placeholder="Şifreni tekrar gir"
              />
            </label>
            <p className="auth-note">Şifre cihazında salt ile hashlenir; düz metin olarak saklanmaz.</p>
            {error ? <p className="form-error">{error}</p> : null}
            {success ? <p className="form-success">{success}</p> : null}
            <button className="primary-button" type="submit">
              Hesap Oluştur
            </button>
          </form>
        )}
      </section>
    </main>
  );
};
