import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import ScanCover from './pages/ScanCover'
import QRScanner from './pages/QRScanner'
import RareBooks from './pages/RareBooks'
import './App.css'

function Home() {
	return (
		<div style={{ paddingBottom: 72 }}>
			<h2>Snap-a-Book</h2>
			<p>Welcome! Choose an action below.</p>
			<div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
				<Link to='/scan'><button>Scan Book Cover</button></Link>
				<Link to='/qr'><button>Scan QR</button></Link>
				<Link to='/rare'><button>Rare Books</button></Link>
			</div>
		</div>
	)
}

function App() {
	return (
		<BrowserRouter>
			<div style={{ padding: 12 }}>
				<Routes>
					<Route path='/' element={<Home />} />
					<Route path='/scan' element={<ScanCover />} />
					<Route path='/qr' element={<QRScanner />} />
					<Route path='/rare' element={<RareBooks />} />
				</Routes>
			</div>
			<BottomNav />
		</BrowserRouter>
	)
}

export default App
