import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import AppLayout from './components/layout/AppLayout'

const LoginPage = lazy(() => import('./pages/auth/LoginPage'))
const SignupPage = lazy(() => import('./pages/auth/SignupPage'))
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'))
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'))
const AssetListPage = lazy(() => import('./pages/assets/AssetListPage'))
const AssetDetailPage = lazy(() => import('./pages/assets/AssetDetailPage'))
const AssetRegisterPage = lazy(() => import('./pages/assets/AssetRegisterPage'))
const AllocationListPage = lazy(() => import('./pages/allocation/AllocationListPage'))
const BookingListPage = lazy(() => import('./pages/booking/BookingListPage'))
const MaintenancePage = lazy(() => import('./pages/maintenance/MaintenancePage'))
const AuditPage = lazy(() => import('./pages/audit/AuditPage'))
const ActivityLogPage = lazy(() => import('./pages/activity-log/ActivityLogPage'))
const DepartmentPage = lazy(() => import('./pages/departments/DepartmentPage'))
const EmployeePage = lazy(() => import('./pages/employees/EmployeePage'))
const NotificationsPage = lazy(() => import('./pages/notifications/NotificationsPage'))
const ReportsPage = lazy(() => import('./pages/reports/ReportsPage'))
const SearchPage = lazy(() => import('./pages/search/SearchPage'))
const SettingsPage = lazy(() => import('./pages/settings/SettingsPage'))

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />
}

function RouteFallback() {
  return (
    <div className="page-body" style={{ paddingTop: 32 }}>
      <div className="skeleton" style={{ height: 64, marginBottom: 16 }} />
      <div className="skeleton" style={{ height: 320 }} />
    </div>
  )
}

function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />

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
          <Route path="activity-log" element={<ActivityLogPage />} />
          <Route path="departments" element={<DepartmentPage />} />
          <Route path="employees" element={<EmployeePage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
