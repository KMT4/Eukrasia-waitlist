"use client";

import Link from "next/link";
import { FormEvent, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { authClient } from "@/lib/auth/client";
import "./admin.css";

type Entry = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  country_name: string;
  audience: string;
  organization_name: string;
  journey_interest: string;
  preferred_contact: string;
  preferred_language: string;
  message: string;
  source: string;
  consent_version: string;
  consented_at: string;
  status: string;
  internal_note: string;
  last_contacted_at: string | null;
  created_at: string;
  updated_at: string;
};

type ActivityUpdate = {
  id: string;
  entry_id: string | null;
  actor_email: string;
  event_type: "joined" | "updated" | "deleted" | "exported";
  details: {
    from_status?: string;
    to_status?: string;
    previous_status?: string;
    status_changed?: boolean;
    note_changed?: boolean;
    record_count?: number;
    format?: string;
    full_name?: string;
  };
  created_at: string;
};

type IconName = "grid" | "people" | "activity" | "download" | "search" | "shield" | "globe" | "spark" | "logout" | "arrow" | "mail" | "clock";

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></>,
    people: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
    activity: <path d="M3 12h4l3-8 4 16 3-8h4"/>,
    download: <><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></>,
    globe: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/></>,
    spark: <path d="m12 3 1.4 4.1L17.5 8.5l-4.1 1.4L12 14l-1.4-4.1-4.1-1.4 4.1-1.4L12 3Zm6 10 .8 2.2L21 16l-2.2.8L18 19l-.8-2.2L15 16l2.2-.8L18 13Z"/>,
    logout: <><path d="M10 17l5-5-5-5M15 12H3"/><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/></>,
    arrow: <><path d="m9 18 6-6-6-6"/></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

function Brand() {
  return <div className="admin-brand"><span className="admin-brand-mark">E</span><span><strong>Eukrasia</strong><small>WAITLIST OPERATIONS</small></span></div>;
}

const statusOptions = ["new", "contacted", "qualified", "invited", "archived"];
const titleCase = (value: string) => value ? value.charAt(0).toUpperCase() + value.slice(1) : "—";

function activityDescription(update: ActivityUpdate, entries: Entry[]) {
  if (update.event_type === "joined") {
    const entry = entries.find((item) => item.id === update.entry_id);
    return `${entry?.full_name ?? "A new person"} joined the Eukrasia waitlist.`;
  }
  if (update.event_type === "exported") {
    const format = update.details.format === "xlsx" ? "an Excel workbook" : "CSV";
    return `Exported ${update.details.record_count ?? 0} waitlist records as ${format}.`;
  }

  const entry = entries.find((item) => item.id === update.entry_id);
  const subject = entry?.full_name ?? update.details.full_name ?? `Record ${update.entry_id?.slice(0, 8) ?? "unknown"}`;
  if (update.event_type === "deleted") {
    return `${subject} was permanently deleted from the waitlist.`;
  }

  const changes = [
    update.details.status_changed && `status changed from ${titleCase(update.details.from_status ?? "")} to ${titleCase(update.details.to_status ?? "")}`,
    update.details.note_changed && "private note updated",
  ].filter(Boolean);
  return `${subject}: ${changes.join("; ") || "record reviewed with no changes"}.`;
}

function preferredContact(entry: Entry) {
  const phone = entry.phone.replace(/\D/g, "");
  if (entry.preferred_contact === "whatsapp" && phone) {
    const text = encodeURIComponent(`Hello ${entry.full_name}, I'm reaching out from Eukrasia about your waitlist registration.`);
    return { href: `https://wa.me/${phone}?text=${text}`, label: "Message on WhatsApp", shortLabel: "WhatsApp", external: true };
  }
  if (entry.preferred_contact === "phone" && phone) {
    return { href: `tel:${phone}`, label: `Call ${entry.full_name}`, shortLabel: "Call", external: false };
  }
  return { href: `mailto:${encodeURIComponent(entry.email)}`, label: `Email ${entry.full_name}`, shortLabel: "Email", external: false };
}

