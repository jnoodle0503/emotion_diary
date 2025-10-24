# SEO 개선 사항 문서

## 개요
구글 애드센스 크롤러가 콘텐츠를 인식할 수 있도록 로그인 페이지와 데모 페이지의 SEO를 개선했습니다.

## 주요 변경 사항

### 1. SEO 메타 태그 추가

#### index.html (기본 HTML)
- **Title**: "Marden - 마음 일기 | AI와 함께하는 감정 일기장"
- **Description**: 서비스 설명 (약 150자)
- **Keywords**: 일기장, 감정일기, AI 일기, 마음 건강 등
- **Open Graph 태그**: 페이스북/소셜 미디어 공유용
- **Twitter Card 태그**: 트위터 공유용
- **Canonical URL**: https://marden-diary.vercel.app/
- **Structured Data (JSON-LD)**: Schema.org WebApplication 형식

#### 데모 페이지 (DemoPage.jsx)
- React Helmet을 사용한 동적 메타 태그
- 페이지별 SEO 최적화
- **추가 콘텐츠 섹션**: 500자 이상의 설명 텍스트 추가
  - 서비스 소개
  - 주요 기능 설명
  - 사용 방법 안내

#### 로그인 페이지 (Login.jsx)
- React Helmet을 사용한 동적 메타 태그
- 로그인 페이지 전용 SEO 태그
- **주의**: 애드센스 정책에 따라 로그인 페이지에는 광고를 배치하지 않음

### 2. 애드센스 광고 컴포넌트

#### 새로운 파일
- **src/components/AdSenseAd.jsx**: 재사용 가능한 애드센스 광고 컴포넌트
  - 동적 광고 슬롯 지원
  - 자동 응답형 광고
  - 에러 처리 포함

#### 광고 배치
- 데모 페이지의 섹션 사이에 2개의 광고 유닛 추가
- **중요**: `YOUR_AD_SLOT_ID_HERE`를 실제 애드센스 광고 슬롯 ID로 교체해야 함

### 3. 기술적 개선

#### React Helmet Async
- 설치: `react-helmet-async`
- main.jsx에 HelmetProvider 추가
- 페이지별 동적 메타 태그 관리

#### Noscript 태그
- JavaScript가 비활성화된 경우에도 기본 정보 표시
- 구글 봇이 JavaScript 실행 전에도 콘텐츠 읽을 수 있음

## 구글 봇 최적화

### 현재 상태
구글 봇은 최신 JavaScript를 실행할 수 있으므로, 다음과 같은 방식으로 최적화했습니다:

1. **HTML 헤드의 메타 태그**: JavaScript 실행 전에도 읽을 수 있음
2. **React Helmet**: JavaScript 실행 후 동적으로 페이지별 메타 태그 업데이트
3. **충분한 텍스트 콘텐츠**: 데모 페이지에 500자 이상의 설명 추가
4. **구조화된 데이터**: JSON-LD 형식으로 서비스 정보 제공

## 검증 방법

### 1. HTML 소스 보기
```bash
# 빌드 후 dist/index.html 확인
npm run build
```

브라우저에서 페이지 접속 후 `Ctrl+U` (페이지 소스 보기)로 메타 태그 확인

### 2. 구글 Search Console 테스트
1. [Google Search Console](https://search.google.com/search-console)에 접속
2. URL 검사 도구 사용
3. "라이브 테스트" 실행하여 구글 봇이 페이지를 어떻게 보는지 확인

### 3. Rich Results Test
https://search.google.com/test/rich-results 에서 구조화된 데이터 검증

## 다음 단계

### 1. 애드센스 광고 슬롯 설정
1. Google AdSense 계정에 로그인
2. "광고" > "광고 단위별" > "디스플레이 광고" 생성
3. 생성된 광고 슬롯 ID를 `src/pages/DemoPage.jsx`의 `YOUR_AD_SLOT_ID_HERE`에 입력

예시:
```jsx
<AdSenseAd
  adSlot="1234567890"  // 실제 슬롯 ID로 교체
  adFormat="auto"
  fullWidthResponsive={true}
/>
```

### 2. 배포 및 확인
```bash
# Vercel에 배포
git add .
git commit -m "SEO 개선 및 애드센스 광고 추가"
git push origin master
```

### 3. 구글 애드센스 크롤링 대기
- 애드센스 봇이 사이트를 다시 크롤링하는 데 며칠이 걸릴 수 있음
- Search Console에서 "색인 생성 요청" 실행 권장

## 파일 변경 목록

### 수정된 파일
- `index.html`: SEO 메타 태그, JSON-LD, noscript 추가
- `src/main.jsx`: HelmetProvider 추가
- `src/pages/DemoPage.jsx`: Helmet, 추가 콘텐츠, 광고 컴포넌트
- `src/pages/Login.jsx`: Helmet 추가
- `package.json`: react-helmet-async 의존성 추가

### 새로 생성된 파일
- `src/components/AdSenseAd.jsx`: 재사용 가능한 광고 컴포넌트
- `SEO_IMPROVEMENTS.md`: 이 문서

## 주의사항

### 애드센스 정책
- **로그인 페이지에 광고 금지**: 애드센스 정책 위반
- **데모 페이지에만 광고 배치**: 충분한 콘텐츠가 있는 페이지
- **광고와 콘텐츠 비율**: 광고가 콘텐츠보다 많으면 안 됨

### SEO 모범 사례
- 메타 설명: 150-160자 권장
- 제목 태그: 60자 이하 권장
- 키워드: 관련성 높은 키워드 5-10개
- Canonical URL: 중복 콘텐츠 방지

## 성과 측정

### Google Analytics 연동 권장
```javascript
// index.html에 추가
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### 모니터링 지표
- 페이지 조회수
- 광고 클릭률 (CTR)
- 광고 수익
- 검색 엔진 순위
- 크롤링 빈도

## 문제 해결

### 메타 태그가 보이지 않는 경우
1. 브라우저 캐시 삭제
2. 하드 리프레시 (Ctrl+Shift+R)
3. 빌드 다시 실행: `npm run build`

### 광고가 표시되지 않는 경우
1. 광고 슬롯 ID 확인
2. 애드센스 계정 승인 상태 확인
3. 브라우저 광고 차단기 비활성화
4. 개발자 콘솔에서 에러 확인

## 참고 자료
- [Google Search Central](https://developers.google.com/search)
- [Google AdSense Help](https://support.google.com/adsense)
- [React Helmet Async](https://github.com/staylor/react-helmet-async)
- [Schema.org](https://schema.org/)
