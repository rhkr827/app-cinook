import { FC } from 'react'

interface TableOption {
  id: string;
  label: string;
}

interface ControlPanelProps {
  availableTables: TableOption[];
  selectedTables: string[];
  onTableSelection: (tableId: string, checked: boolean) => void;
  onExecute: () => void;
  loading: boolean;
  error: string | null;
}

const ControlPanel: FC<ControlPanelProps> = ({
  availableTables,
  selectedTables,
  onTableSelection,
  onExecute,
  loading,
  error
}) => {
  return (
    <div className="controls">
      <h3>데이터 조회 옵션</h3>
      
      {error && <div className="error">{error}</div>}
      
      <div className="checkbox-group">
        <strong>테이블 선택:</strong>
        {availableTables.map((table) => (
          <div key={table.id} className="checkbox-item">
            <input
              type="checkbox"
              id={table.id}
              checked={selectedTables.includes(table.id)}
              onChange={(e) => onTableSelection(table.id, e.target.checked)}
              disabled={loading}
            />
            <label htmlFor={table.id}>{table.label}</label>
          </div>
        ))}
      </div>

      <button
        className="execute-btn"
        onClick={onExecute}
        disabled={loading || selectedTables.length === 0}
      >
        {loading ? '조회 중...' : '데이터 조회'}
      </button>

      <div style={{ marginTop: '20px', fontSize: '12px', color: '#888' }}>
        <p><strong>선택된 테이블:</strong></p>
        <p>{selectedTables.length > 0 ? selectedTables.join(', ') : '없음'}</p>
      </div>
    </div>
  )
}

export default ControlPanel