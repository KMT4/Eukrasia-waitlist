"use client";

import { FormEvent, useState } from "react";

const iconPaths = {
  heart: "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z",
  arrow: "M5 12h14M13 6l6 6-6 6",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z M9 12l2 2 4-4",
  pulse: "M3 12h4l3-8 4 16 3-8h4",
  people: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M22 21v-2a4 4 0 0 0-3-3.9 M16 3.1a4 4 0 0 1 0 7.8",
  clock: "M12 8v4l3 2 M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  lock: "M6 11V8a6 6 0 0 1 12 0v3 M5 11h14v10H5z M12 15v2",
  check: "m5 12 4 4L19 6",
  globe: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z M2 12h20 M12 2a15 15 0 0 1 0 20 M12 2a15 15 0 0 0 0 20",
  phone: "M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8 8.9a16 16 0 0 0 6 6l1.2-1.3a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.8 2.1Z",
} as const;

function Icon({ name, size = 18 }: { name: keyof typeof iconPaths; size?: number }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d={iconPaths[name]} />
    </svg>
  );
}

function Brand() {
  return (
    <a href="#top" className="brand2" aria-label="Eukrasia home">
      <span className="brand2-mark"><Icon name="heart" size={19} /></span>
      <span><strong>Eukrasia</strong><small>HEALTH HELPER CHATBOT</small></span>
    </a>
  );
}

function CarePreview() {
  return (
    <div className="care-preview journal-sheet" aria-label="Illustrative example of keeping a health timeline">
      <div className="journal-topline"><span>EU / HEALTH HELPER CONCEPT</span><span>ILLUSTRATION · NOT A REAL CHAT</span></div>
      <div className="journal-date"><span>A QUESTION TO START WITH</span><strong>Everyday health,<br />a little clearer.</strong><p>Eukrasia is taking shape as a general health helper chatbot.</p></div>
      <div className="journal-thread">
        <article><span className="thread-marker"><Icon name="pulse" size={14} /></span><div><small>ASK</small><p>Start with a health question.</p></div></article>
        <article><span className="thread-marker"><Icon name="clock" size={14} /></span><div><small>EXPLORE</small><p>Find a useful place to begin.</p></div></article>
        <article><span className="thread-marker thread-marker-last"><Icon name="people" size={14} /></span><div><small>KEEP CARE IN VIEW</small><p>Professional care still matters.</p></div></article>
      </div>
      <div className="journal-foot"><span><Icon name="lock" size={13} /> YOUR NOTES, YOUR CHOICE</span><span>01 / 03</span></div>
    </div>
  );
}

