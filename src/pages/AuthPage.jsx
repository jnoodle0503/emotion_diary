import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Mascot from "../components/Mascot";
import { useAuth } from "../context/AuthContext";
import "./AuthPage.css";

function AuthPage() {
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
    <main className="auth-page">
        <Helmet>
          <title>로그인/회원가입 - Marden | 마음 일기</title>
          <meta
            name="description"
            content="Marden 마음 일기에 로그인하거나 회원가입하고 오늘의 마음 정원을 가꿔보세요."
          />
        </Helmet>

        <section className="auth-shell">
          <div className="auth-copy">
            <Mascot />
            <p className="auth-eyebrow">Marden</p>
            <h1>오늘의 마음 씨앗을 안전하게 심어보세요.</h1>
            <p>
              일기를 쓰면 마음 정원에 오늘의 기록이 남고, 원할 때 정원 손님에게 작은 위로 쪽지를 부탁할 수 있어요.
            </p>
            <Link to="/" className="auth-demo-link">
              데모 먼저 보기
            </Link>
          </div>

          <div className="auth-card">
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
        </section>
    </main>
  );
}

export default AuthPage;
