import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Menu, X } from "lucide-react";
import Magnetic from "./Magnetic";
import { useLoader } from "../context/LoaderContext";
import { socialLinks } from "../data/contact";

const NAV_STYLE = {
  navbarBlur: "blur(24px)",
  navbarOpacity: 0.1,
  hazeBlur: "blur(25px)",
  hazeOpacity: 0.3,
  coreBlur: "blur(4px)",
  coreOpacity: 1,
};

const navLinks = [
  { name: "Home", href: "#hero" },
  { name: "About", href: "#about" },
  { name: "Skills", href: "#technology" },
  { name: "Projects", href: "#project" },
  { name: "Feedback", href: "#feedback" },
  { name: "Contact", href: "#work-together" },
];

const sectionToLink = {
  hero: "Home",
  about: "About",
  technology: "Skills",
  project: "Projects",
  feedback: "Feedback",
  "work-together": "Contact",
};

const Navbar = () => {
  const { isLoading } = useLoader();
  const [isOpen, setIsOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("Home");
  const menuRef = useRef(null);
  const linksRef = useRef([]);

  // Highlight the link for whichever section is in the top third of the viewport.
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 3;
      const sections = ["work-together", "feedback", "project", "technology", "about", "hero"];
      if (window.scrollY < 100) {
        setActiveLink("Home");
        return;
      }
      for (const id of sections) {
        const section = document.getElementById(id);
        if (section && scrollPosition >= section.offsetTop) {
          setActiveLink(sectionToLink[id] ?? "Home");
          return;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (e, href, name) => {
    e.preventDefault();
    setIsOpen(false);
    setActiveLink(name);

    const target = document.getElementById(href.replace("#", ""));
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
      window.history.pushState(null, "", href);
      return;
    }
    if (href === "#hero") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      window.history.pushState(null, "", "/");
    }
  };

  useGSAP(() => {
    if (isOpen) {
      const tl = gsap.timeline();
      tl.to(menuRef.current, { y: "0%", duration: 0.8, ease: "power3.inOut" });
      tl.fromTo(
        linksRef.current,
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power3.out" },
        "-=0.4",
      );
    } else {
      gsap.to(menuRef.current, { y: "-100%", duration: 0.8, ease: "power3.inOut" });
    }
  }, [isOpen]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-1000 delay-1000 ${isLoading ? "translate-y-[-100%] opacity-0" : "translate-y-0 opacity-100"}`}
      >
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <Magnetic>
            <a
              href="#hero"
              onClick={(e) => handleNavClick(e, "#hero", "Home")}
              className="header-logo relative z-50 text-white font-bold text-xl tracking-tighter cursor-pointer p-2 block mix-blend-difference"
            >
              <span className="text-sky-200">
                <img src="/images/ts-logo.png" alt="Tim Stearns logo" height={80} width={80} style={{ borderRadius: "50%" }} />
              </span>
            </a>
          </Magnetic>

          <div
            className="nav-menu hidden lg:flex items-center gap-1 px-2 py-2 rounded-full border border-white/10 shadow-lg shadow-sky-400/10"
            style={{
              backgroundColor: `rgba(255, 255, 255, ${NAV_STYLE.navbarOpacity})`,
              backdropFilter: NAV_STYLE.navbarBlur,
              WebkitBackdropFilter: NAV_STYLE.navbarBlur,
            }}
          >
            {navLinks.map((link) => {
              const isActive = activeLink === link.name;
              return (
                <Magnetic key={link.name}>
                  <a
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href, link.name)}
                    className={`relative text-sm font-medium transition-colors tracking-wide px-4 py-3 block ${isActive ? "text-white" : "text-gray-400 hover:text-gray-200"}`}
                  >
                    {link.name}
                    {isActive && <NavGlow />}
                  </a>
                </Magnetic>
              );
            })}
          </div>

          <Magnetic>
            <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden relative z-50 text-white p-2 mix-blend-difference">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </Magnetic>
        </div>
      </nav>

      {isOpen && (
        <div
          ref={menuRef}
          className="fixed inset-0 bg-[#050a14] z-40 flex flex-col justify-center items-center lg:hidden translate-y-[-100%]"
        >
          <div className="flex flex-col gap-8 items-center">
            {navLinks.map((link, i) => (
              <div key={link.name} className="overflow-hidden">
                <a
                  href={link.href}
                  ref={(el) => {
                    linksRef.current[i] = el;
                  }}
                  onClick={(e) => handleNavClick(e, link.href, link.name)}
                  className={`text-5xl font-bold transition-colors tracking-tighter block opacity-0 ${activeLink === link.name ? "text-sky-300" : "text-white hover:text-sky-300"}`}
                >
                  {link.name}
                </a>
              </div>
            ))}
            {/* Social links live here on small screens, where the hero's fixed rail is hidden. */}
            <div className="overflow-hidden pt-4">
              <div
                ref={(el) => {
                  linksRef.current[navLinks.length] = el;
                }}
                className="flex gap-8 opacity-0"
              >
                {socialLinks.map(({ label, href, Icon, external }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="text-sky-200/80 hover:text-white transition-colors"
                    {...(external && { target: "_blank", rel: "noopener noreferrer" })}
                  >
                    <Icon size={26} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const NavGlow = () => (
  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full flex justify-center pointer-events-none">
    <div
      className="absolute bottom-0 w-[90%] h-8 bg-sky-500 rounded-full"
      style={{ filter: NAV_STYLE.hazeBlur, opacity: NAV_STYLE.hazeOpacity }}
    />
    <div className="absolute bottom-[2px] w-[80%] h-[2px] bg-gradient-to-r from-transparent via-sky-300 to-transparent" />
    <div
      className="absolute bottom-[2px] w-[40%] h-[3px] bg-sky-200"
      style={{ filter: NAV_STYLE.coreBlur, opacity: NAV_STYLE.coreOpacity }}
    />
  </div>
);

export default Navbar;
