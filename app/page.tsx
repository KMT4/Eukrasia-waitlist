"use client";

import { FormEvent, useState } from "react";

const languages: [string, string][] = [
  ["en", "English"],
  ["yo", "Yorùbá"],
  ["ha", "Hausa"],
];

function Icon({ path, size = 18 }: { path: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  );
}

const ICONS = {
  shield: "M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Z",
  spark: "M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18",
  users: "M17 20v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM21 20v-1a4 4 0 0 0-3-3.87M15.5 4.1a3.5 3.5 0 0 1 0 6.8",
  stethoscope: "M5 3v6a4 4 0 0 0 8 0V3M9 13v2a5 5 0 0 0 10 0v-2M19 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
  clipboard: "M9 3h6v3H9zM6 6h12v15H6zM9 11h6M9 15h6",
  mapPin: "M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12ZM12 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
  pillShield: "M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3ZM9 12l2 2 4-4",
  heart: "M12 20s-7-4.4-9.3-9C1.2 7.7 2.8 4 6.5 4c2 0 3.3 1 3.5 2.5C10.2 5 11.5 4 13.5 4 17.2 4 18.8 7.7 17.3 11 15 15.6 12 20 12 20Z",
  lock: "M6 11V8a6 6 0 0 1 12 0v3M5 11h14v10H5zM12 15v3",
};

function Brand() {
  return (
    <a href="#top" className="brand2" aria-label="Eukrasia home">
      <span className="brand2-mark"><Icon path={ICONS.heart} size={20} /></span>
      <span><strong>Eukrasia</strong><small>YOUR HEALTH COMPANION</small></span>
    </a>
  );
}

