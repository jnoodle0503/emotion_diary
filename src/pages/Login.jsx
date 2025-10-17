import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "../lib/supabase";
import Mascot from "../components/Mascot"; // "마음이" 캐릭터 import
import { BASE_URL } from "../lib/domain";
import { Link } from "react-router-dom"; // Import Link
import "./Login.css"; // Import Login.css
import { useTranslation } from 'react-i18next'; // Import useTranslation

function Login() {
  const { t } = useTranslation(); // Initialize useTranslation
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
                social_provider_text: t('login_with_provider'),
              },
            },
          }}
        />
      </div>
    </div>
  );
}

export default Login;