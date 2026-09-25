export const WAITLIST_STATUSES = ["new", "contacted", "qualified", "invited", "archived"] as const;
export type WaitlistStatus = (typeof WAITLIST_STATUSES)[number];

const AUDIENCES = ["pilgrim", "operator", "healthcare", "partner", "caregiver", "other"];
const INTERESTS = ["hajj", "umrah", "operator-pilot", "healthcare-partnership", "launch-updates"];
const CONTACT_METHODS = ["email", "whatsapp", "phone"];

function text(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export function validateWaitlistSubmission(body: unknown) {
  if (!body || typeof body !== "object") return { ok: false as const, message: "Invalid submission." };
  const value = body as Record<string, unknown>;
  const fullName = text(value.fullName, 120);
  const email = text(value.email, 254).toLowerCase();
  const phone = text(value.phone, 32);
  const country = text(value.country, 100);
  const audience = text(value.audience, 40);
  const interest = text(value.interest, 60);
  const organization = text(value.organization, 160);
  const preferredContact = text(value.preferredContact, 20);
  const preferredLanguage = text(value.preferredLanguage, 16) || "en";
  const message = text(value.message, 1000);
  const website = text(value.website, 200);
  const consent = value.consent === true;

  if (website) return { ok: true as const, spam: true as const };
  if (fullName.length < 2) return { ok: false as const, message: "Please enter your full name." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { ok: false as const, message: "Please enter a valid email address." };
  if (country.length < 2) return { ok: false as const, message: "Please enter your country or region." };
  if (!AUDIENCES.includes(audience)) return { ok: false as const, message: "Please tell us how you are joining." };
  if (!INTERESTS.includes(interest)) return { ok: false as const, message: "Please select your main interest." };
  if (!CONTACT_METHODS.includes(preferredContact))
    return { ok: false as const, message: "Please select a contact preference." };
  if (!consent) return { ok: false as const, message: "Consent is required to join the waitlist." };

  return {
    ok: true as const,
    spam: false as const,
    data: { fullName, email, phone, country, audience, interest, organization, preferredContact, preferredLanguage, message },
  };
}
