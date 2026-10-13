import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { site } from '../../content/site';
import { Arrow } from '../Arrow';

const navigation = [{ label: 'Work', href: '/work' }, { label: 'Approach', href: '/#approach' }, { label: 'Studio', href: '/studio' }, { label: 'Expertise', href: '/studio#expertise' }, { label: 'Contact', href: '/contact' }];
export function Header() {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const reduced = useReducedMotion();
  useEffect(() => { setOpen(false); }, [location]);
  useEffect(() => {
    if (!open) return;
    const prior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const backgrounds = document.querySelectorAll<HTMLElement>('main, footer');
    backgrounds.forEach(element => { element.inert = true; });
    panel.current?.querySelector<HTMLElement>('a')?.focus();
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpen(false); toggle.current?.focus(); }
      if (event.key === 'Tab') {
        const targets = [toggle.current!, ...Array.from(panel.current?.querySelectorAll<HTMLElement>('a') ?? [])];
        const first = targets[0], last = targets.at(-1)!;
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', keyboard);
    return () => { document.body.style.overflow = prior; backgrounds.forEach(element => { element.inert = false; }); document.removeEventListener('keydown', keyboard); };
  }, [open]);
  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="header">
      <Link to="/" className="wordmark" aria-label={`${site.name} home`}><svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true"><path d="M3 28V4h26v24M9 28V10h14v18M1 28h30" fill="none" stroke="currentColor" strokeWidth="1" /></svg><span>{site.name}<small>ARCHITECTURE & INTERIORS</small></span></Link>
      <nav className="desktop-nav" aria-label="Main navigation">{navigation.map(item => <NavLink key={item.label} to={item.href} className={({ isActive }) => isActive && !item.href.includes('#') ? 'active' : undefined}>{item.label}</NavLink>)}</nav>
      <Link to="/contact" className="header-inquiry">Discuss a project <Arrow diagonal /></Link>
      <button className="menu-toggle" ref={toggle} onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? 'Close navigation' : 'Open navigation'}><span>{open ? 'Close' : 'Menu'}</span><i className={open ? 'is-open' : ''} /></button>
    </header>
    <AnimatePresence>{open && <motion.div id="mobile-navigation" ref={panel} className="mobile-navigation" initial={{ opacity: 0, y: reduced ? 0 : -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : 0.25 }}><nav aria-label="Mobile navigation">{navigation.map((item, index) => <Link key={item.label} to={item.href}><small>0{index + 1}</small>{item.label}<Arrow diagonal /></Link>)}</nav><p>Architecture & Interior Design</p><span className="eyebrow">Brand name pending approval</span></motion.div>}</AnimatePresence>
  </>;
}
