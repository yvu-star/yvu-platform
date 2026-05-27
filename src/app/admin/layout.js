import AdminSidebar from '@/components/admin/AdminSidebar'
import './admin.css'

export const metadata = {
  title: 'YVU Admin',
}

export default function AdminLayout({ children }) {
  return (
    <div className="admin-wrapper">
      <AdminSidebar />
      <div className="admin-main">
        {children}
      </div>
    </div>
  )
}