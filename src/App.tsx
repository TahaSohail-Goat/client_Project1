import { Route, Routes, Link, useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect, useRef } from "react";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { ScrollEngine } from "./components/scroll/ScrollEngine";
import { HeroScene } from "./components/home/HeroScene";
import { ExteriorWorks } from "./components/home/ExteriorWorks";
import { InteriorSequence } from "./components/home/InteriorSequence";
import { MaterialsScene } from "./components/home/MaterialsScene";
import { ScaleModelScene } from "./components/home/ScaleModelScene";
import { ApproachEditorial } from "./components/home/ApproachEditorial";
import { StudioExpertise } from "./components/home/StudioExpertise";
import { ConsultationCTA } from "./components/home/ConsultationCTA";
import { site } from "./content/site";
const WorkPage = lazy(() => import("./pages/WorkPage"));
const StudioPage = lazy(() => import("./pages/StudioPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));

function Home() {
  return (
    <>
      <HeroScene />
      <ExteriorWorks />
      <InteriorSequence />
      <MaterialsScene />
      <ScaleModelScene />
      <ApproachEditorial />
      <StudioExpertise />
      <ConsultationCTA />
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
        <Suspense
          fallback={
            <div className="route-loading" role="status">
              Opening chapter…
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/work" element={<WorkPage />} />
            <Route path="/studio" element={<StudioPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
