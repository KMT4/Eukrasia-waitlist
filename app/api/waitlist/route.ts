import { NextResponse } from "next/server";
import { database } from "@/lib/db";
import { validateWaitlistSubmission } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = validateWaitlistSubmission(body);
    if (!validated.ok) return NextResponse.json({ error: validated.message }, { status: 400 });
    if (validated.spam) return NextResponse.json({ success: true });

    const sql = database();
    const entry = validated.data;
    await sql`
      with added as (
        insert into public.waitlist_entries (
        full_name, email, phone, source, consent_version, consented_at
        ) values (
        ${entry.fullName}, ${entry.email}, ${entry.phone},
        'website', '2026-10', now()
        )
        on conflict (lower(email)) do nothing
        returning id
      ), logged as (
        insert into public.waitlist_admin_events (entry_id, actor_email, event_type, details)
        select id, 'waitlist', 'joined', jsonb_build_object('source', 'website')
        from added
        returning entry_id
      )
      select added.id from added join logged on logged.entry_id = added.id
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Waitlist submission failed", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "We could not save your place. Please try again." }, { status: 500 });
  }
}