function ContactAction({ entry }: { entry: Entry }) {
  const contact = preferredContact(entry);
  return <a className="contact-action" href={contact.href} aria-label={contact.label} target={contact.external ? "_blank" : undefined} rel={contact.external ? "noreferrer" : undefined}>
    <Icon name={contact.shortLabel === "Email" ? "mail" : "arrow"} size={15} />
    <span>{contact.shortLabel}</span>
  </a>;
}

function jumpToSection(id: "overview" | "registrations" | "activity") {
  const target = document.getElementById(id);
  if (!target) return;
  const top = window.scrollY + target.getBoundingClientRect().top - 96;
  window.scrollTo({
    top: Math.max(0, top),
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
  });
  window.history.replaceState(null, "", `#${id}`);
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [mode, setMode] = useState<"signin" | "activate">("signin");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [updates, setUpdates] = useState<ActivityUpdate[]>([]);
  const [activityFilter, setActivityFilter] = useState<"all" | "joined" | "exported" | "updated" | "deleted">("all");
  const [activeSection, setActiveSection] = useState<"overview" | "registrations" | "activity">("overview");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [savingEntryId, setSavingEntryId] = useState<string | null>(null);
  const [deletingEntryId, setDeletingEntryId] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/entries", { cache: "no-store" });
      if (response.status === 401) { setAuthenticated(false); return; }
      const data = (await response.json()) as { entries?: Entry[]; updates?: ActivityUpdate[]; error?: string };
      if (!response.ok) { setError(data.error ?? "Could not load the waitlist."); setAuthenticated(false); return; }
      setEntries(data.entries ?? []);
      setUpdates(data.updates ?? []);
      setAuthenticated(true);
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
      setAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  useEffect(() => {
    function focusSearch(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", focusSearch);
    return () => window.removeEventListener("keydown", focusSearch);
  }, []);

  const filteredEntries = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return entries.filter((entry) => {
      const matchesStatus = statusFilter === "all" || entry.status === statusFilter;
      const searchable = [
        entry.full_name, entry.email, entry.phone, entry.country_name, entry.organization_name,
        entry.audience, entry.journey_interest, entry.preferred_contact, entry.preferred_language,
        entry.message, entry.internal_note, entry.source, entry.status,
      ].join(" ").toLowerCase();
      return matchesStatus && (!needle || searchable.includes(needle));
    });
  }, [entries, query, statusFilter]);

  const counts = useMemo(() => ({
    new: entries.filter((entry) => entry.status === "new").length,
    contacted: entries.filter((entry) => entry.status === "contacted").length,
    qualified: entries.filter((entry) => entry.status === "qualified" || entry.status === "invited").length,
    countries: new Set(entries.map((entry) => entry.country_name).filter(Boolean)).size,
  }), [entries]);

  const visibleUpdates = activityFilter === "all" ? updates : updates.filter((update) => update.event_type === activityFilter);
  const activityCounts = {
    all: updates.length,
    joined: updates.filter((update) => update.event_type === "joined").length,
    exported: updates.filter((update) => update.event_type === "exported").length,
    updated: updates.filter((update) => update.event_type === "updated").length,
    deleted: updates.filter((update) => update.event_type === "deleted").length,
  };

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(""); setNotice(""); setSubmitting(true);
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    const email = String(values.email ?? "").trim().toLowerCase();
    const password = String(values.password ?? "");
    try {
      const result = mode === "activate"
        ? await authClient.signUp.email({ email, password, name: "Eukrasia Admin" })
        : await authClient.signIn.email({ email, password });
      if (result.error) { setError(result.error.message || "Sign-in failed."); return; }
      if (mode === "activate") {
        setNotice("Admin access activated. You can now sign in.");
        setMode("signin");
      }
      await load();
    } catch {
      setError(mode === "activate"
        ? "We couldn’t reach the sign-in service. Check your connection and try again."
        : "We couldn’t sign you in. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function downloadSpreadsheet() {
    setError("");
    setNotice("");
    setExporting(true);
    try {
      const response = await fetch("/api/admin/entries?format=xlsx", { cache: "no-store" });
      if (response.status === 401) {
        setAuthenticated(false);
        throw new Error("Your session has expired. Sign in again to export the waitlist.");
      }
      if (!response.ok) {
        const result = await response.json().catch(() => ({})) as { error?: string };
        throw new Error(result.error ?? "The Excel workbook could not be created. Please try again.");
      }

      const blob = await response.blob();
      const disposition = response.headers.get("content-disposition") ?? "";
      const filename = disposition.match(/filename="?([^";]+)"?/i)?.[1] ?? "eukrasia-waitlist.xlsx";
      const auditRecorded = response.headers.get("x-eukrasia-audit") === "recorded";
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      setNotice(`${entries.length} waitlist ${entries.length === 1 ? "record" : "records"} downloaded as a formatted Excel workbook.`);
      if (!auditRecorded) {
        setError("The workbook downloaded, but its export could not be recorded in the activity history.");
      } else {
        await load();
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The Excel workbook could not be downloaded. Please try again.");
    } finally {
      setExporting(false);
    }
  }

  async function update(entry: Entry) {
    setError(""); setNotice("");
    setSavingEntryId(entry.id);
    try {
      const response = await fetch("/api/admin/entries", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: entry.id, status: entry.status, internalNote: entry.internal_note }) });
      const data = (await response.json()) as { entry?: Entry; update?: ActivityUpdate; error?: string };
      if (!response.ok || !data.entry || !data.update) {
        setError(data.error ?? "The record could not be updated.");
        return;
      }
      setEntries((items) => items.map((item) => item.id === data.entry?.id ? data.entry : item));
      setUpdates((items) => [data.update as ActivityUpdate, ...items].slice(0, 100));
      setNotice(`${entry.full_name}'s changes were saved and recorded as an update.`);
    } catch {
      setError("We couldn’t reach the server. Your changes have not been saved.");
    } finally {
      setSavingEntryId(null);
    }
  }

  async function remove(entry: Entry) {
    if (!window.confirm(`Permanently delete ${entry.full_name} from the waitlist?`)) return;
    setError(""); setNotice("");
    setDeletingEntryId(entry.id);
    try {
      const response = await fetch("/api/admin/entries", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: entry.id, confirmation: "DELETE" }) });
      const data = (await response.json()) as { update?: ActivityUpdate; error?: string };
      if (!response.ok || !data.update) {
        setError(data.error ?? "The record could not be deleted.");
        return;
      }
      setEntries((items) => items.filter((item) => item.id !== entry.id));
      setUpdates((items) => [data.update as ActivityUpdate, ...items].slice(0, 100));
      setNotice(`${entry.full_name}'s deletion was saved in the activity history.`);
    } catch {
      setError("We couldn’t reach the server. The record may still be in the waitlist.");
    } finally {
      setDeletingEntryId(null);
    }
  }

  if (authenticated === null) return <main className="admin-shell"><div className="admin-loading"><span className="admin-brand-mark">E</span><strong>Eukrasia</strong><span>WAITLIST OPERATIONS</span><div className="loading-bar"><i /></div><p>Securing your workspace…</p></div></main>;

  if (!authenticated) return <main className="admin-auth-page">
    <section className="auth-showcase">
      <div className="auth-grid" />
      <div className="auth-orb auth-orb-one" /><div className="auth-orb auth-orb-two" />
      <Brand />
      <div className="auth-showcase-copy">
        <p className="auth-eyebrow"><span />Private team workspace</p>
        <h1>Turn early interest into <em>meaningful care.</em></h1>
        <p>One calm command centre for every person, partner and organisation ready to shape Eukrasia.</p>
        <div className="auth-proof-grid">
          <article><span><Icon name="shield" /></span><div><strong>Protected by Neon</strong><small>Approved-team access only</small></div></article>
          <article><span><Icon name="globe" /></span><div><strong>Global-ready</strong><small>Languages and regions captured</small></div></article>
          <article><span><Icon name="activity" /></span><div><strong>Built for action</strong><small>Track every follow-up clearly</small></div></article>
        </div>
      </div>
      <p className="auth-showcase-foot">EUKRASIA • HEALTHCARE INTELLIGENCE</p>
    </section>
    <section className="auth-form-panel">
      <div className="login-card">
        <Link href="/" className="back-link">← Return to waitlist</Link>
        <div className="mobile-auth-brand"><Brand /></div>
        <p className="form-kicker">Secure access</p>
        <h2>{mode === "signin" ? "Welcome back" : "Activate admin access"}</h2>
        <p>{mode === "signin" ? "Sign in to manage registrations, conversations and team-ready records." : "Create the protected administrator account using your approved team email."}</p>
        <div className="auth-tabs"><button type="button" className={mode === "signin" ? "active" : ""} onClick={() => { setMode("signin"); setError(""); setNotice(""); }}>Sign in</button><button type="button" className={mode === "activate" ? "active" : ""} onClick={() => { setMode("activate"); setError(""); setNotice(""); }}>First-time activation</button></div>
        <form onSubmit={login}>
          <label>Email address<div className="input-with-icon"><Icon name="mail" size={16} /><input name="email" type="email" required autoComplete="username" placeholder="Enter your approved admin email" /></div></label>
          <label>{mode === "activate" ? "Create password" : "Password"}<input name="password" type="password" minLength={mode === "activate" ? 12 : undefined} maxLength={128} required autoComplete={mode === "activate" ? "new-password" : "current-password"} placeholder="Enter your secure password" />{mode === "activate" && <small>Use 12–128 characters with uppercase, lowercase, a number and a symbol. Your password goes securely to Neon.</small>}</label>
          <button className="primary-button" disabled={submitting}>{submitting ? "Securing access…" : mode === "signin" ? "Enter workspace" : "Activate secure access"}<Icon name="arrow" size={17} /></button>
        </form>
        {notice && <p className="form-message success">{notice}</p>}{error && <p className="form-message error">{error}</p>}
        <div className="login-trust"><Icon name="shield" size={14} />Encrypted access • Admin activity is recorded</div>
      </div>
    </section>
  </main>;

  return <main className="admin-app">
    <aside className="admin-sidebar">
      <Brand />
      <nav aria-label="Admin navigation">
        <p>Workspace</p>
        <a className={activeSection === "overview" ? "active" : ""} href="#overview" onClick={(event) => { event.preventDefault(); setActiveSection("overview"); jumpToSection("overview"); }}><Icon name="grid" />Overview</a>
        <a className={activeSection === "registrations" ? "active" : ""} href="#registrations" onClick={(event) => { event.preventDefault(); setActiveSection("registrations"); jumpToSection("registrations"); }}><Icon name="people" />Registrations <span>{entries.length}</span></a>
        <a className={activeSection === "activity" ? "active" : ""} href="#activity" onClick={(event) => { event.preventDefault(); setActiveSection("activity"); jumpToSection("activity"); }}><Icon name="activity" />Activity <span>{updates.length}</span></a>
        <p>Actions</p>
        <button className="sidebar-export" type="button" onClick={() => void downloadSpreadsheet()} disabled={exporting}><Icon name="download" />{exporting ? "Preparing workbook…" : "Export spreadsheet"}</button>
      </nav>
      <div className="sidebar-security"><span><Icon name="shield" size={17} /></span><strong>Workspace protected</strong><small>Neon Auth + encrypted data</small></div>
      <Link href="/" className="sidebar-return">Visit public waitlist <Icon name="arrow" size={15} /></Link>
    </aside>

    <section className="admin-main">
      <header className="admin-topbar">
        <div><p>Operations dashboard</p><h1>Good to see you, Team.</h1></div>
        <div className="topbar-actions"><span className="live-badge"><i />Live</span><button className="signout-button" type="button" onClick={async () => { try { await authClient.signOut(); setAuthenticated(false); } catch { setError("Sign out failed. Check your connection and try again."); } }}><Icon name="logout" size={16} /><span>Sign out</span></button></div>
      </header>

      <div className="admin-content" id="overview">
        <section className="welcome-banner">
          <div><span className="banner-kicker"><Icon name="spark" size={15} />Eukrasia early access</span><h2>Your community is taking shape.</h2><p>Track every registration, identify promising partners and keep follow-ups moving.</p></div>
          <div className="banner-visual"><div><strong>{entries.length}</strong><span>people waiting</span></div><i /><i /><i /></div>
        </section>

        <section className="metric-grid" aria-label="Waitlist summary">
          <article><span className="metric-icon blue"><Icon name="people" /></span><div><small>Total registrations</small><strong>{entries.length}</strong><p>All captured contacts</p></div></article>
          <article><span className="metric-icon cyan"><Icon name="spark" /></span><div><small>New leads</small><strong>{counts.new}</strong><p>Ready for review</p></div></article>
          <article><span className="metric-icon violet"><Icon name="activity" /></span><div><small>Progressing</small><strong>{counts.contacted + counts.qualified}</strong><p>Contacted or qualified</p></div></article>
          <article><span className="metric-icon gold"><Icon name="globe" /></span><div><small>Countries</small><strong>{counts.countries}</strong><p>Global community reach</p></div></article>
        </section>

        <section className="records-panel" id="registrations">
          <div className="records-heading"><div><p className="form-kicker">Community directory</p><h2>Waitlist registrations</h2><span>{filteredEntries.length} of {entries.length} records</span></div><button className="export-button" type="button" onClick={() => void downloadSpreadsheet()} disabled={exporting}><Icon name="download" size={16} />{exporting ? "Preparing workbook…" : "Download Excel"}</button></div>
          <div className="records-toolbar">
            <label className="admin-search"><Icon name="search" size={17} /><input ref={searchInputRef} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search names, email, phone, notes, interests…" /><kbd>Ctrl K</kbd></label>
            <label className="filter-select"><span>Status</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">All statuses</option>{statusOptions.map((status) => <option value={status} key={status}>{titleCase(status)}</option>)}</select></label>
          </div>
          {notice && <p className="dashboard-notice success">{notice}</p>}{error && <p className="dashboard-notice error">{error}</p>}

          <div className="entry-list" id="pipeline">{filteredEntries.length === 0 ? <div className="admin-empty-state">
            <div className="empty-illustration"><span><Icon name="people" size={26} /></span><i /><i /><i /></div>
            <p className="form-kicker">Ready for your community</p>
            <h3>{entries.length === 0 ? "The command centre is ready" : "No registrations match that filter"}</h3>
            <p>{entries.length === 0 ? "As people join the waitlist, their contact preferences and interests will appear here automatically." : "Try another search term or switch the status filter to see more records."}</p>
            {entries.length === 0 && <div className="empty-steps"><span><b>1</b>Share the public waitlist</span><span><b>2</b>Review new registrations</span><span><b>3</b>Export or follow up</span></div>}
            {entries.length > 0 && <button onClick={() => { setQuery(""); setStatusFilter("all"); }}>Clear filters</button>}
          </div> : filteredEntries.map((entry, index) => <article className="entry-card" key={entry.id}>
            <div className="entry-number">{String(index + 1).padStart(2, "0")}</div>
            <div className="entry-main">
              <div className="entry-title"><div><span className={`status-pill status-${entry.status}`}>{titleCase(entry.status)}</span><h3>{entry.full_name}</h3><a href={`mailto:${entry.email}`}>{entry.email}</a></div><time><Icon name="clock" size={14} />{new Date(entry.created_at).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}</time><ContactAction entry={entry} /></div>
              <dl><div><dt>Country</dt><dd>{entry.country_name || "—"}</dd></div><div><dt>Audience</dt><dd>{titleCase(entry.audience)}</dd></div><div><dt>Interest</dt><dd>{titleCase(entry.journey_interest)}</dd></div><div><dt>Preferred contact</dt><dd>{titleCase(entry.preferred_contact)}{entry.phone ? ` · ${entry.phone}` : ""}</dd></div></dl>
              {entry.organization_name && <p><strong>Organisation</strong>{entry.organization_name}</p>}{entry.message && <blockquote>&ldquo;{entry.message}&rdquo;</blockquote>}
              <div className="manage-row"><label>Status<select value={entry.status} onChange={(event) => setEntries((items) => items.map((item) => item.id === entry.id ? { ...item, status: event.target.value } : item))}>{statusOptions.map((status) => <option value={status} key={status}>{titleCase(status)}</option>)}</select></label><label>Internal note<input value={entry.internal_note} maxLength={2000} placeholder="Add a private follow-up note…" onChange={(event) => setEntries((items) => items.map((item) => item.id === entry.id ? { ...item, internal_note: event.target.value } : item))} /></label><button className="save-record" type="button" disabled={savingEntryId === entry.id || deletingEntryId === entry.id} onClick={() => void update(entry)}>{savingEntryId === entry.id ? "Saving changes…" : "Save changes"}</button><button className="danger" type="button" disabled={savingEntryId === entry.id || deletingEntryId === entry.id} onClick={() => void remove(entry)}>{deletingEntryId === entry.id ? "Deleting…" : "Delete"}</button></div>
            </div>
          </article>)}</div>
        </section>

        <section className="activity-panel" id="activity">
          <div className="activity-heading">
            <div>
              <p className="form-kicker">Workspace timeline</p>
              <h2>Activity log</h2>
              <span>Waitlist joins, record changes, deletions and spreadsheet exports saved in Neon.</span>
            </div>
            <div className="activity-heading-actions"><span className="activity-count"><Icon name="activity" size={16} />{updates.length} events loaded</span><button className="activity-refresh" type="button" onClick={() => void load()}><Icon name="activity" size={15} />Refresh</button></div>
          </div>
          <div className="activity-filters" aria-label="Filter activity">
            {(["all", "joined", "updated", "deleted", "exported"] as const).map((filter) => <button type="button" key={filter} className={activityFilter === filter ? "selected" : ""} onClick={() => setActivityFilter(filter)}>{titleCase(filter === "all" ? "all activity" : filter)}<span>{activityCounts[filter]}</span></button>)}
          </div>
          {updates.length === 0 ? (
            <div className="activity-empty"><Icon name="shield" /><p>Nothing has been recorded yet. New waitlist joins and admin actions will appear here.</p></div>
          ) : visibleUpdates.length === 0 ? (
            <div className="activity-empty"><Icon name="activity" /><p>No {activityFilter} events in the latest 100 records.</p></div>
          ) : (
            <ol className="activity-list">
              {visibleUpdates.map((update) => (
                <li key={update.id}>
                  <span className={`activity-icon activity-${update.event_type}`}>
                    <Icon name={update.event_type === "exported" ? "download" : update.event_type === "deleted" || update.event_type === "joined" ? "people" : "activity"} size={16} />
                  </span>
                  <div>
                    <strong>{update.event_type === "joined" ? "Waitlist joined" : update.event_type === "exported" ? `${(update.details.format ?? "file").toUpperCase()} export` : update.event_type === "deleted" ? "Registration deleted" : "Registration updated"}</strong>
                    <p>{activityDescription(update, entries)}</p>
                    <small>{update.actor_email} · {new Date(update.created_at).toLocaleString()}</small>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>
        <footer className="admin-footer"><span>© {new Date().getFullYear()} Eukrasia AI</span><span><i />Systems operational</span><span>Private team workspace</span></footer>
      </div>
    </section>
  </main>;
}
