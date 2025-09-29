import { FC, useState, useEffect } from 'react'
import axios from 'axios'

interface ServerStatusProps {
  onStatusChange: (isOnline: boolean) => void;
}

const ServerStatus: FC<ServerStatusProps> = ({ onStatusChange }) => {
  const [isOnline, setIsOnline] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [lastCheck, setLastCheck] = useState<Date | null>(null)

  const checkServerStatus = async () => {
    setIsChecking(true)
    try {
      const response = await axios.get('/api/', { timeout: 3000 })
      if (response.status === 200) {
        setIsOnline(true)
        onStatusChange(true)
      }
    } catch (error) {
      setIsOnline(false)
      onStatusChange(false)
    } finally {
      setIsChecking(false)
      setLastCheck(new Date())
    }
  }

  useEffect(() => {
    checkServerStatus()
    
    // 30초마다 서버 상태 확인
    const interval = setInterval(checkServerStatus, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = () => {
    if (isChecking) return '#ffa500'
    return isOnline ? '#4caf50' : '#f44336'
  }

  const getStatusText = () => {
    if (isChecking) return '연결 확인 중...'
    return isOnline ? '온라인' : '오프라인'
  }

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '8px',
      fontSize: '12px'
    }}>
      <div 
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: getStatusColor(),
          animation: isChecking ? 'pulse 1s infinite' : 'none'
        }}
      />
      <span>백엔드: {getStatusText()}</span>
      {!isOnline && !isChecking && (
        <button
          onClick={checkServerStatus}
          style={{
            background: 'none',
            border: '1px solid #666',
            color: '#fff',
            fontSize: '10px',
            padding: '2px 6px',
            borderRadius: '3px',
            cursor: 'pointer',
            marginLeft: '5px'
          }}
        >
          재연결
        </button>
      )}
      {lastCheck && (
        <span style={{ color: '#888', fontSize: '10px' }}>
          ({lastCheck.toLocaleTimeString()})
        </span>
      )}
      
      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}

export default ServerStatus