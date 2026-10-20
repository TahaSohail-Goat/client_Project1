import { Route, Routes, Link, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { ScrollEngine } from "./components/scroll/ScrollEngine";
import { HeroScene } from "./components/home/HeroScene";
import { InteriorSequence } from "./components/home/InteriorSequence";
import { MaterialsScene } from "./components/home/MaterialsScene";
import { ScaleModelScene } from "./components/home/ScaleModelScene";
import PortfolioSection from "./components/sections/PortfolioSection";
import { StudioIntro } from "./components/sections/StudioSections";
import InquirySection from "./components/sections/InquirySection";
import { site } from "./content/site";

function Home() {
  return (
    <>
      <HeroScene />
      <InteriorSequence />
      <MaterialsScene />
      <ScaleModelScene />
      <PortfolioSection />
      <StudioIntro />
      <InquirySection />
    </>
  );
}
function NotFound() {
  return (
    <section className="page-heading section-pad">
      <p className="eyebrow">404 / A different direction</p>
      <h1>Page not found.</h1>
      <p>The page you’re looking for isn’t here.</p>
      <Link className="line-link" to="/">
        Return home ↗
      </Link>
    </section>
  );
}
export default function App() {
  const { pathname } = useLocation();
  const previousPath = useRef(pathname);
  useEffect(() => {
    document.title = `${pathname === "/" ? "Architecture & Interiors" : pathname.slice(1).replace(/^./, (c) => c.toUpperCase())} — ${site.name}`;
  }, [pathname]);
  useEffect(() => {
    if (previousPath.current !== pathname)
      document.getElementById("main")?.focus({ preventScroll: true });
    previousPath.current = pathname;
  }, [pathname]);
  return (
    <>
      <ScrollEngine />
      <Header />
      <main id="main" tabIndex={-1}>
        <Routes>
          {["/", "/work", "/studio", "/contact"].map((path) => (
            <Route key={path} path={path} element={<Home />} />
          ))}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
