// 환경에 따른 API 기본 URL 설정
const getApiBase = () => {
  // 개발 환경인지 확인 (Vite dev server)
  // @ts-ignore - Vite specific import.meta.env
  if (import.meta.env?.DEV) {
    return "http://localhost:8000/api";
  }

  // 프로덕션 환경에서는 여러 후보 시도
  const candidates = [
    "http://localhost:8000/api",
    "http://127.0.0.1:8000/api",
  ];

  return candidates[0]; // 첫 번째 후보를 기본값으로 사용
};

export const API_BASE = getApiBase();

// API 연결 상태 확인을 위한 후보 URL들
export const API_CANDIDATES = [
  "http://localhost:8000/api",
  "http://127.0.0.1:8000/api",
];
