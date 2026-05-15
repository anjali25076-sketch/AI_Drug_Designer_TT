'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from './layout.module.css';

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target || typeof target.closest !== 'function') return;
      
      // cardHoverGreen tracking
      const card = target.closest('.cardHoverGreen') as HTMLElement;
      if (card) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      }
      
      // 3D tilt tracking for buttons and interactive elements
      const tiltEl = target.closest('[data-tilt], button, .btn-primary, .btn-outline, .cardHoverGreen, a[class*="jobCard"], a[class*="navItem"]') as HTMLElement;
      if (tiltEl && !tiltEl.dataset.tiltDisabled) {
        const rect = tiltEl.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        const tiltX = (y - 0.5) * -14; // degrees
        const tiltY = (x - 0.5) * 14;
        const glowX = x * 100;
        const glowY = y * 100;
        
        tiltEl.style.transform = `perspective(600px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.04, 1.04, 1.04)`;
        tiltEl.style.boxShadow = `${(x - 0.5) * -10}px ${(y - 0.5) * -10}px 30px rgba(16, 185, 129, 0.15)`;
        tiltEl.style.setProperty('--glow-x', `${glowX}%`);
        tiltEl.style.setProperty('--glow-y', `${glowY}%`);
      }
    };

    const handleMouseLeave = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target || typeof target.closest !== 'function') return;
      
      const tiltEl = target.closest('[data-tilt], button, .btn-primary, .btn-outline, .cardHoverGreen, a[class*="jobCard"], a[class*="navItem"]') as HTMLElement;
      if (tiltEl) {
        tiltEl.style.transform = '';
        tiltEl.style.boxShadow = '';
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave, true);
    
    // Attach mouseleave to individual elements
    const attachLeave = () => {
      document.querySelectorAll('button, .btn-primary, .btn-outline, .cardHoverGreen, [data-tilt], a[class*="jobCard"], a[class*="navItem"]').forEach(el => {
        (el as HTMLElement).addEventListener('mouseleave', (e) => {
          (el as HTMLElement).style.transform = '';
          (el as HTMLElement).style.boxShadow = '';
        });
      });
    };
    
    // Run initially and on DOM changes
    attachLeave();
    const observer = new MutationObserver(attachLeave);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave, true);
      observer.disconnect();
    };
  }, []);

  const links = [
    { name: 'Dashboard', href: '/platform', icon: '' },
    { name: 'Drug Designer', href: '/platform/design', icon: '' },
    { name: 'Drug Explorer', href: '/platform/explorer', icon: '' },
    { name: 'Target Database', href: '/platform/targets', icon: '' },
    { name: 'Molecule Analyzer', href: '/platform/analyzer', icon: '' },
    { name: 'Analytics', href: '/platform/analytics', icon: '' },
    { name: 'Run History', href: '/platform/history', icon: '', badge: '9' },
    { name: 'Hospital Network', href: '/platform/hospital', icon: '', badge: 'Live', badgeClass: styles.badgeLive }
  ];

  return (
    <div className={styles.container}>
      {/* Top Navbar */}
      <header className={`${styles.topbar} glass`}>
        <div className={styles.topbarLeft}>
          <button 
            className={`${styles.hamburger} ${sidebarOpen ? styles.open : ''}`} 
            onClick={toggleSidebar}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          <Link href="/" className={styles.logo}>
            <div className={styles.dot} />
            AI Drug Designer
          </Link>
        </div>

        <nav className={styles.topNav}>
          <Link href="/platform" className={pathname === '/platform' ? styles.activeTopNav : ''}>Dashboard</Link>
          <Link href="/platform/design" className={pathname === '/platform/design' ? styles.activeTopNav : ''}>Design Drug</Link>
          <Link href="/" className={styles.btnNav}>Landing Page</Link>
        </nav>
      </header>

      <div className={styles.layout}>
        {/* Sidebar overlay for mobile/tablet */}
        {sidebarOpen && <div className={styles.sidebarOverlay} onClick={() => setSidebarOpen(false)} />}
        
        {/* Sidebar */}
        <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarVisible : ''}`}>
          <div className={styles.navSection}>Platform</div>
          
          <div className={styles.navLinks}>
            {links.map(link => {
              const isActive = pathname === link.href;
              return (
                <Link 
                  key={link.name} 
                  href={link.href} 
                  className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className={styles.navIcon}>{link.icon}</span>
                  <span className={styles.navText}>{link.name}</span>
                  {link.badge && (
                    <span className={`${styles.navBadge} ${link.badgeClass || ''}`}>{link.badge}</span>
                  )}
                </Link>
              );
            })}
          </div>

        </aside>
        
        {/* Main Content */}
        <main className={styles.main}>
          {children}

          <div style={{ marginTop: '5rem', display: 'flex', justifyContent: 'center', paddingBottom: '2rem', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
            <button 
              className="btn-outline" 
              onClick={() => router.push('/platform')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.5rem', fontSize: '0.9rem', color: 'var(--muted)', borderColor: 'var(--border2)', borderRadius: '8px', transition: 'all 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--white)'; e.currentTarget.style.borderColor = 'var(--white)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.borderColor = 'var(--border2)'; }}
            >
              <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>←</span> Go Back
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
