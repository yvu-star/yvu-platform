'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const links = [
    { href: '/',             label: 'Home'         },
    { href: '/about',        label: 'About Us'     },
    { href: '/events',       label: 'Events'       },
    { href: '/research',     label: 'Research'     },
    { href: '/team',         label: 'Team'         },
    { href: '/get-involved', label: 'Get Involved' },
  ];

  const isActive = (href) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <nav className={`site-nav${scrolled ? ' scrolled' : ''}`}>

      <style dangerouslySetInnerHTML={{ __html: `
        .nav-logo {
          display: flex !important;
          align-items: center !important;
          gap: 10px !important;
          text-decoration: none !important;
        }
        .nav-logo-text {
          font-family: 'Poppins', sans-serif;
          font-size: 1.15rem;
          font-weight: 700;
          letter-spacing: 0.01em;
          color: #e8e0cc;
          white-space: nowrap;
          line-height: 1;
        }
        .nav-logo-accent {
          color: #c9a84c;
        }
        .nav-logo-union {
          color: #e8e0cc;
          font-weight: 500;
        }
      ` }} />

      {/* Logo */}
      <Link href="/" className="nav-logo">
        <Image
          src="https://i.postimg.cc/KcdyrQ2R/572948008-122103392937085905-5492288171627093196-n-removebg-preview.png"
          alt="YouthVerse Union Logo"
          width={38}
          height={38}
          style={{ objectFit: 'contain', display: 'block', flexShrink: 0 }}
        />
        <span className="nav-logo-text">
          Youth<span className="nav-logo-accent">Verse</span><span className="nav-logo-union"> Union</span>
        </span>
      </Link>

      {/* Desktop links */}
      <ul className={`nav-links${menuOpen ? ' open' : ''}`}>
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={isActive(link.href) ? 'active-link' : ''}
            >
              {link.label}
            </Link>
          </li>
        ))}
        <li>
          <Link href="/contact" className={`nav-cta${pathname === '/contact' ? ' active-link' : ''}`}>
            Contact
          </Link>
        </li>
      </ul>

      {/* Hamburger */}
      <button
        className={`hamburger${menuOpen ? ' open' : ''}`}
        onClick={() => setMenuOpen((prev) => !prev)}
        aria-label="Toggle menu"
        aria-expanded={menuOpen}
        style={{ background: 'transparent', border: 'none' }}
      >
        <span />
        <span />
        <span />
      </button>

    </nav>
  );
}