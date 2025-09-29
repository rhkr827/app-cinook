import { FC } from 'react'

interface DataTableProps {
  data: Array<{ [key: string]: any }>;
}

const DataTable: FC<DataTableProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="loading">데이터가 없습니다.</div>
  }

  const columns = Object.keys(data[0])

  return (
    <div className="table-container">
      <h3>데이터 테이블 ({data.length}개 항목)</h3>
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index}>
                {columns.map((column) => (
                  <td key={column}>
                    {row[column] !== null && row[column] !== undefined 
                      ? String(row[column]) 
                      : '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default DataTable