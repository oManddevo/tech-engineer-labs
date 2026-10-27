// Shape checks for src/data/site.json, shared by the /edit page and the dev-server save endpoint.

export const ACCENTS = ["purple", "orange", "cyan", "indigo", "green", "rose"];

const isString = (v) => typeof v === "string";
const isHttpsUrl = (v) => v === "" || /^https:\/\/[^\s]+$/.test(v);
const isEmail = (v) => v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isPhone = (v) => v === "" || /^\+?[\d\s().-]{7,20}$/.test(v);
const isInt = (v, min, max) => Number.isInteger(v) && v >= min && v <= max;

// Returns the first problem found as a readable message, or null when the content is valid.
export function validateSite(site) {
  const errors = [];
  const check = (ok, message) => {
    if (!ok) errors.push(message);
  };
  const list = (value, path, checkItem) => {
    if (!Array.isArray(value)) return errors.push(`${path} must be a list`);
    value.forEach((item, i) => checkItem(item ?? {}, `${path} #${i + 1}`));
  };

  if (!site || typeof site !== "object") return "Content must be an object";
  const { contact = {}, hero = {}, summary, skills = {}, feedback = {} } = site;

  check(isString(contact.email) && isEmail(contact.email), "Email is not a valid address");
  check(isString(contact.whatsapp) && isPhone(contact.whatsapp), "WhatsApp number may only contain digits, spaces, + ( ) - .");
  check(isString(contact.linkedin) && isHttpsUrl(contact.linkedin), "LinkedIn URL must start with https://");
  check(isString(contact.github) && isHttpsUrl(contact.github), "GitHub URL must start with https://");

  check(isString(hero.title) && hero.title.trim() !== "", "Job title is required");
  list(hero.specialties, "Specialty", (s, path) => check(isString(s) && s.trim() !== "", `${path} is empty`));
  check(isString(hero.headline), "Headline must be text");
  check(isString(hero.subtitle), "Subtitle must be text");

  list(summary, "Summary paragraph", (p, path) => check(isString(p) && p.trim() !== "", `${path} is empty`));

  check(isString(skills.lead), "Skills intro must be text");
  list(skills.groups, "Skill group", (group, path) => {
    check(isString(group.title) && group.title.trim() !== "", `${path}: title is required`);
    check(ACCENTS.includes(group.accent), `${path}: color must be one of ${ACCENTS.join(", ")}`);
    check(isInt(group.proficiency, 0, 100), `${path}: proficiency must be a whole number from 0 to 100`);
    check(isString(group.icon), `${path}: icon is required`);
    check(isString(group.summary), `${path}: description must be text`);
    list(group.skills, `${path}, skill`, (skill, skillPath) => {
      check(isString(skill.name) && skill.name.trim() !== "", `${skillPath}: name is required`);
      check(isInt(skill.level, 1, 5), `${skillPath}: level must be 1 to 5`);
      check(isString(skill.icon), `${skillPath}: icon is required`);
    });
  });

  check(isString(feedback.lead), "Feedback intro must be text");
  list(feedback.highlights, "Highlight", (h, path) => {
    check(isString(h.value) && h.value.trim() !== "", `${path}: number is required`);
    check(isString(h.label) && h.label.trim() !== "", `${path}: text is required`);
  });
  list(feedback.testimonials, "Testimonial", (t, path) => {
    check(isString(t.quote) && t.quote.trim() !== "", `${path}: quote is required`);
    check(isString(t.name) && t.name.trim() !== "", `${path}: name is required`);
    check(isString(t.role), `${path}: role must be text`);
  });

  return errors[0] ?? null;
}
