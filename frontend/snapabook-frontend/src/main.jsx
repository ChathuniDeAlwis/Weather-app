import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import ScanBook from './pages/ScanBook.jsx'
import QRScanner from './pages/QRScanner.jsx'
import RareBooks from './pages/RareBooks.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <ScanBook /> },
      { path: 'scan', element: <ScanBook /> },
      { path: 'qr', element: <QRScanner /> },
      { path: 'rare', element: <RareBooks /> },
    ],
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
