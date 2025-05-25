import { createRoot } from 'react-dom/client'
import './styles.css'
import { App } from './App'
import Preloader from './Loading'
import { slides } from './gallery'

function Overlay() {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', width: '100%', height: '100%' }}>
      <div style={{ position: 'absolute', top: 20 , left: 20, fontSize: '13px' }}>For Emma, my futue wife.</div>
    </div>
  )
}

const mustHave = slides.map(s => s.url);

createRoot(document.getElementById('root')).render(
  <>
    <Preloader sources={mustHave}>
      <App />
    </Preloader>
    <Overlay />
  </>
)
