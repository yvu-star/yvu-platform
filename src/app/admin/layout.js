import { createClient } from '@/lib/supabase/server'
import AdminSidebar from '@/components/admin/AdminSidebar'
import './admin.css'

export const metadata = {
  title: 'YVU Admin',
}

export default async function AdminLayout({ children }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <>{children}</>
  }

  return (
    <div className="admin-wrapper">
      <AdminSidebar user={user} />
      <div className="admin-main">
        {children}
      </div>
    </div>
  )
}