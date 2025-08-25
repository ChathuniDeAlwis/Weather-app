import { NavLink } from 'react-router-dom';
import './bottom-nav.css';

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      <NavLink to="/" className="nav-item">Home</NavLink>
      <NavLink to="/scan" className="nav-item">Scan</NavLink>
      <NavLink to="/qr" className="nav-item">Scan QR</NavLink>
      <NavLink to="/rare" className="nav-item">Rare</NavLink>
    </nav>
  );
}

