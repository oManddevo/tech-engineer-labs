import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, ExternalLink, Plus, Trash2 } from "lucide-react";
import { ACCENTS, validateSite } from "../data/validateSite";
import { SKILL_ICONS, skillIcon } from "../data/skillIcons";

// Edits src/data/site.json through the dev server (GET/PUT /__site, see vite.config.js). Dev only.

const ACCENT_COLORS = {
  purple: "#c4b5fd",
  orange: "#fb923c",
  cyan: "#7dd3fc",
  indigo: "#818cf8",
  green: "#4ade80",
  rose: "#fb7185",
};

const NEW_GROUP = { title: "", accent: "cyan", proficiency: 80, icon: "Code2", summary: "", skills: [] };
const NEW_SKILL = { name: "", level: 4, icon: "Code2" };

const inputClass =
  "w-full rounded-lg border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-400/60 focus:outline-none";
const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400";

// Returns a copy of `obj` with the value at `path` replaced.
const setIn = (obj, [key, ...rest], value) => {
  const copy = Array.isArray(obj) ? [...obj] : { ...obj };
  copy[key] = rest.length ? setIn(obj[key], rest, value) : value;
  return copy;
};

function Panel({ title, description, children }) {
  return (
    <section className="space-y-5 rounded-2xl border border-white/10 bg-slate-900/60 p-5 md:p-6">
      <div>
        <h2 className="text-lg font-bold text-white">{title}</h2>
        {description && <p className="mt-1 text-sm text-slate-400">{description}</p>}
      </div>
      {children}
    </section>
  );
}

