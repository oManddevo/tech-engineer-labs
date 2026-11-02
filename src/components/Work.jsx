import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { projects } from "../data/projects";
import sectionStyles from "../styles/Sections.module.css";
import styles from "../styles/Work.module.css";

const INITIAL_COUNT = 15;

function getProjectKind(project) {
  if (project.nda) return "nda";
  if (project.shareUrl === false) return "private";
  return project.liveUrl ? "live" : "github";
}

function hasGithubLink(project) {
  const link = project.link?.trim();
  return !!link && link !== "#";
}

const Work = ({ standalone = false }) => {
  const [showAll, setShowAll] = useState(standalone);
  const [lightbox, setLightbox] = useState(null);

  const visibleProjects = showAll ? projects : projects.slice(0, INITIAL_COUNT);
  const canToggle = !standalone && projects.length > INITIAL_COUNT;

  // Close the lightbox with Escape and lock page scroll while it is open.
  useEffect(() => {
    if (!lightbox) return;
    const handleKey = (e) => {
      if (e.key === "Escape") setLightbox(null);
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [lightbox]);

  return (
    <>
      <section className={`${styles.workSection} ${standalone ? styles.workSectionStandalone : ""}`} id="project">
        <div className={styles.workContainer}>
          <div className={sectionStyles.arsenalHeaderBlock}>
            <div className={sectionStyles.arsenalEyebrow}>
              <span className={sectionStyles.arsenalEyebrowDot} aria-hidden="true" />
              PROJECTS
            </div>
            <h2 className={sectionStyles.arsenalTitle}>
              My <span className={sectionStyles.arsenalTitleGrad}>Projects</span>
            </h2>
            <p className={sectionStyles.arsenalLead}>A collection of innovative solutions and creative projects</p>
          </div>

          <div className={styles.projectGrid}>
            {visibleProjects.map((project, i) => {
              const kind = getProjectKind(project);
              const showLive = (kind === "live" || kind === "nda") && !!project.liveUrl;
              const showGithub = kind === "github" && hasGithubLink(project);
              const hasActions = showLive || showGithub;

              return (
                <article key={`${project.name}-${i}`} className={styles.projectCard}>
                  <div className={styles.cardImageWrap}>
                    {kind === "live" ? (
                      <span className={styles.liveBadge} aria-hidden="true">
                        <span className={styles.liveDot} />
                        Live
                      </span>
                    ) : kind === "github" ? (
                      <span className={styles.sourceBadge} title="Source on GitHub">
                        GitHub
                      </span>
                    ) : kind === "nda" ? (
                      <span className={styles.privateBadge} title={`Built at ${project.company} under NDA; code not shared`}>
                        NDA
                      </span>
                    ) : (
                      <span className={styles.privateBadge} title="Source not publicly shared">
                        Private
                      </span>
                    )}
                    {project.image ? (
                      <>
                        <button
                          className={styles.imageZoomBtn}
                          onClick={() => setLightbox({ src: project.image, alt: project.name })}
                          aria-label={`Zoom ${project.name} image`}
                        >
                          <img src={project.image} alt={project.name} loading="eager" decoding="async" />
                        </button>
                        <div className={styles.cardImageOverlay} aria-hidden="true" />
                      </>
                    ) : (
                      <div className={styles.cardCover} aria-hidden="true">
                        <span className={styles.cardCoverCompany}>{project.company}</span>
                        <span className={styles.cardCoverTitle}>{project.name}</span>
                      </div>
                    )}
                  </div>

                  <div className={styles.cardBody}>
                    <div className={styles.cardHeader}>
                      {project.cat ? (
                        <span className={styles.cardCategory}>{project.cat}</span>
                      ) : (
                        <span className={styles.cardCategoryMuted}>
                          {kind === "live" ? "Product" : kind === "github" ? "Open source" : "Confidential"}
                        </span>
                      )}
                      <h3 className={styles.cardTitle}>{project.name}</h3>
                    </div>

                    <p className={styles.cardDesc}>{project.desc}</p>

                    <div className={styles.techStack} aria-label="Tech stack">
                      {project.tools.split(",").map((tool, t) => (
                        <span key={t} className={styles.techPill} data-accent={(t % 6) + 1}>
                          {tool.trim()}
                        </span>
                      ))}
                    </div>

                    {hasActions && (
                      <div className={styles.cardFooter}>
                        <div className={styles.cardActions}>
                          {showLive && project.liveUrl && (
                            <a
                              href={project.liveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={styles.cardCtaLive}
                              aria-label={
                                kind === "nda"
                                  ? `${project.name} on ${project.visitShort}`
                                  : `Visit ${project.visitShort ?? project.name}`
                              }
                            >
                              {kind === "live" && (
                                <span className={styles.ctaLiveMarker} aria-hidden="true">
                                  <span className={styles.liveDot} />
                                </span>
                              )}
                              {project.visitShort ?? "Visit site"}
                            </a>
                          )}
                          {showGithub && (
                            <a
                              href={project.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={styles.cardCtaGithub}
                              aria-label={`${project.name} on GitHub`}
                              title="GitHub"
                            >
                              <FaGithub size={20} aria-hidden="true" />
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          {canToggle && (
            <div className={styles.showMoreWrap}>
              <button
                type="button"
                className={styles.showMoreBtn}
                onClick={() => setShowAll((v) => !v)}
                aria-expanded={showAll}
              >
                {showAll ? "Show Less" : "Show More"}
                {showAll ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
            </div>
          )}
        </div>
      </section>

      {lightbox && (
        <div
          className={styles.lightboxOverlay}
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
        >
          <button className={styles.lightboxClose} onClick={() => setLightbox(null)} aria-label="Close">
            <X size={24} />
          </button>
          <img
            src={lightbox.src}
            alt={lightbox.alt}
            className={styles.lightboxImg}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};

export default Work;
