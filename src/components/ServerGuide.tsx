import { FC } from 'react'

interface ServerGuideProps {
  show: boolean;
  onClose: () => void;
}

const ServerGuide: FC<ServerGuideProps> = ({ show, onClose }) => {
  if (!show) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: '#333',
        padding: '30px',
        borderRadius: '10px',
        maxWidth: '600px',
        width: '90%',
        color: '#fff'
      }}>
        <h2 style={{ marginTop: 0, color: '#646cff' }}>백엔드 서버 실행 안내</h2>
        
        <p>Chinook Database Explorer를 사용하려면 백엔드 서버를 실행해야 합니다.</p>
        
        <div style={{ 
          background: '#2a2a2a', 
          padding: '15px', 
          borderRadius: '5px', 
          marginBottom: '20px',
          fontFamily: 'monospace'
        }}>
          <h4 style={{ margin: '0 0 10px 0' }}>실행 방법:</h4>
          <ol style={{ margin: 0, paddingLeft: '20px' }}>
            <li>새 터미널/명령 프롬프트를 여세요</li>
            <li>앱이 설치된 폴더로 이동: <code>cd backend</code></li>
            <li>백엔드 서버 실행: <code>uv run python app.py</code></li>
          </ol>
        </div>

        <div style={{ 
          background: '#1a4a1a', 
          padding: '10px', 
          borderRadius: '5px', 
          marginBottom: '20px',
          border: '1px solid #4caf50'
        }}>
          <strong>💡 참고:</strong> 서버가 실행되면 자동으로 데이터베이스에 연결됩니다.
          서버 없이도 앱은 작동하지만 더미 데이터만 표시됩니다.
        </div>

        <div style={{ textAlign: 'center' }}>
          <button
            onClick={onClose}
            style={{
              background: '#646cff',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  )
}

export default ServerGuide