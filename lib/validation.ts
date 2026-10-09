export const WAITLIST_STATUSES = ["new", "contacted", "qualified", "invited", "archived"] as const;
export type WaitlistStatus = (typeof WAITLIST_STATUSES)[number];

export const AUDIENCES = ["individual", "healthcare", "organization", "partner"] as const;

function text(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export function validateWaitlistSubmission(body: unknown) {
  if (!body || typeof body !== "object") return { ok: false as const, message: "Invalid submission." };
  const value = body as Record<string, unknown>;
  const fullName = text(value.fullName, 120);
  const email = text(value.email, 254).toLowerCase();
  const audience = text(value.audience, 40);
  const website = text(value.website, 200);
  const consent = value.consent === true;

  if (website) return { ok: true as const, spam: true as const };
  if (fullName.length < 2) return { ok: false as const, message: "Please enter your full name." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { ok: false as const, message: "Please enter a valid email address." };
  if (!AUDIENCES.includes(audience as (typeof AUDIENCES)[number]))
    return { ok: false as const, message: "Please tell us how you are joining." };
  if (!consent) return { ok: false as const, message: "Consent is required to join the waitlist." };

  return {
    ok: true as const,
    spam: false as const,
    data: { fullName, email, audience },
  };
}
