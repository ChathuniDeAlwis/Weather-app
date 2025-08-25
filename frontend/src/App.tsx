import { Routes, Route, NavLink } from 'react-router-dom'
import Home from './pages/Home'
import ScanQR from './pages/ScanQR'
import RareBooks from './pages/RareBooks'

export default function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/scan-qr" element={<ScanQR />} />
        <Route path="/rare" element={<RareBooks />} />
      </Routes>
      <nav className="bottom-nav">
        <NavLink to="/">Scan Cover</NavLink>
        <NavLink to="/scan-qr">Scan QR</NavLink>
        <NavLink to="/rare">Rare Books</NavLink>
      </nav>
    </div>
  )
}
