import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import ParticleText from "./ParticleText";
import { useLoader } from "../context/LoaderContext";
import { socialLinks } from "../data/contact";
import site from "../data/site.json";

const ROLE_FADE_MS = 700;
const ROLE_HOLD_MS = 2500;
const RAIL_MIN_HERO_VISIBLE = 0.85; // share of the hero still on screen for the social rail to show

const socialLinkClass = "text-sky-200/70 hover:text-sky-50 transition-colors";

// Smooth-scroll the hero buttons to their section and keep the hash in the URL.
const scrollToSection = (e) => {
  const href = e.currentTarget.getAttribute("href");
  const target = document.querySelector(href);
  if (!target) return;
  e.preventDefault();
  target.scrollIntoView({ behavior: "smooth", block: "start" });
  window.history.pushState(null, "", href);
};

const Hero = () => {
  const { isLoading } = useLoader();
  const { title, specialties: roles, headline, subtitle } = site.hero;
  const sectionRef = useRef(null);
  const [inView, setInView] = useState(true);
  const [railVisible, setRailVisible] = useState(true);
  const [roleIndex, setRoleIndex] = useState(0);
  const [showRole, setShowRole] = useState(false);

  // Pause the WebGL render loop while the hero is scrolled out of view, and hide the social rail as soon as
  // the hero starts scrolling away (the rail is fixed and would sit on top of the sections below).
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        setRailVisible(entry.intersectionRatio >= RAIL_MIN_HERO_VISIBLE);
      },
      { root: null, threshold: [0, RAIL_MIN_HERO_VISIBLE] },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => {
      if (sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, []);

  // Cycle the specialty line under the name: fade in, hold, fade out, next.
  useEffect(() => {
    if (isLoading || roles.length === 0) {
      setShowRole(false);
      return;
    }
    let holdTimer;
    let nextTimer;
    const cycle = () => {
      setShowRole(true);
      holdTimer = setTimeout(() => {
        setShowRole(false);
        nextTimer = setTimeout(() => {
          setRoleIndex((i) => (i + 1) % roles.length);
          cycle();
        }, ROLE_FADE_MS);
      }, ROLE_HOLD_MS);
    };
    cycle();
    return () => {
      clearTimeout(holdTimer);
      clearTimeout(nextTimer);
    };
  }, [isLoading, roles.length]);

  return (
    <section ref={sectionRef} id="hero" className="reference-home relative w-full h-screen">
      <div
        className={`fixed inset-0 bg-[#050a14] transition-opacity duration-[2000ms] ease-in-out ${isLoading ? "opacity-0" : "opacity-100"}`}
      >
        <Canvas camera={{ position: [0, 0, 35], fov: 45 }} frameloop={inView ? "always" : "never"} dpr={[1, 2]}>
          <color attach="background" args={["#050a14"]} />
          <ambientLight intensity={0.5} />
          <ParticleText isExpanded={!isLoading} text="TIM STEARNS" />
          <EffectComposer>
            <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} intensity={1.5} />
          </EffectComposer>
        </Canvas>
      </div>

      <div
        className={`relative z-10 w-full h-full flex flex-col items-center justify-center pointer-events-none transition-opacity duration-1000 delay-500 ${isLoading ? "opacity-0" : "opacity-100"}`}
      >
        <div className="h-[15vh]" />
        <div className="mt-[12vh] flex min-h-[3rem] md:min-h-[3.5rem] items-center justify-center px-4 text-center">
          <h2
            className={`text-transparent bg-clip-text bg-gradient-to-r from-sky-200 to-white text-base sm:text-xl md:text-2xl font-light tracking-[0.14em] sm:tracking-[0.2em] uppercase transition-all duration-700 ease-in-out ${showRole ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
          >
            {roles[roleIndex % roles.length]}
          </h2>
        </div>
      </div>

      {/* Social rail: desktop only (the mobile menu lists the same links), fades out once the hero scrolls away. */}
      <div
        className={`fixed bottom-12 left-12 z-[9990] hidden lg:block transition-all duration-1000 delay-[1500ms] ${isLoading ? "opacity-0 translate-y-10" : "opacity-100 translate-y-0"}`}
      >
        <div
          className={`flex flex-col gap-6 transition-all duration-500 ${railVisible ? "opacity-100 translate-y-0" : "pointer-events-none opacity-0 translate-y-6"}`}
        >
          {socialLinks.map(({ label, href, Icon, external }) => (
            <a
              key={label}
              href={href}
              className={socialLinkClass}
              aria-label={label}
              {...(external && { target: "_blank", rel: "noopener noreferrer" })}
            >
              <Icon size={20} />
            </a>
          ))}
          <div className="w-[1px] h-12 bg-sky-200/30 mx-auto mt-2" />
        </div>
      </div>

      <div
        className={`absolute bottom-10 left-0 right-0 flex justify-center pointer-events-none transition-opacity duration-1000 delay-[2000ms] ${isLoading ? "opacity-0" : "opacity-100"}`}
      >
        <p className="text-sky-200/60 text-[10px] tracking-[0.4em] uppercase animate-pulse">Scroll to Explore</p>
      </div>

      {/* Job title, headline and calls to action over the particles (styles in public/assets/reference-home.css). */}
      <div className="reference-home__content">
        <p className="reference-home__eyebrow">{title}</p>
        <h1>{headline}</h1>
        <p className="reference-home__copy">{subtitle}</p>
        <div className="reference-home__actions">
          <a className="reference-home__button reference-home__button--primary" href="#project" onClick={scrollToSection}>
            Explore my work <span className="reference-home__arrow">↗</span>
          </a>
          <a
            className="reference-home__button reference-home__button--secondary"
            href="#work-together"
            onClick={scrollToSection}
          >
            Start a conversation <span className="reference-home__arrow">↗</span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
