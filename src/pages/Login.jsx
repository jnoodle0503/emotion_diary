import { useState } from "react";
import { Helmet } from "react-helmet-async"; // Import Helmet
import Mascot from "../components/Mascot"; // "마음이" 캐릭터 import
import { Link } from "react-router-dom"; // Import Link
import { useAuth } from "../context/AuthContext";
import "./Login.css"; // Import Login.css
import { useTranslation } from 'react-i18next'; // Import useTranslation

function Login() {
  const { t } = useTranslation(); // Initialize useTranslation
  const { signIn, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (mode === "register") {
        await register({ email, password, nickname });
      } else {
        await signIn({ email, password });
      }
    } catch (err) {
      console.error("Auth failed:", err);
      setError(err.message || "로그인 처리 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container login-page-container">
      <Helmet>
        <title>로그인 - Marden | 마음 일기</title>
        <meta
          name="description"
          content="Marden 마음 일기에 로그인하세요. 구글 계정으로 간편하게 시작할 수 있습니다. AI 캐릭터와 함께 감정을 기록하고 마음을 가꿔보세요."
        />
        <meta
          name="keywords"
          content="Marden 로그인, 일기장 로그인, 감정일기 시작하기, 마음 건강 앱"
        />
        <meta property="og:title" content="로그인 - Marden | 마음 일기" />
        <meta
          property="og:description"
          content="구글 계정으로 간편하게 로그인하고 AI와 함께 일기를 시작하세요."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://marden-diary.vercel.app/login" />
        <link rel="canonical" href="https://marden-diary.vercel.app/login" />
      </Helmet>

      <div className="mascot-container">
        <Mascot />
        <h1 className="login-title">{t('app_name')}</h1>
        <p className="login-subtitle">
          {t('login_subtitle')}
        </p>
      </div>
      <div className="service-intro">
        <p>{t('service_intro_part1')}</p>
        <p>
          {t('service_intro_part2')}
        </p>
        <div className="feature-grid">
          <div className="feature-item">
            <span className="feature-icon">🌱</span>
            <h3>{t('feature_seed_title')}</h3>
            <p>
              {t('feature_seed_description')}
            </p>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🫂</span>
            <h3>{t('feature_ai_comfort_title')}</h3>
            <p>
              {t('feature_ai_comfort_description')}
            </p>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🌳</span>
            <h3>{t('feature_growth_title')}</h3>
            <p>
              {t('feature_growth_description')}
            </p>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🔒</span>
            <h3>{t('feature_secure_storage_title')}</h3>
            <p>
              {t('feature_secure_storage_description')}
            </p>
          </div>
        </div>
      </div>
      <Link to="/" className="cta-button login-demo-button">
        <Mascot />
        {t('experience_demo')}
      </Link>
      <div className="auth-ui-container">
        <div className="auth-mode-tabs" aria-label="로그인 방식">
          <button
            type="button"
            className={mode === "login" ? "active" : ""}
            onClick={() => setMode("login")}
          >
            로그인
          </button>
          <button
            type="button"
            className={mode === "register" ? "active" : ""}
            onClick={() => setMode("register")}
          >
            회원가입
          </button>
        </div>
        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            이메일
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </label>
          <label>
            비밀번호
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={mode === "register" ? "new-password" : "current-password"}
              minLength={8}
              required
            />
          </label>
          {mode === "register" && (
            <label>
              닉네임
              <input
                type="text"
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                autoComplete="nickname"
              />
            </label>
          )}
          {error && <p className="login-error">{error}</p>}
          <button type="submit" disabled={submitting}>
            {submitting ? "처리 중..." : mode === "register" ? "회원가입" : "로그인"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
