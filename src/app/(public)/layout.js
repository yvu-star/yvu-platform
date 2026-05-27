import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';

export default function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '74px' }}>
        {children}
      </main>
      <Footer />
    </>
  );
}