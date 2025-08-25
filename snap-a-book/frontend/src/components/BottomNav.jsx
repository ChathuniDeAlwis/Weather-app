import { Link, useLocation } from 'react-router-dom'

export default function BottomNav() {
	const location = useLocation()
	const items = [
		{ to: '/', label: 'Home' },
		{ to: '/scan', label: 'Scan' },
		{ to: '/qr', label: 'QR' },
		{ to: '/rare', label: 'Rare' },
	]
	return (
		<nav style={styles.nav}>
			{items.map((item) => (
				<Link key={item.to} to={item.to} style={{ ...styles.link, ...(location.pathname === item.to ? styles.active : {}) }}>
					{item.label}
				</Link>
			))}
		</nav>
	)
}

const styles = {
	nav: {
		position: 'fixed',
		bottom: 0,
		left: 0,
		right: 0,
		display: 'flex',
		justifyContent: 'space-around',
		padding: '12px 8px',
		background: '#fff',
		borderTop: '1px solid #eee',
		zIndex: 100,
	},
	link: { color: '#333', textDecoration: 'none', fontSize: 16 },
	active: { color: '#1976d2', fontWeight: 700 },
}