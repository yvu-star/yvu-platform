// src/app/(public)/layout.js
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import { createClient } from '@/lib/supabase/server';
import { getAllSettings } from '@/lib/services/settings.service';

export default async function PublicLayout({ children }) {
  const supabase = await createClient();
  const settings = await getAllSettings(supabase);

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '74px' }}>
        {children}
      </main>
      <Footer settings={settings} />
    </>
  );
}