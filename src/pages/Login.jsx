import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "../lib/supabase";
import Mascot from "../components/Mascot"; // "마음이" 캐릭터 import
import { BASE_URL } from "../lib/domain";
import { Link } from "react-router-dom"; // Import Link
import "./Login.css"; // Import Login.css

function Login() {
  // Supabase Auth UI 테마 커스터마이징
  const customTheme = {
    ...ThemeSupa,
    variables: {
      ...ThemeSupa.variables, // 기존 variables를 스프레드
      default: {
        ...(ThemeSupa.variables?.default || {}), // default가 없을 경우 빈 객체 사용
        colors: {
          ...(ThemeSupa.variables?.default?.colors || {}), // colors가 없을 경우 빈 객체 사용
          brand: "var(--color-primary)", // 기본 브랜드 색상
          brandAccent: "var(--color-primary-light)", // 브랜드 강조 색상
          brandButtonText: "#FFFFFF", // 버튼 텍스트 색상
          defaultButtonBackground: "var(--color-surface)", // 기본 버튼 배경
          defaultButtonBackgroundHover: "var(--color-border)", // 기본 버튼 호버 배경
          defaultButtonBorder: "var(--color-border)", // 기본 버튼 테두리
          defaultButtonText: "var(--color-text-primary)", // 기본 버튼 텍스트
          inputBackground: "var(--color-surface)", // 입력 필드 배경
          inputBorder: "var(--color-border)", // 입력 필드 테두리
          inputBorderHover: "var(--color-primary)", // 입력 필드 테두리 호버
          inputBorderFocus: "var(--color-primary)", // 입력 필드 테두리 포커스
          inputText: "var(--color-text-primary)", // 입력 필드 텍스트
          inputLabel: "var(--color-text-secondary)", // 입력 필드 라벨
          inputPlaceholder: "var(--color-text-secondary)", // 입력 필드 플레이스홀더
          messageText: "var(--color-text-primary)", // 메시지 텍스트
          messageBackground: "var(--color-primary-light)", // 메시지 배경
          messageBorder: "var(--color-primary)", // 메시지 테두리
          anchorText: "var(--color-primary)", // 링크 텍스트
          anchorTextHover: "var(--color-primary)", // 링크 텍스트 호버
        },
      },
    },
    radii: {
      ...(ThemeSupa.radii || {}), // radii가 없을 경우 빈 객체 사용
      borderRadiusButton: "8px", // 버튼 모서리 둥글기
      borderRadiusInput: "8px", // 입력 필드 모서리 둥글기
    },
  };

  return (
    <div className="page-container login-page-container">
      <div className="mascot-container">
        <Mascot />
        <h1 className="login-title">Marden</h1>
        <p className="login-subtitle">
          당신의 하루를 기록하고 마음을 가꿔보세요.
        </p>
      </div>
      <div className="service-intro">
        <p>"Marden - 마음 일기"는 당신의 내면을 가꾸는 특별한 정원입니다. 🌿</p>
        <p>
          매일의 감정을 기록하며, 당신의 마음속 풍경을 섬세하게 들여다보세요.
        </p>
        <div className="feature-grid">
          <div className="feature-item">
            <span className="feature-icon">🌱</span>
            <h3>감정의 씨앗 심기</h3>
            <p>
              기쁨, 슬픔, 설렘... 다양한 감정의 씨앗을 기록하고, 시간이 흐름에
              따라 어떻게 자라나는지 관찰합니다.
            </p>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🫂</span>
            <h3>AI의 따뜻한 위로</h3>
            <p>
              당신의 이야기에 AI가 따뜻한 공감과 진심 어린 위로를 건넵니다.
              혼자만의 고민이 아닌, 함께 나누는 마음처럼 느껴질 거예요.
            </p>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🌳</span>
            <h3>성장의 열매 맺기</h3>
            <p>
              기록과 성찰을 통해 당신의 감정 패턴을 이해하고, 내면의 평화를
              찾아가는 여정 속에서 단단한 성장의 열매를 맺으세요.
            </p>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🔒</span>
            <h3>안전한 보관</h3>
            <p>
              당신의 소중한 마음 정원은 오직 당신만을 위한 안전한 공간에 소중히
              보관됩니다.
            </p>
          </div>
        </div>
      </div>
      <Link to="/demo" className="cta-button login-demo-button">
        <Mascot />
        데모 체험하기
      </Link>
      <div className="auth-ui-container">
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: customTheme }}
          providers={["google"]}
          onlyThirdPartyProviders={true}
          redirectTo={BASE_URL}
          queryParams={{
            prompt: 'select_account',
          }}
          localization={{
            variables: {
              sign_in: {
                social_provider_text: "{{provider}} 계정으로 로그인",
              },
            },
          }}
        />
      </div>
    </div>
  );
}

export default Login;