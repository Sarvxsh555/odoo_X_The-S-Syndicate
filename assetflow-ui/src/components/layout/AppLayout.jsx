import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function AppLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div className="page-content" style={{ flex: 1 }}>
        <Topbar />
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
