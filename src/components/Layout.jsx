import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { LogIn, LogOut, Inbox, User, Menu, X } from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import GuidedTour from '@/components/GuidedTour';

export default function Layout() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Detect scroll for nav pill elevation
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => setMobileOpen(false), [location.pathname]);

  const navLinks = [
    { to: '/', label: 'New Checklist' },
    { to: '/inquiries', label: 'My Inquiries', icon: Inbox },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col relative" style={{ backgroundColor: 'var(--canvas)' }}>
      {/* Subtle global mountain silhouette background watermark */}
      <div
        className="fixed right-0 bottom-0 top-0 w-full md:w-1/2 pointer-events-none opacity-[0.06] -z-10 select-none overflow-hidden"
        style={{
          backgroundImage: "url('/hero-bg.png')",
          backgroundPosition: 'right bottom',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          maskImage: 'linear-gradient(to left, black 25%, transparent 95%)',
          WebkitMaskImage: 'linear-gradient(to left, black 25%, transparent 95%)',
        }}
        aria-hidden="true"
      />

      {/* ── Floating Nav Pill ────────────────────────────────────── */}
      <div className="sticky top-3 z-50 flex justify-center px-4 pointer-events-none">
        <header
          className={`nav-pill pointer-events-auto w-full max-w-5xl animate-fade-in ${
            scrolled ? 'nav-pill-scrolled' : ''
          } ${mobileOpen ? 'nav-pill-open' : ''}`}
        >
          <div className="flex items-center justify-between px-5 h-14 relative z-10">

            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-1 group transition-smooth"
              aria-label="DukanDoc home"
            >
              <img
                src="/brandlogo.svg"
                alt="DukanDoc"
                style={{ height: '23px', width: 'auto' }}
                className="object-contain flex-shrink-0 group-hover:scale-105 transition-transform"
              />
              {/* Wordmark + domain */}
              <div className="flex items-baseline gap-0.5">
                <span
                  className="font-inter font-bold text-[17.5px] sm:text-[18px] tracking-tight"
                  style={{ color: 'var(--ink)' }}
                >
                  DukanDoc
                </span>
                <span
                  className="font-inter font-medium text-[16px] tracking-tight"
                  style={{ color: 'var(--slate)' }}
                >
                  .in
                </span>
              </div>
            </Link>

            {/* Desktop nav links - perfectly center-aligned */}
            <nav className="hidden md:flex items-center gap-1.5 absolute left-1/2 -translate-x-1/2">
              {navLinks.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={`nav-glass-link flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm ${
                    isActive(to) ? 'active' : ''
                  }`}
                >
                  {Icon && <Icon className="h-3.5 w-3.5" />}
                  {label}
                </Link>
              ))}
            </nav>

            {/* Auth, Language Switcher + mobile toggle */}
            <div className="flex items-center gap-2">
              <LanguageSwitcher />

              {isAuthenticated ? (
                <>
                  <span
                    className="text-xs hidden sm:flex items-center gap-1.5 mr-1"
                    style={{ color: 'var(--slate)' }}
                  >
                    <User className="h-3 w-3" />
                    {user?.email}
                  </span>
                  <button
                    onClick={() => logout(false)}
                    className="nav-glass-btn text-sm"
                    style={{ borderRadius: '20px', padding: '6px 16px', fontSize: '13px' }}
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Log out
                  </button>
                </>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link
                    to="/login"
                    className="nav-glass-btn flex items-center gap-1.5"
                    style={{ borderRadius: '20px', padding: '6px 16px', fontSize: '13px' }}
                  >
                    <User className="h-3.5 w-3.5" />
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    className="btn-ink"
                    style={{ borderRadius: '20px', padding: '6px 16px', fontSize: '13px' }}
                  >
                    Sign up
                  </Link>
                </div>
              )}

              {/* Mobile hamburger */}
              <button
                className="md:hidden flex items-center justify-center h-9 w-9 rounded-full transition-smooth"
                style={{
                  backgroundColor: mobileOpen ? 'rgba(0, 64, 67, 0.08)' : 'transparent',
                }}
                onClick={() => setMobileOpen((o) => !o)}
                aria-label="Toggle menu"
              >
                {mobileOpen
                  ? <X className="h-4 w-4" style={{ color: 'var(--ink)' }} />
                  : <Menu className="h-4 w-4" style={{ color: 'var(--ink)' }} />
                }
              </button>
            </div>
          </div>

          {/* Mobile menu dropdown */}
          {mobileOpen && (
            <div
              className="md:hidden relative z-10 border-t px-4 pb-4 pt-3 space-y-1 animate-fade-up"
              style={{ borderColor: 'rgba(255, 255, 255, 0.60)' }}
            >
              {navLinks.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-smooth ${
                    isActive(to)
                      ? 'text-[var(--ink)] bg-white/70 shadow-sm font-semibold'
                      : 'text-[var(--slate)] hover:bg-white/40 hover:text-[var(--ink)]'
                  }`}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {label}
                </Link>
              ))}
              <div className="pt-2 border-t flex items-center gap-2" style={{ borderColor: 'rgba(255, 255, 255, 0.40)' }}>
                {isAuthenticated ? (
                  <button
                    onClick={() => logout(false)}
                    className="nav-glass-btn w-full justify-center text-sm"
                    style={{ borderRadius: '12px', padding: '8px 16px', fontSize: '13px' }}
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Log out
                  </button>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="nav-glass-btn flex-1 justify-center text-sm"
                      style={{ borderRadius: '12px', padding: '8px 16px', fontSize: '13px' }}
                    >
                      Log in
                    </Link>
                    <Link
                      to="/register"
                      className="btn-ink flex-1 justify-center text-sm"
                      style={{ borderRadius: '12px', padding: '8px 16px', fontSize: '13px' }}
                    >
                      Sign up
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </header>
      </div>

      {/* ── Main Content ─────────────────────────────────────────── */}
      <main className="flex-1 mt-2">
        <Outlet />
      </main>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer style={{ backgroundColor: 'var(--ink)', color: 'var(--canvas)' }} className="mt-20">
        <div className="max-w-5xl mx-auto px-6 py-16">
          {/* Big conversational headline */}
          <h2
            className="font-heading text-2xl md:text-3xl font-semibold mb-10"
            style={{ color: 'var(--canvas)', letterSpacing: '-0.02em' }}
          >
            Helping every entrepreneur<br />start legally, without the guesswork.
          </h2>

          {/* Link grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div>
              <p className="eyebrow mb-3" style={{ color: 'rgba(243,240,238,0.45)' }}>Product</p>
              <ul className="space-y-2">
                {[['/', 'New Checklist'], ['/inquiries', 'My Inquiries']].map(([href, label]) => (
                  <li key={href}>
                    <Link
                      to={href}
                      className="text-sm transition-smooth"
                      style={{ color: 'rgba(243,240,238,0.70)', fontWeight: 400 }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--canvas)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(243,240,238,0.70)')}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="eyebrow mb-3" style={{ color: 'rgba(243,240,238,0.45)' }}>Legal</p>
              <ul className="space-y-2">
                {['Privacy Policy', 'Terms of Service', 'Disclaimer'].map((l) => (
                  <li key={l}>
                    <span
                      className="text-sm cursor-default"
                      style={{ color: 'rgba(243,240,238,0.45)', fontWeight: 400 }}
                    >
                      {l}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-span-2">
              <p className="eyebrow mb-3" style={{ color: 'rgba(243,240,238,0.45)' }}>About</p>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(243,240,238,0.55)', fontWeight: 400 }}>
                DukanDoc synthesises public government data from FSSAI, GST, Udyam, municipal wards and
                state departments. We&apos;re independent and not affiliated with any government body.
              </p>
            </div>
          </div>

          {/* Divider + bottom row */}
          <div
            className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
            style={{ borderColor: 'rgba(243,240,238,0.12)', color: 'rgba(243,240,238,0.40)' }}
          >
            <p>© {new Date().getFullYear()} DukanDoc. Free &amp; independent.</p>
            <p className="inline-flex items-center gap-1.5">
              <span>Made in India</span>
              <img src="/ind.svg" alt="India" className="w-3.5 h-2.5 object-cover rounded-[1px] inline-block" />
            </p>
          </div>
        </div>
      </footer>

      {/* ── Guided Recommendation Usage Tour ──────────────────────── */}
      <GuidedTour />
    </div>
  );
}
