# Chinook Electron + React + FastAPI 통합 실행 안내

## 1. Python 백엔드 준비

```
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
# source venv/bin/activate
pip install -r requirements.txt
```

## 2. 개발 모드 실행

```
# venv 활성화 상태에서
npm install
npm run dev
```

- FastAPI(8000), Vite(5173), Electron이 동시에 실행됩니다.
- 프론트엔드의 모든 API 요청은 http://localhost:8000/api로 전송됩니다.

## 3. 배포 빌드

```
npm run build
# electron-builder 등으로 패키징
```

## 4. 주요 구조

- electron/main.js : Electron 메인 프로세스, Python 백엔드 자동 실행
- src/ : React 프론트엔드
- backend/ : FastAPI 백엔드 (venv 권장)

## 5. 참고

- Python, Node.js, npm, venv, FastAPI, Electron, Vite, Tailwind, shadcn 등 최신 스택 기반
- cross-platform 지원 (Windows/macOS/Linux)
- API 주소는 항상 http://localhost:8000/api로 고정

# 구현 환경

- 프론트엔드 : Typescript & Vite
- 백앤드 : Python
- 빌드 : electron

## 요청 사항

- db/chinook.db를 조회, 가공(계산 등) 할 수 있는 프로그램 보여 줘
- 프로트앤드에 CheckBox 컨트롤, 실행 버튼 컨트롤, 테이블, 차트 등 예제를 보여 줘
- package.json에는 debug, lint, build, production 명령어 정도 세팅해 줘
- 추가적으로 필요한 것 있으면 알아서 구현해 줘
- 권한 요청은 무조건 수락임 묻지 말고 진행해 줘

## 개발 순서 요약

1. 프로트앤드 개발
2. 백앤드 개발
3. 프로트앤드 & 백앤드 연동
4. 빌드 시스템
