// app/admin/(protected)/layout.js
// This layout only wraps protected admin pages — NOT the login page.
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminSessionGuard from '@/components/admin/AdminSessionGuard'
import './admin.css'

export const metadata = {
  title: 'YVU Admin',
}

export default function ProtectedAdminLayout({ children }) {
  return (
    <div className="admin-wrapper">
      <AdminSidebar />
      <div className="admin-main">
        <AdminSessionGuard />
        {children}
      </div>
    </div>
  )
}