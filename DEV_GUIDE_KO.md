# 개발 가이드

## 코딩 컨벤션
- TypeScript strict 모드 유지
- 함수/컴포넌트는 단일 책임 원칙을 준수
- 네이밍: 컴포넌트 `PascalCase`, 훅 `useXxx`, 변수/함수 `camelCase`

## 폴더 구조
- `src/features`: 기능별 모듈 (auth, bouncer, resident 등)
- `src/shared`: 공통 컴포넌트/훅/유틸/타입
- `src/api`: API 클라이언트 및 MSW 핸들러
- `src/routes`: 라우팅

## 컴포넌트 작성 규칙
- props 타입을 명시
- 상태/사이드이펙트는 최소화
- 재사용 컴포넌트는 `shared/components`에 배치

## 상태/데이터 관리
- 전역 상태: Zustand
- 서버 상태: TanStack Query
- 폼: react-hook-form + zod

## 스타일
- Tailwind CSS 기반
- 다크 모드 지원: `dark:` 클래스 사용
