import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

// Optional tiny status screen (in case /callback ever hits the front-end)
function Callback() {
  return (
    <div style={{minHeight:'100vh',display:'grid',placeItems:'center',color:'#e7ecff',fontFamily:'system-ui'}}>
      <div style={{textAlign:'center'}}>
        <div style={{
          width:26,height:26,borderRadius:'50%',
          border:'3px solid rgba(255,255,255,.25)', borderTopColor:'rgba(255,255,255,.95)',
          margin:'0 auto 10px', animation:'spin .8s linear infinite'
        }}/>
        <p>Completing sign-in…</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Landing page */}
        <Route path="/" element={<App />} />
        {/* If your proxy ever doesn't catch /callback, show a spinner */}
        <Route path="/callback" element={<Callback />} />
        {/* Game route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
