// components/Navbar.tsx
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { isAuthenticated, logoutClient } from '@/lib/auth';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [authed, setAuthed] = useState<boolean>(() => typeof window !== 'undefined' && isAuthenticated());
  const [open, setOpen] = useState(false);

  // update auth state (handles login/logout in other tabs)
  useEffect(() => {
    function onStorage() {
      setAuthed(typeof window !== 'undefined' && isAuthenticated());
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // hide mobile menu on navigation
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logoutClient();
    setAuthed(false);
    router.push('/login');
  };

  const linkClass = (path: string) =>
    `nav-link ${pathname === path ? 'active' : ''}`;

  return (
    <header className="nav">
      <div className="nav-left">
        <Link href="/" className="brand">CRM</Link>
      </div>

      <button
        className="hamburger"
        aria-label="Toggle menu"
        onClick={() => setOpen((s) => !s)}
      >
        <span className="hamburger-line" />
        <span className="hamburger-line" />
        <span className="hamburger-line" />
      </button>

      <nav className={`nav-links ${open ? 'open' : ''}`}>
        <Link href="/dashboard" className={linkClass('/dashboard')}>Dashboard</Link>
        <Link href="/contacts" className={linkClass('/contacts')}>Contacts</Link>
        <Link href="/tasks" className={linkClass('/tasks')}>Tasks</Link>

        <div className="nav-spacer" />

        {authed ? (
          <>
            <button className="btn-ghost" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link href="/login" className={linkClass('/login')}>Login</Link>
            <Link href="/register" className={linkClass('/register')}>Register</Link>
          </>
        )}
      </nav>
    </header>
  );
}
