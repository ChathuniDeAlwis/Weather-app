import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Scan from './pages/Scan'
import QRScanner from './pages/QRScanner'
import RareBooks from './pages/RareBooks'
import BottomNav from './components/BottomNav'
import './components/bottom-nav.css'

function App() {
  return (
    <BrowserRouter>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/scan" element={<Scan />} />
          <Route path="/qr" element={<QRScanner />} />
          <Route path="/rare" element={<RareBooks />} />
        </Routes>
      </div>
      <BottomNav />
    </BrowserRouter>
  )
}

export default App