export default function WaitlistPage() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [formProgress, setFormProgress] = useState(0);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setMessage("");
    const form = event.currentTarget;
    const data = new FormData(form);

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...Object.fromEntries(data.entries()), consent: data.get("consent") === "on" }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setStatus("error");
        setMessage(result.error ?? "We could not save your place. Please try again.");
        return;
      }
      setStatus("success");
      setMessage("You’re on the list. We’ll be in touch as Eukrasia gets ready to launch.");
      form.reset();
      setFormProgress(0);
    } catch {
      setStatus("error");
      setMessage("We couldn’t reach the server. Check your connection and try again.");
    }
  }

  return (
    <main id="top" className="eukrasia-site">
      <header className="site-header">
        <Brand />
        <nav className="nav-links" aria-label="Primary navigation">
          <a href="#care">Our approach</a>
          <a href="#questions">Questions</a>
          <a className="nav-team" href="/admin">Team login <span aria-hidden="true">↗</span></a>
        </nav>
      </header>

      <section className="hero2 journal-hero" aria-labelledby="hero-title">
        <div className="hero-copy2">
          <p className="eyebrow2"><span className="eyebrow-dot" />A GENERAL HEALTH HELPER CHATBOT IN DEVELOPMENT</p>
          <h1 id="hero-title">Health questions,<br /><em>meet a helper.</em></h1>
          <p className="lede2">Eukrasia is being developed as a general health helper chatbot. We’re shaping what it can be useful for and inviting people to help inform that direction.</p>
          <div className="hero-actions">
            <a className="primary-link" href="#join">Join the waitlist <Icon name="arrow" size={16} /></a>
            <a className="text-link" href="#care">See what we’re exploring <span aria-hidden="true">↓</span></a>
          </div>
          <div className="trust-row" aria-label="Eukrasia principles">
            <div className="trust-item"><Icon name="shield" size={17} /><span>Care with your consent</span></div>
            <div className="trust-item"><Icon name="globe" size={17} /><span>Everyday health questions</span></div>
            <div className="trust-item"><Icon name="people" size={17} /><span>Built around people</span></div>
          </div>
        </div>
        <div className="hero-visual"><CarePreview /></div>
      </section>

      <section className="care-section journal-section" id="care">
        <div className="journal-section-intro">
          <p className="eyebrow2"><span className="eyebrow-dot" />A HELPER FOR EVERYDAY HEALTH</p>
          <h2>A thoughtful place<br /><em>to start asking.</em></h2>
          <p>Health questions can be hard to know where to begin with. Eukrasia is being shaped as a general health helper chatbot, and we’re listening to what people would want from one.</p>
          <p className="care-disclaimer"><Icon name="shield" size={15} /> Eukrasia is in development—not a diagnosis or a replacement for professional care.</p>
        </div>
        <div className="care-thread-list">
          <article><span className="thread-number">01</span><span className="thread-rule" /><div><small>THE QUESTION</small><h3>Begin with what you want to understand.</h3><p>We’re exploring how a chatbot could help people get started with general health questions.</p></div></article>
          <article><span className="thread-number">02</span><span className="thread-rule" /><div><small>THE EXPERIENCE</small><h3>Make health information easier to approach.</h3><p>The exact topics and capabilities are still being shaped with the people who may use Eukrasia.</p></div></article>
          <article><span className="thread-number">03</span><span className="thread-rule" /><div><small>THE BOUNDARY</small><h3>Keep qualified care in the picture.</h3><p>Eukrasia is not a diagnosis, an emergency service or a substitute for professional care.</p></div></article>
        </div>
      </section>

      <section className="faq-section" id="questions" aria-labelledby="faq-title">
        <div className="faq-intro">
          <p className="eyebrow2"><span className="eyebrow-dot" />A FEW THINGS WORTH KNOWING</p>
          <h2 id="faq-title">Clear answers,<br /><em>before you join.</em></h2>
          <p>Eukrasia is still taking shape. Here’s what we can tell you now—and what we’re still learning with the people who may use it.</p>
          <a className="text-link" href="#join">Ask to be kept in the loop <span aria-hidden="true">↓</span></a>
        </div>
        <div className="faq-list">
          <details open>
            <summary><span>What is Eukrasia?</span><i aria-hidden="true" /></summary>
            <p>Eukrasia is a general health helper chatbot in development. Its specific capabilities are still being shaped, so we’re inviting people to join the waitlist and help inform what it becomes.</p>
          </details>
          <details>
            <summary><span>Who is Eukrasia for?</span><i aria-hidden="true" /></summary>
            <p>The waitlist is open to individuals, healthcare professionals, organisations and potential partners. We want to learn what would make a general health helper useful and responsible for the people it serves.</p>
          </details>
          <details>
            <summary><span>Will Eukrasia diagnose or replace a clinician?</span><i aria-hidden="true" /></summary>
            <p>No. Eukrasia is not being presented as a diagnostic tool. It will not replace a qualified health professional or emergency care.</p>
          </details>
          <details>
            <summary><span>What will the chatbot be able to help with?</span><i aria-hidden="true" /></summary>
            <p>Its exact scope is still being worked out. We’re exploring how a general health helper chatbot could be useful, and we’ll share confirmed details as the product develops.</p>
          </details>
          <details>
            <summary><span>What should I include in the waitlist form?</span><i aria-hidden="true" /></summary>
            <p>Just your name, email and phone number. We’ll use them to share Eukrasia updates and reach you about early access.</p>
          </details>
          <details>
            <summary><span>When will Eukrasia be available?</span><i aria-hidden="true" /></summary>
            <p>Eukrasia is still in development, and no launch date has been announced. Join the waitlist for updates as plans become clearer.</p>
          </details>
        </div>
      </section>

      <section className="signup-section journal-signup" id="join">
        <div className="signup-intro">
          <p className="eyebrow2"><span className="eyebrow-dot" />THE NEXT CHAPTER STARTS HERE</p>
          <h2>Good care begins with being heard.</h2>
          <p className="signup-lede">We're building a calmer first step for everyday health questions. Add your details to be among the first to hear what's next.</p>
          <div className="signup-signal-card" aria-label="Eukrasia early list invitation">
            <div className="signal-orbit"><span className="signal-core"><Icon name="pulse" size={23} /></span><i /><i /><i /></div>
            <div className="signal-card-copy"><small>YOUR INVITATION TO</small><strong>A more thoughtful<br />health conversation.</strong><span>One small step. A clearer beginning.</span></div>
            <span className="signal-card-index">EU<br /><b>01</b></span>
            <div className="signal-card-base"><span><i /> EARLY LIST OPEN</span><span>YOUR DETAILS STAY PRIVATE</span></div>
          </div>
          <div className="signup-promise"><span><Icon name="lock" size={16} /></span><p><strong>Your details stay yours.</strong><br />We'll use them only for Eukrasia updates. You can ask us to delete them at any time.</p></div>
        </div>
        <form className={`waitlist-form ${status === "success" ? "is-success" : ""}`} onSubmit={submit} onChange={(event) => {
          const values = new FormData(event.currentTarget);
          const emailInput = event.currentTarget.elements.namedItem("email");
          const complete = [
            String(values.get("fullName") ?? "").trim().length >= 2,
            emailInput instanceof HTMLInputElement && emailInput.validity.valid,
            String(values.get("phone") ?? "").replace(/\D/g, "").length >= 7,
          ].filter(Boolean).length;
          setFormProgress(complete);
        }}>
          <div className="form-heading"><span>YOUR PLACE IN THE STORY</span><span className="form-step-readout">{String(formProgress).padStart(2, "0")} <i>/</i> 03 COMPLETE</span></div>
          <div className="signup-progress" aria-label={`${formProgress} of 3 signup details complete`}>
            {[0, 1, 2].map((step) => <span className={formProgress > step ? "complete" : ""} key={step}><i /></span>)}
            <small>{formProgress === 3 ? "YOU'RE ALL SET" : formProgress === 0 ? "THREE QUICK DETAILS" : "YOU'RE ON YOUR WAY"}</small>
          </div>
          <div className="field-grid waitlist-fields">
            <label className="signup-field signup-name"><span><i>01</i> Your name</span><input name="fullName" required minLength={2} maxLength={120} autoComplete="name" placeholder="How should we address you?" /><small>First name or full name, whatever feels right.</small></label>
            <label className="signup-field signup-email"><span><i>02</i> Email address</span><input name="email" type="email" required maxLength={254} autoComplete="email" placeholder="you@example.com" /><small>Where we'll send your Eukrasia updates.</small></label>
            <label className="signup-field signup-phone"><span><i>03</i> Phone number</span><div className="phone-input-wrap"><span className="phone-prefix"><Icon name="phone" size={17} /><i>+</i></span><input name="phone" type="tel" inputMode="tel" required minLength={7} maxLength={32} autoComplete="tel" placeholder="234 800 000 0000" /></div><small>Include your country code so we can reach you.</small></label>
            <label className="honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
            <label className="consent2 wide"><input name="consent" type="checkbox" required /><span>I agree that Eukrasia may store these contact details and reach out about early access, launch updates, pilots, or partnerships. I can request deletion at any time.</span></label>
          </div>
          <button className="submit-btn2" type="submit" disabled={status === "sending"}>
            {status === "sending" ? <><span className="button-spinner" /> Saving your place...</> : <>Save my place <Icon name="arrow" size={17} /></>}
          </button>
          {message && <p className={`form-message2 ${status}`} role="status"><span className="form-message-icon">{status === "success" ? <Icon name="check" size={17} /> : "!"}</span>{message}</p>}
          <p className="privacy-note2"><Icon name="lock" size={13} /> No spam. Just relevant Eukrasia updates.</p>
        </form>
      </section>

      <section className="closing-note">
        <span className="closing-mark"><Icon name="heart" size={22} /></span>
        <p>Good health is built one day at a time.</p>
        <span>We’re here to help make those days feel a little clearer.</span>
      </section>

      <footer className="site-footer2">
        <Brand />
        <p className="footer-mid">A thoughtful helper for everyday health questions.</p>
        <div className="footer-right"><a href="#care">Our approach</a><a href="#join">Join the waitlist</a><a href="/admin">Team login</a></div>
        <small className="footer-legal">© {new Date().getFullYear()} Eukrasia. Eukrasia does not provide emergency or professional medical care.</small>
      </footer>
    </main>
  );
}
