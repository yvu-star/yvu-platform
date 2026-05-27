import { createClient } from '@/lib/supabase/server';
import ResearchClient from '@/components/ui/ResearchClient';
import './research.css';

export const metadata = {
  title: 'Research',
  description: 'YouthVerse Union research and publications',
};

export default async function ResearchPage() {
  const supabase = await createClient();

  const [{ data: rawSettings }, { data: papers }] = await Promise.all([
    supabase.from('site_settings').select('key, value'),
    supabase
      .from('research')
      .select(
        'id, title, slug, abstract, authors, tags, category, published_at, is_published, pdf_url, external_url, status'
      )
      .eq('is_published', true)
      .order('published_at', { ascending: false }),
  ]);

  const s = Object.fromEntries(
    (rawSettings || []).map((r) => [r.key, r.value])
  );
  const researchPapers = papers || [];

  return <ResearchClient settings={s} research={researchPapers} />;
}