function Field({ label, hint, children }) {
  return (
    <label className="block min-w-0">
      <span className={labelClass}>{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

function TextInput({ value, onChange, ...props }) {
  return <input className={inputClass} value={value} onChange={(e) => onChange(e.target.value)} {...props} />;
}

function TextArea({ value, onChange, rows = 3 }) {
  return (
    <textarea
      className={`${inputClass} resize-y leading-relaxed`}
      rows={rows}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function Select({ value, onChange, options, ...props }) {
  return (
    <select className={inputClass} value={value} onChange={(e) => onChange(e.target.value)} {...props}>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

function IconSelect({ value, onChange }) {
  const Icon = skillIcon(value);
  return (
    <div className="flex items-center gap-2">
      <Icon size={18} className="shrink-0 text-sky-300" aria-hidden />
      <Select value={value} onChange={onChange} options={Object.keys(SKILL_ICONS)} aria-label="Icon" />
    </div>
  );
}

function SmallButton({ label, onClick, disabled, children }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="rounded-md border border-white/10 p-1.5 text-slate-400 transition-colors hover:border-sky-400/50 hover:text-white disabled:pointer-events-none disabled:opacity-30"
    >
      {children}
    </button>
  );
}

// Editable list: renders each item with `renderItem(item, setItem)` plus move/remove buttons and an add button.
function ListField({ items, onChange, newItem, addLabel, renderItem, boxed = false }) {
  const move = (from, to) => {
    const next = [...items];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div
          key={i}
          className={`flex items-start gap-2 ${boxed ? "rounded-xl border border-white/10 bg-slate-950/40 p-4" : ""}`}
        >
          <div className="min-w-0 flex-1">{renderItem(item, (value) => onChange(setIn(items, [i], value)))}</div>
          <div className="flex shrink-0 gap-1 pt-0.5">
            <SmallButton label="Move up" onClick={() => move(i, i - 1)} disabled={i === 0}>
              <ArrowUp size={14} />
            </SmallButton>
            <SmallButton label="Move down" onClick={() => move(i, i + 1)} disabled={i === items.length - 1}>
              <ArrowDown size={14} />
            </SmallButton>
            <SmallButton label="Remove" onClick={() => onChange(items.filter((_, j) => j !== i))}>
              <Trash2 size={14} />
            </SmallButton>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, structuredClone(newItem)])}
        className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-sky-400/40 px-3 py-1.5 text-sm font-medium text-sky-300 transition-colors hover:border-sky-300 hover:text-sky-100"
      >
        <Plus size={14} /> {addLabel}
      </button>
    </div>
  );
}

function SkillGroupFields({ group, onChange }) {
  const set = (key) => (value) => onChange({ ...group, [key]: value });
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Title">
          <TextInput value={group.title} onChange={set("title")} placeholder="e.g. AI / LLM" />
        </Field>
        <Field label="Proficiency %">
          <input
            type="number"
            min={0}
            max={100}
            className={inputClass}
            value={group.proficiency}
            onChange={(e) => set("proficiency")(e.target.value === "" ? "" : Number(e.target.value))}
          />
        </Field>
        <Field label="Color">
          <div className="flex items-center gap-2">
            <span className="h-4 w-4 shrink-0 rounded-full" style={{ background: ACCENT_COLORS[group.accent] }} />
            <Select value={group.accent} onChange={set("accent")} options={ACCENTS} />
          </div>
        </Field>
        <Field label="Icon">
          <IconSelect value={group.icon} onChange={set("icon")} />
        </Field>
      </div>
      <Field label="Description">
        <TextArea value={group.summary} onChange={set("summary")} rows={2} />
      </Field>
      <div>
        <span className={labelClass}>Skills (level 1 = novice, 5 = mastery)</span>
        <ListField
          items={group.skills}
          onChange={set("skills")}
          newItem={NEW_SKILL}
          addLabel="Add skill"
          renderItem={(skill, setSkill) => (
            <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_5rem_11rem]">
              <TextInput
                value={skill.name}
                onChange={(name) => setSkill({ ...skill, name })}
                placeholder="Skill name"
                aria-label="Skill name"
              />
              <Select
                value={String(skill.level)}
                onChange={(level) => setSkill({ ...skill, level: Number(level) })}
                options={["1", "2", "3", "4", "5"]}
                aria-label="Level"
              />
              <IconSelect value={skill.icon} onChange={(icon) => setSkill({ ...skill, icon })} />
            </div>
          )}
        />
      </div>
    </div>
  );
}

export default function Editor() {
  const [site, setSite] = useState(null);
  const [savedJson, setSavedJson] = useState("");
  const [status, setStatus] = useState({ kind: "idle", message: "" });
  const dirty = site !== null && JSON.stringify(site) !== savedJson;

  useEffect(() => {
    document.title = "Edit site content";
    fetch("/__site")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((data) => {
        setSite(data);
        setSavedJson(JSON.stringify(data));
      })
      .catch((err) => setStatus({ kind: "error", message: `Could not load content: ${err.message}` }));
  }, []);

  const save = async () => {
    const error = validateSite(site);
    if (error) {
      setStatus({ kind: "error", message: error });
      return;
    }
    setStatus({ kind: "saving", message: "Saving…" });
    try {
      const res = await fetch("/__site", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(site),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`);
      setSavedJson(JSON.stringify(site));
      setStatus({ kind: "saved", message: "Saved to src/data/site.json" });
    } catch (err) {
      setStatus({ kind: "error", message: err.message });
    }
  };

  // Ctrl/Cmd+S saves; warn before leaving with unsaved changes.
  const saveRef = useRef(save);
  saveRef.current = save;
  useEffect(() => {
    const handleKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        saveRef.current();
      }
    };
    const handleUnload = (e) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("keydown", handleKey);
    window.addEventListener("beforeunload", handleUnload);
    return () => {
      window.removeEventListener("keydown", handleKey);
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [dirty]);

  const set = (...path) => (value) => setSite((prev) => setIn(prev, path, value));

  const [statusText, statusClass] =
    status.kind === "error" || status.kind === "saving"
      ? [status.message, status.kind === "error" ? "text-rose-300" : "text-slate-400"]
      : dirty
        ? ["Unsaved changes", "text-amber-300"]
        : [status.message, "text-emerald-300"];

  return (
    <div className="min-h-screen text-slate-100">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-[#050a14]/90 backdrop-blur">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 md:px-6">
          <h1 className="text-base font-bold">Site content</h1>
          <p className={`min-w-0 flex-1 truncate text-sm ${statusClass}`} role="status">
            {statusText}
          </p>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-slate-300 hover:text-white"
          >
            View site <ExternalLink size={14} />
          </a>
          <button
            type="button"
            onClick={save}
            disabled={!dirty || status.kind === "saving"}
            className="rounded-lg bg-sky-300 px-4 py-2 text-sm font-bold text-slate-950 transition-colors hover:bg-sky-200 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Save
          </button>
        </div>
      </header>

      {site && (
        <main className="mx-auto max-w-4xl space-y-6 px-4 py-8 md:px-6">
          <Panel title="Links" description="Shown in the hero sidebar and the contact section. Leave a field empty to hide its icon.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Email">
                <TextInput type="email" value={site.contact.email} onChange={set("contact", "email")} />
              </Field>
              <Field label="WhatsApp number" hint="With country code, e.g. +1 941 417 0729">
                <TextInput type="tel" value={site.contact.whatsapp} onChange={set("contact", "whatsapp")} />
              </Field>
              <Field label="LinkedIn URL">
                <TextInput type="url" value={site.contact.linkedin} onChange={set("contact", "linkedin")} />
              </Field>
              <Field label="GitHub URL">
                <TextInput type="url" value={site.contact.github} onChange={set("contact", "github")} />
              </Field>
            </div>
          </Panel>

          <Panel title="Hero" description="The text over the particle name at the top of the page.">
            <Field label="Job title" hint="Also used in the About section.">
              <TextInput value={site.hero.title} onChange={set("hero", "title")} />
            </Field>
            <div>
              <span className={labelClass}>Specialties (rotate under the name)</span>
              <ListField
                items={site.hero.specialties}
                onChange={set("hero", "specialties")}
                newItem=""
                addLabel="Add specialty"
                renderItem={(value, setValue) => (
                  <TextInput value={value} onChange={setValue} aria-label="Specialty" />
                )}
              />
            </div>
            <Field label="Headline">
              <TextInput value={site.hero.headline} onChange={set("hero", "headline")} />
            </Field>
            <Field label="Subtitle">
              <TextArea value={site.hero.subtitle} onChange={set("hero", "subtitle")} />
            </Field>
          </Panel>

          <Panel title="Summary" description="The About section, one box per paragraph.">
            <ListField
              items={site.summary}
              onChange={set("summary")}
              newItem=""
              addLabel="Add paragraph"
              renderItem={(value, setValue) => <TextArea value={value} onChange={setValue} rows={4} />}
            />
          </Panel>

          <Panel title="Skills" description="The Technologies section: one card per group.">
            <Field label="Intro">
              <TextArea value={site.skills.lead} onChange={set("skills", "lead")} rows={2} />
            </Field>
            <ListField
              items={site.skills.groups}
              onChange={set("skills", "groups")}
              newItem={NEW_GROUP}
              addLabel="Add skill group"
              boxed
              renderItem={(group, setGroup) => <SkillGroupFields group={group} onChange={setGroup} />}
            />
          </Panel>

          <Panel
            title="Feedback"
            description="The Team Collaboration section. Testimonials appear once you add one; use real quotes, such as a LinkedIn recommendation, with the person's OK."
          >
            <Field label="Intro">
              <TextArea value={site.feedback.lead} onChange={set("feedback", "lead")} rows={2} />
            </Field>
            <div>
              <span className={labelClass}>Highlights</span>
              <ListField
                items={site.feedback.highlights}
                onChange={set("feedback", "highlights")}
                newItem={{ value: "", label: "" }}
                addLabel="Add highlight"
                renderItem={(highlight, setHighlight) => (
                  <div className="grid gap-2 sm:grid-cols-[7rem_minmax(0,1fr)]">
                    <TextInput
                      value={highlight.value}
                      onChange={(value) => setHighlight({ ...highlight, value })}
                      placeholder="6"
                      aria-label="Number"
                    />
                    <TextInput
                      value={highlight.label}
                      onChange={(label) => setHighlight({ ...highlight, label })}
                      placeholder="Engineers mentored"
                      aria-label="Text"
                    />
                  </div>
                )}
              />
            </div>
            <div>
              <span className={labelClass}>Testimonials</span>
              <ListField
                items={site.feedback.testimonials}
                onChange={set("feedback", "testimonials")}
                newItem={{ quote: "", name: "", role: "" }}
                addLabel="Add testimonial"
                boxed
                renderItem={(testimonial, setTestimonial) => (
                  <div className="space-y-3">
                    <Field label="Quote">
                      <TextArea
                        value={testimonial.quote}
                        onChange={(quote) => setTestimonial({ ...testimonial, quote })}
                      />
                    </Field>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Name">
                        <TextInput
                          value={testimonial.name}
                          onChange={(name) => setTestimonial({ ...testimonial, name })}
                        />
                      </Field>
                      <Field label="Role and company">
                        <TextInput
                          value={testimonial.role}
                          onChange={(role) => setTestimonial({ ...testimonial, role })}
                          placeholder="Engineering Manager, Airbnb"
                        />
                      </Field>
                    </div>
                  </div>
                )}
              />
            </div>
          </Panel>
        </main>
      )}
    </div>
  );
}
