import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import site from "../data/site.json";
import { skillIcon } from "../data/skillIcons";
import styles from "../styles/Sections.module.css";

gsap.registerPlugin(ScrollTrigger);

const legendTiers = [
  { label: "Novice", filled: 1, legendClass: styles.legendNovice },
  { label: "Basic", filled: 2, legendClass: styles.legendBasic },
  { label: "Competent", filled: 3, legendClass: styles.legendCompetent },
  { label: "Advanced", filled: 4, legendClass: styles.legendAdvanced },
  { label: "Mastery", filled: 5, legendClass: styles.legendMastery },
];

function LegendDots({ filled, tierClass }) {
  return (
    <div className={`${styles.legendDots} ${tierClass}`} aria-hidden>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={`${styles.legendDot} ${n <= filled ? styles.legendDotOn : ""}`} />
      ))}
    </div>
  );
}

function SkillDots({ level }) {
  const clamped = Math.min(5, Math.max(0, level));
  return (
    <div className={styles.skillDots} aria-hidden>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={`${styles.skillDot} ${n <= clamped ? styles.skillDotFilled : ""}`} />
      ))}
    </div>
  );
}

const Technology = () => {
  const sectionRef = useRef(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;
      gsap.fromTo(
        ".technology-reveal",
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
    <section ref={sectionRef} className={styles.technologySection} id="technology">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="technology-reveal">
          <div className={styles.arsenalHeaderBlock}>
            <div className={styles.arsenalEyebrow}>
              <span className={styles.arsenalEyebrowDot} aria-hidden />
              Tech stack
            </div>
            <h2 className={styles.arsenalTitle}>
              My <span className={styles.arsenalTitleGrad}>Technologies</span>
            </h2>
            <p className={styles.arsenalLead}>{site.skills.lead}</p>
            <div className={styles.legend} role="list" aria-label="Proficiency legend">
              {legendTiers.map((tier) => (
                <div key={tier.label} className={styles.legendItem} role="listitem">
                  <span className={styles.legendLabel}>{tier.label}</span>
                  <LegendDots filled={tier.filled} tierClass={tier.legendClass} />
                </div>
              ))}
            </div>
          </div>

          <div className={styles.arsenalGrid}>
            {site.skills.groups.map((group, groupIndex) => {
              const GroupIcon = skillIcon(group.icon);
              return (
                <article key={groupIndex} className={styles.arsenalCard} data-accent={group.accent}>
                  <div className={styles.arsenalCardHeader}>
                    <div className={styles.arsenalIconBox}>
                      <GroupIcon size={22} strokeWidth={1.75} aria-hidden />
                    </div>
                    <h3 className={styles.arsenalCardTitle}>{group.title}</h3>
                  </div>

                  <div>
                    <div className={styles.proficiencyMeta}>
                      <span>Proficiency</span>
                      <span className={styles.proficiencyPercent}>{group.proficiency}%</span>
                    </div>
                    <div className={styles.proficiencyTrack}>
                      <div
                        className={styles.proficiencyFill}
                        style={{ width: `${group.proficiency}%` }}
                        role="presentation"
                      />
                    </div>
                  </div>

                  <div className={styles.skillCellGrid}>
                    {group.skills.map((skill, skillIndex) => {
                      const SkillIcon = skillIcon(skill.icon);
                      return (
                        <div key={skillIndex} className={styles.skillCell}>
                          <div className={styles.skillCellTop}>
                            <SkillIcon className={styles.skillCellIcon} size={14} strokeWidth={2} aria-hidden />
                            <span className={styles.skillCellName} title={skill.name}>
                              {skill.name}
                            </span>
                          </div>
                          <SkillDots level={skill.level} />
                        </div>
                      );
                    })}
                  </div>

                  <p className={styles.arsenalSummary}>{group.summary}</p>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Technology;
