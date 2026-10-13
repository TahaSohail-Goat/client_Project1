import { Route, Routes, Link, useLocation } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ScrollEngine } from './components/scroll/ScrollEngine';
import { HeroScene } from './components/home/HeroScene';
import { FacadePanelReveal } from './components/home/FacadePanelReveal';
import { ExteriorWorks } from './components/home/ExteriorWorks';
import { InteriorSequence } from './components/home/InteriorSequence';
import { MaterialsScene } from './components/home/MaterialsScene';
import { ScaleModelScene } from './components/home/ScaleModelScene';
const WorkPage = lazy(() => import('./pages/WorkPage'));

function Home() { return <><HeroScene /><FacadePanelReveal /><ExteriorWorks /><InteriorSequence /><MaterialsScene /><ScaleModelScene /><section className="section-pad static-intro" id="approach"><p className="eyebrow">07 / Architecture & interiors</p><h2>A dialogue between<br /><em>space and life.</em></h2><Link className="line-link" to="/work">Explore the work ↗</Link></section></>; }
function Placeholder({ title }: { title: string }) { return <section className="page-heading section-pad"><p className="eyebrow">Studio preview</p><h1>{title}</h1><p>This chapter is being prepared.</p><Link to="/">Return home</Link></section>; }
export default function App() {
  const { pathname } = useLocation();
  useEffect(() => { document.title = `${pathname === '/' ? 'Architecture & Interiors' : pathname.slice(1).replace(/^./, c => c.toUpperCase())} — STUDIO NAME`; }, [pathname]);
  return <><ScrollEngine /><Header /><main id="main" tabIndex={-1}><Suspense fallback={<div className="route-loading" role="status">Opening chapter…</div>}><Routes><Route path="/" element={<Home />} /><Route path="/work" element={<WorkPage />} /><Route path="/studio" element={<Placeholder title="The studio" />} /><Route path="/contact" element={<Placeholder title="Let’s shape your next space." />} /><Route path="*" element={<Placeholder title="Page not found" />} /></Routes></Suspense></main><Footer /></>;
}
