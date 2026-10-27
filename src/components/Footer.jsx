import { ArrowUp } from "lucide-react";
import Magnetic from "./Magnetic";
import { socialLinks } from "../data/contact";
import sectionStyles from "../styles/Sections.module.css";
import styles from "../styles/Footer.module.css";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className={styles.footer} id="work-together">
      <div className={sectionStyles.arsenalHeaderBlock}>
        <div className={sectionStyles.arsenalEyebrow}>
          <span className={sectionStyles.arsenalEyebrowDot} aria-hidden="true" />
          CONTACT
        </div>
        <h2 className={sectionStyles.arsenalTitle}>
          My <span className={sectionStyles.arsenalTitleGrad}>Contacts</span>
        </h2>
        <p className={sectionStyles.arsenalLead}>Let&apos;s connect and discuss to make your next project Amazing.</p>
      </div>

      <div className="max-w-7xl mx-auto px-6 w-full flex flex-col justify-center h-full relative z-10">
        <div className="flex flex-col justify-center items-center gap-8 pt-10">
          <div className="flex gap-8 justify-center mb-2 contact-gap">
            {socialLinks.map(({ label, href, Icon, external }) => (
              <Magnetic key={label}>
                <a
                  href={href}
                  className={styles.socialBtn}
                  aria-label={label}
                  {...(external && { target: "_blank", rel: "noreferrer" })}
                >
                  <Icon size={20} />
                </a>
              </Magnetic>
            ))}
          </div>
        </div>

        <div className="flex flex-col-reverse md:flex-row justify-between items-center gap-6 md:gap-0 border-t border-white/10 pt-8 mt-16 md:mt-20 pb-8">
          <div className="flex flex-col md:flex-row gap-2 md:gap-8 items-center md:items-start text-center md:text-left">
            <p className="text-gray-500 text-sm">© 2026 Tim Stearns</p>
            <p className="text-gray-600 text-sm hidden md:block">Designed &amp; Built with passion.</p>
          </div>
          <div className="flex items-center gap-6">
            <Magnetic>
              <button onClick={scrollToTop} className={styles.backToTop}>
                <ArrowUp size={20} />
              </button>
            </Magnetic>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
