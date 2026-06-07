import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Mascot from "../components/Mascot";
import "./Login.css";

const FEATURES = [
  {
    title: "마음 씨앗",
    text: "하루의 감정과 사건을 조용히 남기고, 달력에서 자연스럽게 되돌아볼 수 있어요.",
  },
  {
    title: "정원 손님의 쪽지",
    text: "마음 씨앗을 심으면 정원 손님에게 작은 위로 쪽지를 부탁해둘 수 있어요.",
  },
  {
    title: "마음 정원 기록",
    text: "월별 기록으로 반복되는 마음의 흐름을 차분하게 확인해요.",
  },
  {
    title: "개인 보관",
    text: "내가 쓴 일기는 안전하게 저장되고, 필요한 순간 다시 꺼내볼 수 있어요.",
  },
];

function Login() {
  return (
    <main className="login-marketing-page">
        <Helmet>
          <title>Marden 소개 - 마음 일기</title>
          <meta
            name="description"
            content="Marden 마음 일기의 마음 씨앗, 정원 손님의 쪽지, 마음 정원 기록 기능을 확인하고 로그인 또는 회원가입을 시작하세요."
          />
        </Helmet>

        <section className="login-hero">
          <div className="login-hero-copy">
            <Mascot />
            <p className="login-eyebrow">Marden 마음 일기</p>
            <h1>오늘의 마음을 심고, 천천히 돌보는 공간.</h1>
            <p>
              Marden은 매일의 감정을 마음 정원에 조용히 심어두는 감정 일기 서비스입니다.
              원한다면 정원에 찾아온 손님이 작은 위로 쪽지를 남기며, 이 기능에는 인공지능 기술이 활용됩니다.
            </p>
            <div className="login-hero-actions">
              <Link to="/auth" className="login-primary-action">
                로그인/회원가입
              </Link>
              <Link to="/" className="login-secondary-action">
                데모 보기
              </Link>
            </div>
          </div>
          <div className="login-preview-panel" aria-hidden="true">
            <div className="preview-date">오늘의 마음</div>
            <div className="preview-emotions">
              <span>평온</span>
              <span>불안</span>
            </div>
            <p>
              중요한 일을 앞두고 조금 긴장됐지만, 그래도 준비한 만큼 차분히 해보고 싶다.
            </p>
            <div className="preview-ai">
              <strong>오래된 정원을 돌보던 기록가 정원 손님이 남긴 쪽지</strong>
              <span>긴장 속에서도 차분히 준비한 마음이 느껴져요.</span>
            </div>
          </div>
        </section>

        <section className="login-feature-grid">
          {FEATURES.map((feature) => (
            <article key={feature.title} className="login-feature-item">
              <h2>{feature.title}</h2>
              <p>{feature.text}</p>
            </article>
          ))}
        </section>
    </main>
  );
}

export default Login;
