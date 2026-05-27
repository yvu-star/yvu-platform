// src/app/(public)/layout.js
import { createClient } from '@/lib/supabase/server';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';

export default async function PublicLayout({ children }) {
  const supabase = await createClient();
  const { data: rawSettings } = await supabase.from('site_settings').select('key, value');

  const s = Object.fromEntries((rawSettings || []).map(r => [r.key, r.value]));

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '74px' }}>
        {children}
      </main>
      <Footer settings={s} />
    </>
  );
}