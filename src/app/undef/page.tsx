'use client'

import HomeBtn from "../HomeBtn"

const UndefUser = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      padding: '20px',
      textAlign: 'center'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '40px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        maxWidth: '600px',
        width: '100%',
        border: '1px solid rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{
          marginBottom: '32px',
          color: '#2d3436'
        }}>
          <svg 
            width="64" 
            height="64" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            style={{ marginBottom: '20px' }}
          >
            <path 
              d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" 
              stroke="#ff4757" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            <path 
              d="M12 8V12" 
              stroke="#ff4757" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            <path 
              d="M12 16H12.01" 
              stroke="#ff4757" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
          
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 600,
            marginBottom: '12px',
            color: '#2d3436'
          }}>
            Пользователь не найден
          </h1>
          
          <p style={{
            fontSize: '1rem',
            color: '#636e72',
            lineHeight: 1.5,
            margin: 0
          }}>
            Проверьте правильность написания логина или вернитесь на главную страницу
          </p>
        </div>
        
        <div style={{ marginTop: '32px' }}>
          <HomeBtn />
        </div>
      </div>
    </div>
  )
}

export default UndefUser