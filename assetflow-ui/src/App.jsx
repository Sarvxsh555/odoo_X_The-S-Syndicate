import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import AppLayout from './components/layout/AppLayout'
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import AssetListPage from './pages/assets/AssetListPage'
import AssetDetailPage from './pages/assets/AssetDetailPage'
import AssetRegisterPage from './pages/assets/AssetRegisterPage'
import AllocationListPage from './pages/allocation/AllocationListPage'
import BookingListPage from './pages/booking/BookingListPage'
import MaintenancePage from './pages/maintenance/MaintenancePage'
import AuditPage from './pages/audit/AuditPage'
import DepartmentPage from './pages/departments/DepartmentPage'
import EmployeePage from './pages/employees/EmployeePage'
import NotificationsPage from './pages/notifications/NotificationsPage'
import ReportsPage from './pages/reports/ReportsPage'
import SearchPage from './pages/search/SearchPage'
import SettingsPage from './pages/settings/SettingsPage'

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />

      {/* Protected */}
      <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="assets" element={<AssetListPage />} />
        <Route path="assets/register" element={<AssetRegisterPage />} />
        <Route path="assets/:id" element={<AssetDetailPage />} />
        <Route path="allocations" element={<AllocationListPage />} />
        <Route path="bookings" element={<BookingListPage />} />
        <Route path="maintenance" element={<MaintenancePage />} />
        <Route path="audits" element={<AuditPage />} />
        <Route path="departments" element={<DepartmentPage />} />
        <Route path="employees" element={<EmployeePage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
