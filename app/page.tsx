"use client";

import { FormEvent, useState } from "react";

const languages = [
  ["en", "English"], ["ar", "العربية"], ["fr", "Français"], ["ha", "Hausa"],
  ["yo", "Yorùbá"], ["ur", "اردو"], ["bn", "বাংলা"], ["id", "Bahasa Indonesia"],
];

function Brand() {
  return (
    <span className="brand">
      <span className="brand-mark" aria-hidden="true"><i /><b>+</b></span>
      <span><strong>Eukrasia</strong><small>HAJJ HEALTH</small></span>
    </span>
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
    setMessage("You’re on the list. We’ll be in touch as Eukrasia prepares for launch.");
    form.reset();
  }

  return (
    <main id="top">
      <section className="hero">
        <div className="orb orb-one" /><div className="orb orb-two" /><div className="grid-lines" />
        <header className="topbar">
          <a href="#top" aria-label="Eukrasia home"><Brand /></a>
          <nav aria-label="Primary navigation">
            <a className="team-link" href="/admin">Team login</a>
            <a className="outline-button" href="#join">Reserve your place <span>↗</span></a>
          </nav>
        </header>

        <div className="hero-layout">
          <div className="hero-copy">
            <p className="eyebrow"><span /> Early access is opening</p>
            <h1>Safer journeys.<br /><em>Clearer next steps.</em></h1>
            <p className="lead">Eukrasia brings multilingual health guidance, journey coordination, and responsible human escalation into one calm companion for Hajj and Umrah.</p>
            <div className="global-row">
              <div className="language-dots"><span>A</span><span>ع</span><span>Ẹ</span><span>+</span></div>
              <p><strong>Built for a global Ummah</strong><small>Pilgrims · Operators · Healthcare teams</small></p>
            </div>
          </div>

          <form className="waitlist-card" id="join" onSubmit={submit}>
            <div className="form-heading">
              <div><p className="form-kicker">Reserve your place</p><h2>Join the waitlist</h2></div>
              <label className="language-label">Preferred language
                <select name="preferredLanguage" defaultValue="en">{languages.map(([code, label]) => <option key={code} value={code}>{label}</option>)}</select>
              </label>
            </div>
            <p className="form-intro">Tell us how you’d like to be involved. It takes about one minute.</p>
            <div className="form-grid">
              <label>Full name *<input name="fullName" required minLength={2} maxLength={120} autoComplete="name" /></label>
              <label>Email address *<input name="email" type="email" required maxLength={254} autoComplete="email" /></label>
              <label>Phone or WhatsApp<input name="phone" maxLength={32} placeholder="+234…" autoComplete="tel" /></label>
              <label>Country or region *<input name="country" required minLength={2} maxLength={100} autoComplete="country-name" /></label>
              <label>I am joining as *<select name="audience" required defaultValue=""><option value="" disabled>Select one</option><option value="pilgrim">Pilgrim</option><option value="operator">Hajj or Umrah operator</option><option value="healthcare">Healthcare professional</option><option value="partner">Potential partner</option><option value="caregiver">Family or caregiver</option><option value="other">Other</option></select></label>
              <label>Main interest *<select name="interest" required defaultValue=""><option value="" disabled>Select one</option><option value="hajj">Preparing for Hajj</option><option value="umrah">Preparing for Umrah</option><option value="operator-pilot">Operator pilot programme</option><option value="healthcare-partnership">Healthcare partnership</option><option value="launch-updates">Product and launch updates</option></select></label>
              <label className="wide">Organization (optional)<input name="organization" maxLength={160} autoComplete="organization" /></label>
              <label className="wide">Preferred way to contact you<select name="preferredContact" defaultValue="email"><option value="email">Email</option><option value="whatsapp">WhatsApp</option><option value="phone">Phone call</option></select></label>
              <label className="wide">What would you like Eukrasia to help with?<textarea name="message" maxLength={1000} rows={4} /><small>Do not include health, passport, payment, or other sensitive information.</small></label>
              <label className="honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
              <label className="consent wide"><input name="consent" type="checkbox" required /><span>I agree that Eukrasia may store these contact details and contact me about launch updates, pilots, or partnerships. I can request deletion at any time.</span></label>
            </div>
            <button className="primary-button" type="submit" disabled={status === "sending"}>{status === "sending" ? "Reserving your place…" : "↗  Join the waitlist"}</button>
            {message && <p className={`form-message ${status}`} role="status">{message}</p>}
            <p className="privacy-note">◆ &nbsp;Your contact details are protected and never displayed publicly.</p>
          </form>
        </div>
      </section>

      <section className="benefits" aria-label="Why join Eukrasia early">
        {[ ["01","Privacy-conscious","Only practical contact details—never medical records."], ["02","Globally accessible","A multilingual experience designed for pilgrims everywhere."], ["03","Built together","Early members help shape pilots, partnerships and launch priorities."] ].map(([number,title,copy]) => <article key={number}><span>{number}</span><div><h2>{title}</h2><p>{copy}</p></div></article>)}
      </section>

      <section className="closing">
        <p className="form-kicker">One connected safety layer</p>
        <h2>Prepared before departure.<br />Supported through every step.</h2>
        <p>Join the people helping us make pilgrim support easier to understand, more culturally aware, and better connected when human help matters.</p>
        <a className="primary-button closing-button" href="#join">Join the waitlist →</a>
      </section>

      <footer><a href="#top"><Brand /></a><p>Health guidance, not medical diagnosis. For emergencies, contact local services.</p><div><a href="/admin">Team login</a><span>© 2026 Eukrasia</span></div></footer>
    </main>
  );
}
