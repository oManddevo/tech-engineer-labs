import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Bot, Terminal, Users } from "lucide-react";
import site from "../data/site.json";
import styles from "../styles/Sections.module.css";

gsap.registerPlugin(ScrollTrigger);

const teamNote =
  "Backed by a small team and a network of specialized developers and researchers, allowing us to handle multiple projects, scale to larger engagements, and collaborate with everyone from early-stage startups to established businesses.";

const stats = [
  { value: "7+", label: "Years Exp." },
  { value: "40+", label: "Projects" },
  { value: "AI / Web", label: "Focus" },
  { value: "Whop", label: "Monetization" },
];

const About = () => {
  const sectionRef = useRef(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;
      gsap.fromTo(
        ".about-reveal",
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: { trigger: section, start: "top 75%" },
        },
      );
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className={styles.aboutSection} id="about">
      <div className={styles.glowBg} />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className={styles.heroGrid}>
          <div className="about-reveal w-full md:w-1/3 flex flex-col items-center md:items-start">
            <div className={styles.imageWrapper}>
              <img src="/images/MYPIC.jpg" alt="Tim Stearns" />
              <div className={styles.imageCaption}>
                <div className="flex items-center gap-2 text-sky-300">
                  <Terminal size={16} />
                  <span className="text-xs font-mono uppercase tracking-widest">{site.hero.title}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="about-reveal w-full md:w-2/3 flex flex-col justify-center gap-8">
            <div className={styles.positionEyebrow}>
              <Bot size={14} aria-hidden />
              {site.hero.title}
            </div>
            <div className={`text-gray-300 flex flex-col gap-5 ${styles.overviewBlock}`}>
              {site.summary.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>

        <div className={`about-reveal ${styles.heroMeta}`}>
          <div className={styles.teamNote}>
            <Users size={20} className={styles.teamNoteIcon} aria-hidden />
            <p>{teamNote}</p>
          </div>
          <div className={styles.statsGrid}>
            {stats.map((stat) => (
              <div key={stat.label}>
                <h3 className="text-3xl font-bold text-white">{stat.value}</h3>
                <p className="text-sm text-gray-500 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
