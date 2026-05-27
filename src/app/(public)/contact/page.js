// src/app/contact/page.js
import { createClient } from '@/lib/supabase/server';
import ContactClient from '@/components/ui/ContactClient';
import './contact.css';

export const metadata = {
  title: 'Contact Us | YouthVerse Union',
  description: 'Have a question, want to collaborate, or just want to say hello? Get in touch with us today.',
};

export default async function ContactPage() {
  const supabase = await createClient();

  // Fetch all site settings dynamically
  const { data: rawSettings } = await supabase.from('site_settings').select('key, value');
  const s = Object.fromEntries((rawSettings || []).map((r) => [r.key, r.value]));

  return <ContactClient settings={s} />;
}