function CompanionIllustration() {
  return (
    <svg viewBox="0 0 360 460" width="100%" height="100%" role="img" aria-label="Illustration of the Eukrasia chat companion on a phone">
      <path d="M36 268 L70 268 L82 232 L98 300 L114 268 L150 268" fill="none" stroke="#2F5142" strokeOpacity=".28" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="300" cy="120" r="46" fill="#2F5142" fillOpacity=".08" />
      <circle cx="46" cy="110" r="30" fill="#2F5142" fillOpacity=".1" />

      <rect x="70" y="28" width="220" height="404" rx="36" fill="#12281F" />
      <rect x="82" y="44" width="196" height="372" rx="24" fill="#F8F5EE" />
      <circle cx="180" cy="58" r="2.6" fill="#12281F" fillOpacity=".3" />

      <circle cx="104" cy="80" r="11" fill="#1B3A2E" />
      <path d="M104 74.5c-2.8 0-5 2.1-5 4.9 0 3.6 5 7.6 5 7.6s5-4 5-7.6c0-2.8-2.2-4.9-5-4.9Z" fill="#fff" />
      <rect x="120" y="74" width="70" height="5" rx="2.5" fill="#1B3A2E" />
      <rect x="120" y="84" width="46" height="4" rx="2" fill="#5B6B60" />
      <line x1="94" y1="100" x2="266" y2="100" stroke="#E3DFD0" strokeWidth="1.5" />

      <rect x="94" y="114" width="138" height="48" rx="15" fill="#DCE8DE" />
      <rect x="108" y="126" width="88" height="5" rx="2.5" fill="#2F5142" fillOpacity=".55" />
      <rect x="108" y="137" width="108" height="5" rx="2.5" fill="#2F5142" fillOpacity=".4" />
      <rect x="108" y="148" width="64" height="5" rx="2.5" fill="#2F5142" fillOpacity=".4" />

      <rect x="152" y="174" width="114" height="34" rx="15" fill="#1B3A2E" />
      <rect x="166" y="184" width="70" height="5" rx="2.5" fill="#fff" fillOpacity=".85" />
      <rect x="166" y="194" width="48" height="5" rx="2.5" fill="#fff" fillOpacity=".6" />

      <rect x="94" y="222" width="156" height="60" rx="15" fill="#DCE8DE" />
      <rect x="108" y="234" width="100" height="5" rx="2.5" fill="#2F5142" fillOpacity=".55" />
      <rect x="108" y="245" width="128" height="5" rx="2.5" fill="#2F5142" fillOpacity=".4" />
      <rect x="108" y="256" width="80" height="5" rx="2.5" fill="#2F5142" fillOpacity=".4" />
      <rect x="108" y="267" width="54" height="5" rx="2.5" fill="#2F5142" fillOpacity=".4" />

      <circle cx="104" cy="304" r="3.2" fill="#1B3A2E" fillOpacity=".35" />
      <circle cx="116" cy="304" r="3.2" fill="#1B3A2E" fillOpacity=".55" />
      <circle cx="128" cy="304" r="3.2" fill="#1B3A2E" fillOpacity=".8" />

      <rect x="94" y="378" width="172" height="26" rx="13" fill="#fff" stroke="#E3DFD0" />
      <circle cx="250" cy="391" r="11" fill="#1B3A2E" />
      <path d="M246 391h9M251 387l4 4-4 4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export default function WaitlistPage() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setMessage("");
    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = Object.fromEntries(data.entries());
    const response = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...payload, consent: data.get("consent") === "on" }),
    });
    const result = (await response.json()) as { error?: string };
    if (!response.ok) {
      setStatus("error");
      setMessage(result.error ?? "We could not save your place.");
      return;
    }
    setStatus("success");
    setMessage("You’re on the list — we’ll be in touch as Eukrasia gets ready to launch.");
    form.reset();
  }

  return (
    <main id="top">
      <header className="site-header">
        <Brand />
        <nav className="nav-links" aria-label="Primary">
          <a href="#expect">About</a>
          <a href="#expect">Features</a>
          <a href="/admin">Team login</a>
        </nav>
      </header>

      <section className="hero2">
        <div className="hero-copy2">
          <p className="eyebrow2">WAITLIST</p>
          <h1>Your health,<br /><em>understood, together.</em></h1>
          <p className="lede2">
            <strong>Eukrasia</strong> is an AI-powered health companion built to help you make sense of symptoms,
            follow through on care, and stay well — every day, wherever you are.
          </p>
          <div className="trust-row">
            <div className="trust-item"><Icon path={ICONS.shield} /><span>Trusted health guidance</span></div>
            <div className="trust-item"><Icon path={ICONS.spark} /><span>Practical tools for daily life</span></div>
            <div className="trust-item"><Icon path={ICONS.users} /><span>Built for everyone, everywhere</span></div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="visual-glow" />
          <div className="visual-panel">
            <div className="visual-frame">
              <CompanionIllustration />
              <div className="visual-badge">
                <span>✦</span>
                <p>Built to understand<br />what you&apos;re feeling.</p>
              </div>
              <div className="visual-quote">
                <p>&ldquo;Small steps, steady care.&rdquo;</p>
                <span>Eukrasia</span>
              </div>
            </div>
            <span className="lang-chip chip-en">EN</span>
            <span className="lang-chip chip-yo">YO</span>
            <span className="lang-chip chip-ha">HA</span>
          </div>
        </div>
      </section>

      <section className="hero2 hero2-form-row">
        <form id="join" className="waitlist-form" onSubmit={submit}>
          <p className="form-kicker2">Reserve your place</p>
          <h3>Join the waitlist</h3>
          <p className="form-sub">Tell us how you&apos;d like to be involved — it takes about a minute.</p>
          <div className="field-grid">
            <label>Full name *<input name="fullName" required minLength={2} maxLength={120} autoComplete="name" /></label>
            <label>Email address *<input name="email" type="email" required maxLength={254} autoComplete="email" /></label>
            <label>Phone or WhatsApp<input name="phone" maxLength={32} placeholder="+234…" autoComplete="tel" /></label>
            <label>Country or region *<input name="country" required minLength={2} maxLength={100} autoComplete="country-name" /></label>
            <label>I am joining as *
              <select name="audience" required defaultValue="">
                <option value="" disabled>Select one</option>
                <option value="individual">Individual user</option>
                <option value="healthcare">Healthcare professional</option>
                <option value="chw">Community health worker</option>
                <option value="institution">Government, NGO, or insurer</option>
                <option value="partner">Potential partner</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label>Main interest *
              <select name="interest" required defaultValue="">
                <option value="" disabled>Select one</option>
                <option value="early-access">Early access to the app</option>
                <option value="healthcare-partnership">Healthcare partnership</option>
                <option value="institutional-partnership">Institutional partnership</option>
                <option value="chw-programme">Community health worker programme</option>
                <option value="launch-updates">Product and launch updates</option>
              </select>
            </label>
            <label className="wide">Organization (optional)<input name="organization" maxLength={160} autoComplete="organization" /></label>
            <label>Preferred contact method
              <select name="preferredContact" defaultValue="email">
                <option value="email">Email</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="phone">Phone call</option>
              </select>
            </label>
            <label>Preferred language
              <select name="preferredLanguage" defaultValue="en">
                {languages.map(([code, label]) => <option key={code} value={code}>{label}</option>)}
              </select>
            </label>
            <label className="wide">What would you like Eukrasia to help with?
              <textarea name="message" maxLength={1000} rows={3} />
              <small>Please don&apos;t include health, ID, or payment details here.</small>
            </label>
            <label className="honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
            <label className="consent2 wide">
              <input name="consent" type="checkbox" required />
              <span>I agree that Eukrasia may store these contact details and reach out about launch updates, pilots, or partnerships. I can request deletion at any time.</span>
            </label>
          </div>
          <button className="submit-btn2" type="submit" disabled={status === "sending"}>
            {status === "sending" ? "Reserving your place…" : (<>Join Waitlist <Icon path="M5 12h14M13 6l6 6-6 6" size={16} /></>)}
          </button>
          {message && <p className={`form-message2 ${status}`} role="status">{message}</p>}
          <p className="privacy-note2"><Icon path={ICONS.lock} size={12} /> Your information is safe with us.</p>
        </form>
      </section>

      <section className="expect" id="expect">
        <div className="expect-head">
          <p className="eyebrow2">WHAT TO EXPECT</p>
          <h2>More than an app.<br /><em>A companion for everyday health.</em></h2>
        </div>
        <div className="expect-grid">
          <div className="expect-card"><span className="expect-icon"><Icon path={ICONS.stethoscope} /></span><h3>Personalised health guidance</h3><p>Prepare with confidence and make informed decisions.</p></div>
          <div className="expect-card"><span className="expect-icon"><Icon path={ICONS.clipboard} /></span><h3>Everyday health tools</h3><p>Checklists, reminders, and resources in one place.</p></div>
          <div className="expect-card"><span className="expect-icon"><Icon path={ICONS.mapPin} /></span><h3>Real-time support</h3><p>Get help when you need it, wherever you are.</p></div>
          <div className="expect-card"><span className="expect-icon"><Icon path={ICONS.pillShield} /></span><h3>Medication management</h3><p>Stay on track with your medicines and conditions.</p></div>
          <div className="expect-card"><span className="expect-icon"><Icon path={ICONS.users} /></span><h3>Built with you in mind</h3><p>Created for everyday people, everywhere.</p></div>
        </div>
      </section>

      <section className="cta-banner">
        <div className="cta-inner">
          <div className="cta-copy">
            <p className="cta-eyebrow">BE THE FIRST</p>
            <h2>Join the Eukrasia<br />waitlist <em>today.</em></h2>
            <p>Be among the first to experience a smarter, more supportive way to look after your health.</p>
            <a href="#join" className="cta-btn">Join Waitlist <Icon path="M5 12h14M13 6l6 6-6 6" size={16} /></a>
            <p className="cta-note"><Icon path={ICONS.lock} size={12} /> No spam. Just updates on our launch.</p>
          </div>
          <div className="cta-visual">
            <div className="phone-mock">
              <span className="phone-mark" />
              <strong>Eukrasia</strong>
              <small>YOUR HEALTH COMPANION</small>
            </div>
            <p className="cta-side-note">Prepare.<br />Stay informed.<br />Live well.</p>
          </div>
        </div>
      </section>

      <footer className="site-footer2">
        <Brand />
        <div className="footer-mid"><p>Your Health Companion</p></div>
        <div className="footer-right">
          <span>Follow our journey</span>
          <div className="footer-social">
            <a href="#" aria-label="Instagram"><Icon path="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5ZM12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7ZM17 6.5h.01" size={14} /></a>
            <a href="#" aria-label="X"><Icon path="M4 4l16 16M20 4 4 20" size={14} /></a>
            <a href="#" aria-label="Telegram"><Icon path="M21 3 3 10.5l6.5 2.2M21 3 14.8 21l-5.3-8.3M21 3 9.5 12.7" size={14} /></a>
          </div>
        </div>
      </footer>
    </main>
  );
}