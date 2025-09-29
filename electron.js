const { app, BrowserWindow, Menu } = require("electron");
const path = require("path");
const { spawn } = require("child_process");

// 개발/프로덕션 환경 감지 개선
const isDev = process.env.NODE_ENV === "development" ||
             process.defaultApp ||
             /[\\/]electron-prebuilt[\\/]/.test(process.execPath) ||
             /[\\/]electron[\\/]/.test(process.execPath);
let mainWindow;
let backendProcess;
let backendStartAttempts = 0;
const MAX_BACKEND_ATTEMPTS = 3;

// 로깅 개선
function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}

function logError(message, error = null) {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] ERROR: ${message}`);
  if (error) {
    console.error(`[${timestamp}] ${error}`);
  }
}

function createWindow() {
  // 메인 윈도우 생성
  mainWindow = new BrowserWindow({
    height: 1440,
    width: 1920,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    show: false, // 로딩 완료 후 표시
  });

  // 윈도우 로딩 완료 후 표시
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  // 메뉴바 제거 (개발 시에는 유지)
  if (!isDev) {
    Menu.setApplicationMenu(null);
  }

  if (isDev) {
    // 개발 환경에서는 개발 서버 연결
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    // 프로덕션 환경에서는 빌드된 파일 로드
    mainWindow.loadFile(path.join(__dirname, "dist/index.html"));
  }
}

function startBackendServer() {
  backendStartAttempts++;
  log(`백엔드 서버를 시작합니다... (시도 ${backendStartAttempts}/${MAX_BACKEND_ATTEMPTS})`);
  log(`환경: ${isDev ? 'Development' : 'Production'}`);

  // 환경별 백엔드 경로 및 실행 방법 결정
  const getBackendConfig = () => {
    if (isDev) {
      // 개발 환경: uv 또는 python으로 소스 실행
      const sourcePath = path.join(__dirname, "backend");
      log(`개발 환경 - 소스 경로: ${sourcePath}`);
      return {
        type: 'source',
        path: sourcePath,
        executable: null,
        args: null
      };
    } else {
      // 프로덕션 환경: 빌드된 실행파일 실행
      const exePath = path.join(process.resourcesPath, "backend", "dist", "main", "main.exe");
      const fallbackExePath = path.join(__dirname, "backend", "dist", "main", "main.exe");

      log(`프로덕션 환경 - 실행파일 검색:`);
      log(`  Primary path: ${exePath} (exists: ${require("fs").existsSync(exePath)})`);
      log(`  Fallback path: ${fallbackExePath} (exists: ${require("fs").existsSync(fallbackExePath)})`);

      if (require("fs").existsSync(exePath)) {
        return {
          type: 'executable',
          path: path.dirname(exePath),
          executable: exePath,
          args: []
        };
      } else if (require("fs").existsSync(fallbackExePath)) {
        return {
          type: 'executable',
          path: path.dirname(fallbackExePath),
          executable: fallbackExePath,
          args: []
        };
      } else {
        // 실행파일이 없으면 소스로 fallback
        logError("실행파일을 찾을 수 없습니다. 소스 코드로 실행을 시도합니다.");
        return {
          type: 'source',
          path: path.join(__dirname, "backend"),
          executable: null,
          args: null
        };
      }
    }
  };

  const config = getBackendConfig();
  log(`Backend config: ${JSON.stringify(config, null, 2)}`);

  try {
    if (config.type === 'executable') {
      // 빌드된 실행파일 실행
      console.log(`Starting backend executable: ${config.executable}`);
      backendProcess = spawn(config.executable, config.args, {
        cwd: config.path,
        stdio: ["ignore", "pipe", "pipe"],
        shell: false,
      });
    } else {
      // 소스 코드 실행 (개발 환경 또는 fallback)
      console.log("Starting backend from source...");
      // 먼저 uv 시도
      backendProcess = spawn("uv", ["run", "python", "app/main.py"], {
        cwd: config.path,
        stdio: ["ignore", "pipe", "pipe"],
        shell: process.env.ComSpec || "cmd.exe",
      });
    }

    let serverReady = false;

    backendProcess.stdout.on("data", (data) => {
      const output = data.toString();
      console.log(`Backend: ${output}`);

      // 서버가 시작되었는지 확인
      if (
        output.includes("Uvicorn running on") ||
        output.includes("Application startup complete")
      ) {
        if (!serverReady) {
          serverReady = true;
          console.log("백엔드 서버가 시작되었습니다!");

          // 서버가 시작된 후 프론트엔드에 알림 (선택사항)
          if (mainWindow) {
            mainWindow.webContents.executeJavaScript(`
              console.log('백엔드 서버가 연결되었습니다.');
            `);
          }
        }
      }
    });

    backendProcess.stderr.on("data", (data) => {
      const error = data.toString();
      console.error(`Backend Error: ${error}`);

      // 실행파일 실행 실패 시 또는 uv 없음 시 python fallback
      if (config.type === 'executable' || error.includes("uv") && error.includes("not found")) {
        console.log("Trying Python fallback...");
        startPythonFallback();
      }
    });

    backendProcess.on("close", (code) => {
      console.log(`Backend process exited with code ${code}`);
    });

    backendProcess.on("error", (error) => {
      logError("Failed to start backend", error);
      if (backendStartAttempts < MAX_BACKEND_ATTEMPTS) {
        log("재시도합니다...");
        setTimeout(() => startPythonFallback(), 2000);
      } else {
        logError("백엔드 시작 최대 시도 횟수 초과");
        notifyFrontendOfBackendFailure();
      }
    });
  } catch (error) {
    logError("백엔드 서버 시작 실패", error);
    if (backendStartAttempts < MAX_BACKEND_ATTEMPTS) {
      log("재시도합니다...");
      setTimeout(() => startPythonFallback(), 2000);
    } else {
      logError("백엔드 시작 최대 시도 횟수 초과");
      notifyFrontendOfBackendFailure();
    }
  }
}

function startPythonFallback() {
  console.log("Python 직접 실행으로 백엔드 서버를 시작합니다...");

  const backendPath = path.join(__dirname, "backend");

  try {
    // 올바른 엔트리 포인트 사용
    backendProcess = spawn("python", ["app/main.py"], {
      cwd: backendPath,
      stdio: ["ignore", "pipe", "pipe"],
      shell: process.env.ComSpec || "cmd.exe",
    });

    let serverReady = false;

    backendProcess.stdout.on("data", (data) => {
      const output = data.toString();
      console.log(`Backend (Python): ${output}`);

      // 서버가 시작되었는지 확인
      if (
        output.includes("Uvicorn running on") ||
        output.includes("Application startup complete")
      ) {
        if (!serverReady) {
          serverReady = true;
          console.log("Python 백엔드 서버가 시작되었습니다!");

          if (mainWindow) {
            mainWindow.webContents.executeJavaScript(`
              console.log('Python 백엔드 서버가 연결되었습니다.');
            `);
          }
        }
      }
    });

    backendProcess.stderr.on("data", (data) => {
      console.error(`Backend Error (Python): ${data}`);
    });

    backendProcess.on("close", (code) => {
      console.log(`Backend Python process exited with code ${code}`);
    });

    backendProcess.on("error", (error) => {
      logError("Python 백엔드도 시작 실패", error);

      if (backendStartAttempts < MAX_BACKEND_ATTEMPTS) {
        log("백엔드 재시도...");
        setTimeout(() => startBackendServer(), 3000);
      } else {
        logError("모든 백엔드 시작 방법 실패");
        log("수동 실행 가이드: cd backend && python app/main.py");
        notifyFrontendOfBackendFailure();
      }
    });
  } catch (error) {
    logError("Python 백엔드 시작 중 예외 발생", error);

    if (backendStartAttempts < MAX_BACKEND_ATTEMPTS) {
      log("백엔드 재시도...");
      setTimeout(() => startBackendServer(), 3000);
    } else {
      logError("백엔드 시작 최종 실패");
      notifyFrontendOfBackendFailure();
    }
  }
}

// 프론트엔드에 백엔드 실패 알림
function notifyFrontendOfBackendFailure() {
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.executeJavaScript(`
      console.warn('[Electron] 백엔드 서버 시작 실패 - 더미 데이터 모드로 동작합니다.');
      if (window.checkServerConnection) {
        window.checkServerConnection();
      }
    `);
  }
}

// Electron 앱이 준비되면 윈도우 생성
app.whenReady().then(() => {
  startBackendServer();
  createWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// 모든 윈도우가 닫히면 앱 종료 (macOS 제외)
app.on("window-all-closed", () => {
  // 백엔드 프로세스 종료
  if (backendProcess) {
    backendProcess.kill();
  }

  if (process.platform !== "darwin") {
    app.quit();
  }
});

// 앱이 종료될 때 백엔드 프로세스도 종료
app.on("before-quit", () => {
  if (backendProcess) {
    backendProcess.kill();
  }
});
