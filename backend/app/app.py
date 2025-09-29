from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
import os
import sys
import logging
import traceback
from datetime import datetime
from typing import List, Dict, Any

# 로깅 설정
def setup_logging():
    """로깅 설정 - 파일과 콘솔 모두에 출력"""

    # 로그 디렉토리 생성
    log_dir = "logs"
    if getattr(sys, 'frozen', False):
        # PyInstaller 환경에서는 실행 파일 경로에 로그 저장
        log_dir = os.path.join(os.path.dirname(sys.executable), "logs")

    os.makedirs(log_dir, exist_ok=True)

    # 로그 파일 경로
    log_file = os.path.join(log_dir, f"chinook_api_{datetime.now().strftime('%Y%m%d')}.log")

    # 로깅 포매터 설정
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(funcName)s:%(lineno)d - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )

    # 루트 로거 설정
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)

    # 파일 핸들러
    file_handler = logging.FileHandler(log_file, encoding='utf-8')
    file_handler.setLevel(logging.INFO)
    file_handler.setFormatter(formatter)

    # 콘솔 핸들러
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(formatter)

    # 핸들러 추가
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)

    logging.info(f"Logging initialized. Log file: {log_file}")
    return log_file

# 로깅 초기화
LOG_FILE = setup_logging()

app = FastAPI(title="Chinook Database API", version="1.0.0")

# CORS 설정 - 프로덕션에서도 localhost 접근 허용
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost", "http://127.0.0.1"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 데이터베이스 경로 설정 (개발 vs 프로덕션)
def get_db_path():
    """환경에 따른 데이터베이스 경로 반환"""

    # PyInstaller로 패키징된 환경인지 확인
    if getattr(sys, 'frozen', False):
        # 패키징된 실행파일 환경
        application_path = sys._MEIPASS
        db_path = os.path.join(application_path, "db", "chinook.db")
        logging.info(f"Packaged environment - DB path: {db_path}")
        logging.info(f"Application path (_MEIPASS): {application_path}")
        logging.info(f"Executable path: {sys.executable}")

        # 대안 경로들도 확인
        alt_paths = [
            os.path.join(os.path.dirname(sys.executable), "db", "chinook.db"),
            os.path.join(os.path.dirname(sys.executable), "chinook.db"),
            os.path.join(application_path, "chinook.db")
        ]

        for alt_path in alt_paths:
            logging.info(f"Alternative path: {alt_path} (exists: {os.path.exists(alt_path)})")

    else:
        # 개발 환경
        project_root = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        db_path = os.path.join(project_root, "db", "chinook.db")
        logging.info(f"Development environment - DB path: {db_path}")
        logging.info(f"Project root: {project_root}")

    logging.info(f"Selected DB path: {db_path}")
    logging.info(f"DB file exists: {os.path.exists(db_path)}")

    # 디렉토리 내용 확인
    db_dir = os.path.dirname(db_path)
    if os.path.exists(db_dir):
        logging.info(f"DB directory contents: {os.listdir(db_dir)}")
    else:
        logging.warning(f"DB directory does not exist: {db_dir}")

    return db_path

DB_PATH = get_db_path()

class QueryRequest(BaseModel):
    tables: List[str]

class ChartRequest(BaseModel):
    tables: List[str]

def get_db_connection():
    """데이터베이스 연결"""
    try:
        logging.info(f"Attempting to connect to DB: {DB_PATH}")

        if not os.path.exists(DB_PATH):
            error_msg = f"Database file not found: {DB_PATH}"
            logging.error(error_msg)
            raise HTTPException(status_code=500, detail=error_msg)

        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row

        # 연결 테스트
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        cursor.fetchone()

        logging.info("Database connection successful")
        return conn

    except sqlite3.Error as e:
        error_msg = f"SQLite error: {str(e)}"
        logging.error(error_msg)
        logging.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=error_msg)
    except Exception as e:
        error_msg = f"Database connection failed: {str(e)}"
        logging.error(error_msg)
        logging.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=error_msg)

@app.get("/")
async def root():
    logging.info("GET / - Root endpoint accessed")
    return {
        "message": "Chinook Database API Server",
        "status": "running",
        "db_path": DB_PATH,
        "db_exists": os.path.exists(DB_PATH),
        "log_file": LOG_FILE
    }

@app.get("/api/")
async def api_root():
    logging.info("GET /api/ - API root accessed")
    return {"message": "Chinook API Root", "endpoints": ["/api/tables", "/api/query", "/api/chart", "/api/stats"]}

@app.get("/api/tables")
async def get_tables():
    print("[FastAPI] GET /api/tables")
    """데이터베이스의 모든 테이블 목록 반환"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [row[0] for row in cursor.fetchall()]

        conn.close()
        return {"tables": tables}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/query")
async def query_data(request: QueryRequest):
    print(f"[FastAPI] POST /api/query, tables={request.tables}")
    """선택된 테이블들의 데이터를 조회"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        all_data = []

        for table in request.tables:
            # 테이블별 데이터 조회
            query = f"SELECT * FROM {table} LIMIT 50"
            cursor.execute(query)

            rows = cursor.fetchall()
            for row in rows:
                row_dict = dict(row)
                row_dict['_table'] = table  # 어느 테이블에서 온 데이터인지 표시
                all_data.append(row_dict)

        conn.close()
        return all_data

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chart")
async def get_chart_data(request: ChartRequest):
    print(f"[FastAPI] POST /api/chart, tables={request.tables}")
    """차트용 데이터 생성"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        chart_data = {
            "labels": [],
            "data": []
        }

        for table in request.tables:
            # 각 테이블의 레코드 수 계산
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            count = cursor.fetchone()[0]

            chart_data["labels"].append(table)
            chart_data["data"].append(count)

        conn.close()
        return chart_data

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/table/{table_name}")
async def get_table_info(table_name: str):
    print(f"[FastAPI] GET /api/table/{table_name}")
    """특정 테이블의 정보와 데이터 조회"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # 테이블 스키마 정보
        cursor.execute(f"PRAGMA table_info({table_name})")
        schema = cursor.fetchall()

        # 테이블 데이터 (처음 100개)
        cursor.execute(f"SELECT * FROM {table_name} LIMIT 100")
        data = [dict(row) for row in cursor.fetchall()]

        # 레코드 수
        cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
        total_count = cursor.fetchone()[0]

        conn.close()

        return {
            "table_name": table_name,
            "schema": [dict(col) for col in schema],
            "data": data,
            "total_count": total_count
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/stats")
async def get_database_stats():
    print("[FastAPI] GET /api/stats")
    """데이터베이스 전체 통계"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # 모든 테이블 목록
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [row[0] for row in cursor.fetchall()]

        stats = {}
        total_records = 0

        for table in tables:
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            count = cursor.fetchone()[0]
            stats[table] = count
            total_records += count

        conn.close()

        return {
            "tables": stats,
            "total_tables": len(tables),
            "total_records": total_records
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    logging.info(f"Starting application...")
    logging.info(f"Database path: {DB_PATH}")
    logging.info(f"Database exists: {os.path.exists(DB_PATH)}")
    logging.info(f"Log file: {LOG_FILE}")

    # 환경 정보 로깅
    logging.info(f"Python version: {sys.version}")
    logging.info(f"Working directory: {os.getcwd()}")
    logging.info(f"Script path: {__file__}")
    logging.info(f"Frozen: {getattr(sys, 'frozen', False)}")

    if getattr(sys, 'frozen', False):
        logging.info(f"_MEIPASS: {sys._MEIPASS}")
        logging.info(f"Executable: {sys.executable}")

    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=False)