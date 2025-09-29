import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE, API_CANDIDATES } from "./api";
import DataTable from "./components/DataTable";
import ChartComponent from "./components/ChartComponent";
import ControlPanel from "./components/ControlPanel";

interface TableData {
  [key: string]: any;
}

interface ChartData {
  labels: string[];
  data: number[];
}

function App() {
  const [tableData, setTableData] = useState<TableData[]>([]);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTables, setSelectedTables] = useState<string[]>([
    "albums",
    "artists",
  ]);
  const [serverOnline, setServerOnline] = useState(false);

  const availableTables = [
    { id: "albums", label: "앨범" },
    { id: "artists", label: "아티스트" },
    { id: "tracks", label: "트랙" },
    { id: "customers", label: "고객" },
    { id: "invoices", label: "주문" },
  ];

  const handleTableSelection = (tableId: string, checked: boolean) => {
    if (checked) {
      setSelectedTables([...selectedTables, tableId]);
    } else {
      setSelectedTables(selectedTables.filter((id) => id !== tableId));
    }
  };

  const executeQuery = async () => {
    if (selectedTables.length === 0) {
      setError("최소 하나의 테이블을 선택해주세요.");
      return;
    }

    setLoading(true);
    setError(null);

    // 먼저 서버 연결 상태 확인
    const isOnline = await checkServerConnection();

    if (!isOnline) {
      // 서버가 오프라인이면 더미 데이터 사용
      setError("백엔드 서버가 오프라인입니다. 더미 데이터를 표시합니다.");
      const dummyData = generateDummyData(selectedTables);
      setTableData(dummyData.tableData);
      setChartData(dummyData.chartData);
      setLoading(false);
      return;
    }

    try {
      const baseUrl = API_BASE;

      // 테이블 데이터 조회
      const tableResponse = await axios.post(
        `${baseUrl}/query`,
        {
          tables: selectedTables,
        },
        { timeout: 10000 }
      );
      setTableData(tableResponse.data);

      // 차트 데이터 조회
      const chartResponse = await axios.post(
        `${baseUrl}/chart`,
        {
          tables: selectedTables,
        },
        { timeout: 10000 }
      );
      setChartData(chartResponse.data);

      // 성공적으로 데이터를 받아온 경우 서버 온라인 상태로 설정
      setServerOnline(true);
      setError(null);
    } catch (err) {
      console.error("API 요청 실패:", err);

      // 프로덕션에서 localhost로 재시도
      // fallback 제거: 항상 API_BASE만 사용

      // 백엔드 서버 연결 확인
      setServerOnline(false);
      if (
        axios.isAxiosError(err) &&
        (err.code === "ECONNREFUSED" || err.code === "ECONNABORTED")
      ) {
        setError("백엔드 서버 연결 실패. 더미 데이터를 표시합니다.");
      } else {
        setError("데이터 조회 실패. 더미 데이터를 표시합니다.");
      }

      // 더미 데이터 제공
      const dummyData = generateDummyData(selectedTables);
      setTableData(dummyData.tableData);
      setChartData(dummyData.chartData);
    } finally {
      setLoading(false);
    }
  };

  const generateDummyData = (tables: string[]) => {
    const tableDataMap: { [key: string]: any[] } = {
      albums: [
        {
          AlbumId: 1,
          Title: "For Those About To Rock We Salute You",
          ArtistId: 1,
          _table: "albums",
        },
        {
          AlbumId: 2,
          Title: "Balls to the Wall",
          ArtistId: 2,
          _table: "albums",
        },
        {
          AlbumId: 3,
          Title: "Restless and Wild",
          ArtistId: 2,
          _table: "albums",
        },
      ],
      artists: [
        { ArtistId: 1, Name: "AC/DC", _table: "artists" },
        { ArtistId: 2, Name: "Accept", _table: "artists" },
        { ArtistId: 3, Name: "Aerosmith", _table: "artists" },
      ],
      tracks: [
        {
          TrackId: 1,
          Name: "For Those About To Rock (We Salute You)",
          AlbumId: 1,
          MediaTypeId: 1,
          GenreId: 1,
          _table: "tracks",
        },
        {
          TrackId: 2,
          Name: "Balls to the Wall",
          AlbumId: 2,
          MediaTypeId: 2,
          GenreId: 1,
          _table: "tracks",
        },
        {
          TrackId: 3,
          Name: "Fast As a Shark",
          AlbumId: 3,
          MediaTypeId: 2,
          GenreId: 1,
          _table: "tracks",
        },
      ],
      customers: [
        {
          CustomerId: 1,
          FirstName: "홍",
          LastName: "길동",
          Company: null,
          Email: "hong@example.com",
          _table: "customers",
        },
        {
          CustomerId: 2,
          FirstName: "김",
          LastName: "철수",
          Company: "Samsung",
          Email: "kim@example.com",
          _table: "customers",
        },
        {
          CustomerId: 3,
          FirstName: "이",
          LastName: "영희",
          Company: "LG",
          Email: "lee@example.com",
          _table: "customers",
        },
      ],
      invoices: [
        {
          InvoiceId: 1,
          CustomerId: 1,
          InvoiceDate: "2023-01-01",
          Total: 13.86,
          _table: "invoices",
        },
        {
          InvoiceId: 2,
          CustomerId: 2,
          InvoiceDate: "2023-01-02",
          Total: 8.91,
          _table: "invoices",
        },
        {
          InvoiceId: 3,
          CustomerId: 3,
          InvoiceDate: "2023-01-03",
          Total: 1.98,
          _table: "invoices",
        },
      ],
    };

    const tableData: any[] = [];
    const chartLabels: string[] = [];
    const chartDataValues: number[] = [];

    tables.forEach((table) => {
      if (tableDataMap[table]) {
        tableData.push(...tableDataMap[table]);
        chartLabels.push(table);
        chartDataValues.push(tableDataMap[table].length);
      }
    });

    return {
      tableData,
      chartData: {
        labels: chartLabels,
        data: chartDataValues,
      },
    };
  };

  const checkServerConnection = async () => {
    // 여러 API 후보를 순차적으로 시도
    for (const apiUrl of API_CANDIDATES) {
      try {
        console.log(`[Frontend] Trying API: ${apiUrl}`);
        const response = await axios.get(`${apiUrl}/`, { timeout: 3000 });
        if (response.status === 200) {
          console.log(`[Frontend] API 연결 성공: ${apiUrl}`);
          setServerOnline(true);
          return true;
        }
      } catch (error) {
        console.log(`[Frontend] API 연결 실패: ${apiUrl}`, error);
        // 다음 후보로 계속 시도
      }
    }

    // 모든 후보 실패
    console.warn('[Frontend] 모든 API 후보 연결 실패');
    setServerOnline(false);
    return false;
  };

  useEffect(() => {
    // 서버 연결 확인 후 초기 데이터 로드
    const initializeApp = async () => {
      const isOnline = await checkServerConnection();
      if (isOnline) {
        executeQuery();
      } else {
        // 서버가 오프라인이면 더미 데이터로 시작
        const dummyData = generateDummyData(selectedTables);
        setTableData(dummyData.tableData);
        setChartData(dummyData.chartData);
      }
    };

    initializeApp();

    // 30초마다 서버 상태 확인
    const interval = setInterval(checkServerConnection, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container">
      <div className="header">
        <h1>Chinook Database Explorer</h1>
      </div>

      <div className="main-content">
        <ControlPanel
          availableTables={availableTables}
          selectedTables={selectedTables}
          onTableSelection={handleTableSelection}
          onExecute={executeQuery}
          loading={loading}
          error={error}
        />

        <div className="data-section">
          {loading && <div className="loading">데이터를 불러오는 중...</div>}
          {!loading && tableData.length > 0 && <DataTable data={tableData} />}
          {!loading && tableData.length === 0 && !error && (
            <div className="loading">데이터를 조회해주세요.</div>
          )}
        </div>

        <div className="chart-section">
          {loading && <div className="loading">차트를 생성하는 중...</div>}
          {!loading &&
            chartData &&
            chartData.data &&
            chartData.data.length > 0 && <ChartComponent data={chartData} />}
          {!loading &&
            (!chartData || !chartData.data || chartData.data.length === 0) &&
            !error && <div className="loading">차트 데이터가 없습니다.</div>}
        </div>
      </div>

      <div className="status-bar">
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: serverOnline ? "#4caf50" : "#f44336",
              }}
            />
            <span>연결 상태: {serverOnline ? "온라인" : "오프라인"}</span>
            {!serverOnline && (
              <button
                onClick={() => {
                  setError(null);
                  executeQuery();
                }}
                style={{
                  background: "#646cff",
                  color: "white",
                  border: "none",
                  fontSize: "10px",
                  padding: "4px 8px",
                  borderRadius: "3px",
                  cursor: "pointer",
                  marginLeft: "5px",
                }}
              >
                재연결
              </button>
            )}
          </div>
          <span>총 {tableData.length}개 레코드</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span>선택된 테이블: {selectedTables.join(", ") || "없음"}</span>
        </div>
      </div>
    </div>
  );
}

export default App;
