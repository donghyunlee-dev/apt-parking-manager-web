# 파킹케어 백오피스

아파트 주차 관리 시스템의 관리자용 웹 백오피스입니다. 인증, 경비원/입주민/방문 차량 관리, 통합 차량 조회 및 리포트, 공지사항 관리 기능을 포함합니다.

## 설치

```bash
npm install
```

## 실행

```bash
npm run dev
```

## 환경 변수

현재 로컬 개발은 MSW(Mock Service Worker)를 사용합니다. 별도 환경 변수는 필요하지 않습니다. 추후 API 서버 연동 시 `.env`에 다음 형태로 추가합니다.

```
VITE_API_BASE_URL=https://api.example.com
```

## 주요 명령

```bash
npm run lint
npm run test
npm run test:coverage
```

## 폴더 구조

```
src/
  features/    # 기능별 모듈
  shared/      # 공통 컴포넌트/훅/유틸
  api/         # API client 및 MSW
  routes/      # 라우팅
```
