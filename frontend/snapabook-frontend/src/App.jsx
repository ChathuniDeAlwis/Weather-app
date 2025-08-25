import { Outlet, NavLink } from 'react-router-dom'
import './App.css'

function App() {
  return (
    <div className="app-container">
      <div className="content">
        <Outlet />
      </div>
      <nav className="bottom-nav">
        <NavLink to="/scan" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          Scan Book
        </NavLink>
        <NavLink to="/qr" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          Scan QR
        </NavLink>
        <NavLink to="/rare" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          Rare Books
        </NavLink>
      </nav>
    </div>
  )
}

export default App
