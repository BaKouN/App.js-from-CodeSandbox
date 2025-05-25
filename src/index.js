import { createRoot } from 'react-dom/client'
import { Suspense } from 'react'
import './styles.css'
import { App } from './App'

function Overlay() {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', width: '100%', height: '100%' }}>
      <div style={{ position: 'absolute', bottom: 20 , right: 20, fontSize: '13px' }}>For Emma, my futue wife.</div>
    </div>
  )
}

createRoot(document.getElementById('root')).render(
  <>
    <Suspense fallback={null}>
      <App />
    </Suspense>
    <Overlay />
  </>
)
