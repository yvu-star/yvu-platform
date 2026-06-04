'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const pathname                  = usePathname();

  // Scroll detection → adds .scrolled class
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const links = [
    { href: '/',             label: 'Home'        },
    { href: '/about',        label: 'About Us'    },
    { href: '/events',       label: 'Events'      },
    { href: '/research',     label: 'Research'    },
    { href: '/team',         label: 'Team'        },
    { href: '/get-involved', label: 'Get Involved'},
  ];

  // Active link: exact match for home, startsWith for others
  const isActive = (href) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <nav className={`site-nav${scrolled ? ' scrolled' : ''}`}>

      {/* Logo */}
      <Link href="/" className="nav-logo">
        Youth<span>Verse</span> Union
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