import { useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { photo } from '../../content/media';
import { site } from '../../content/site';
import { PhotoImage } from '../PhotoImage';
import { Arrow } from '../Arrow';

gsap.registerPlugin(ScrollTrigger);
export function HeroScene() {
  const ref = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add({ desktop: '(min-width: 768px)', mobile: '(max-width: 767px)', reduced: '(prefers-reduced-motion: reduce)' }, context => {
      if (context.conditions?.reduced) return;
      const desktop = context.conditions?.desktop;
      const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { id: 'hero', trigger: ref.current, start: 'top top', end: desktop ? () => `+=${window.innerHeight * 0.85}` : 'bottom top', pin: !!desktop, scrub: 0.45, invalidateOnRefresh: true, anticipatePin: 1 } });
      tl.to('.hero-photo', { scale: desktop ? 1.075 : 1.035, yPercent: -1.5, duration: 1 }, 0)
        .to('.hero-copy', { y: -36, opacity: 0, duration: 0.5 }, 0.35)
        .to('.hero-bottom', { opacity: 0, duration: 0.3 }, 0.6);
    }, ref);
    return () => mm.revert();
  }, []);
  return <section className="hero" ref={ref} aria-labelledby="hero-title" data-scene="hero">
    <PhotoImage item={photo('exterior-driveway-golden-hour')} className="hero-photo" priority full />
    <div className="hero-shade" />
    <div className="hero-top"><span className="eyebrow">Architecture & Interior Design</span><span className="eyebrow">A portfolio of spaces</span></div>
    <div className="hero-copy"><p className="eyebrow">01 / Form & feeling</p><h1 id="hero-title">{site.hero[0]}<br /><em>{site.hero[1]}</em></h1><div className="hero-actions"><Link to="/work" className="line-link">Explore the work <Arrow diagonal /></Link><Link to="/contact" className="quiet-link">Discuss a project</Link></div></div>
    <div className="hero-bottom"><span>Considered spaces.<br />From outside to within.</span><a href="#vision" className="scroll-cue">Scroll to discover <span>↓</span></a><span className="hero-caption">Architectural perspective<br />Golden hour</span></div>
  </section>;
}
