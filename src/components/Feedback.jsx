import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Quote } from "lucide-react";
import site from "../data/site.json";
import sectionStyles from "../styles/Sections.module.css";
import styles from "../styles/Feedback.module.css";

gsap.registerPlugin(ScrollTrigger);

// Team-collaboration highlights plus quotes from teammates; quotes are added on the /edit page.
const Feedback = () => {
  const sectionRef = useRef(null);
  const { lead, highlights, testimonials } = site.feedback;

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;
      gsap.fromTo(
        ".feedback-reveal",
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
    <section ref={sectionRef} className={styles.feedbackSection} id="feedback">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className={`feedback-reveal ${sectionStyles.arsenalHeaderBlock}`}>
          <div className={sectionStyles.arsenalEyebrow}>
            <span className={sectionStyles.arsenalEyebrowDot} aria-hidden />
            Feedback
          </div>
          <h2 className={sectionStyles.arsenalTitle}>
            Team <span className={sectionStyles.arsenalTitleGrad}>Collaboration</span>
          </h2>
          <p className={sectionStyles.arsenalLead}>{lead}</p>
        </div>

        {highlights.length > 0 && (
          <div className={`feedback-reveal ${styles.highlightGrid}`}>
            {highlights.map((highlight, i) => (
              <div key={i} className={styles.highlight}>
                <h3 className={styles.highlightValue}>{highlight.value}</h3>
                <p className={styles.highlightLabel}>{highlight.label}</p>
              </div>
            ))}
          </div>
        )}

        {testimonials.length > 0 ? (
          <div className={`feedback-reveal ${styles.testimonialGrid}`}>
            {testimonials.map((testimonial, i) => (
              <figure key={i} className={styles.testimonial}>
                <Quote size={22} className={styles.quoteIcon} aria-hidden />
                <blockquote className={styles.quote}>{testimonial.quote}</blockquote>
                <figcaption className={styles.author}>
                  <span className={styles.authorName}>{testimonial.name}</span>
                  {testimonial.role && <span className={styles.authorRole}>{testimonial.role}</span>}
                </figcaption>
              </figure>
            ))}
          </div>
        ) : (
          import.meta.env.DEV && (
            <p className={styles.devHint}>
              Only visible in development: add quotes from teammates at <a href="/edit">/edit</a> and they appear here.
            </p>
          )
        )}
      </div>
    </section>
  );
};

export default Feedback;
