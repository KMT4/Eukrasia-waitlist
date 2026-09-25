import { NextResponse } from "next/server";
import { getApprovedAdmin } from "@/lib/admin-auth";
import { database } from "@/lib/db";
import { WAITLIST_STATUSES } from "@/lib/validation";

export const runtime = "nodejs";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function administrator() {
  return getApprovedAdmin();
}

function csvCell(value: unknown) {
  const raw = value == null ? "" : String(value);
  const safe = /^\s*[=+\-@]/.test(raw) ? `'${raw}` : raw;
  return `"${safe.replaceAll('"', '""')}"`;
}

export async function GET(request: Request) {
  const admin = await administrator();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sql = database();
  const entries = await sql`
    select id, full_name, email, phone, country_name, audience, organization_name,
      journey_interest, preferred_contact, preferred_language, message, source,
      consent_version, consented_at, status, internal_note, last_contacted_at,
      created_at, updated_at
    from public.waitlist_entries
    order by created_at desc
    limit 10000
  `;

  if (new URL(request.url).searchParams.get("format") === "csv") {
    const keys = Object.keys(entries[0] ?? {
      id: "", full_name: "", email: "", phone: "", country_name: "", audience: "",
      organization_name: "", journey_interest: "", preferred_contact: "",
      preferred_language: "", message: "", source: "", consent_version: "",
      consented_at: "", status: "", internal_note: "", last_contacted_at: "",
      created_at: "", updated_at: "",
    });
    const csv = `\uFEFF${[keys, ...entries.map((entry) => keys.map((key) => entry[key]))]
      .map((row) => row.map(csvCell).join(","))
      .join("\r\n")}`;
    await sql`
      insert into public.waitlist_admin_events (
        entry_id, actor_email, event_type, details
      ) values (
        null,
        ${admin.email},
        'exported',
        jsonb_build_object('record_count', ${entries.length})
      )
    `;
    return new NextResponse(csv, {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="eukrasia-waitlist-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }

  const updates = await sql`
    select id::text, entry_id::text, actor_email, event_type, details, created_at
    from public.waitlist_admin_events
    order by created_at desc
    limit 100
  `;

  return NextResponse.json({ entries, updates });
}

export async function PATCH(request: Request) {
  const admin = await administrator();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await request.json()) as { id?: string; status?: string; internalNote?: string };
  if (!body.id || !UUID_PATTERN.test(body.id) || !WAITLIST_STATUSES.includes(body.status as (typeof WAITLIST_STATUSES)[number]))
    return NextResponse.json({ error: "Invalid update." }, { status: 400 });
  const note = typeof body.internalNote === "string" ? body.internalNote.trim().slice(0, 2000) : "";
  const sql = database();
  const saved = await sql`
    with current as (
      select id, status, internal_note
      from public.waitlist_entries
      where id = ${body.id}
      for update
    ), changed as (
      update public.waitlist_entries as entry
      set status = ${body.status}, internal_note = ${note},
        last_contacted_at = case
          when ${body.status} = 'contacted'
            and current.status is distinct from 'contacted'
          then now()
          else entry.last_contacted_at
        end,
        updated_at = now()
      from current
      where entry.id = current.id
      returning entry.*
    ), logged as (
      insert into public.waitlist_admin_events (
        entry_id, actor_email, event_type, details
      )
      select changed.id, ${admin.email}, 'updated', jsonb_build_object(
        'from_status', current.status,
        'to_status', changed.status,
        'status_changed', current.status is distinct from changed.status,
        'note_changed', current.internal_note is distinct from changed.internal_note
      )
      from changed join current on current.id = changed.id
      returning id::text, entry_id::text, actor_email, event_type, details, created_at
    )
    select row_to_json(changed) as entry, row_to_json(logged) as update
    from changed cross join logged
  `;
  if (!saved[0]) return NextResponse.json({ error: "Record not found." }, { status: 404 });
  return NextResponse.json({ success: true, entry: saved[0].entry, update: saved[0].update });
}

export async function DELETE(request: Request) {
  const admin = await administrator();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await request.json()) as { id?: string; confirmation?: string };
  if (!body.id || !UUID_PATTERN.test(body.id) || body.confirmation !== "DELETE")
    return NextResponse.json({ error: "Deletion was not confirmed." }, { status: 400 });
  const sql = database();
  const removed = await sql`
    with removed as (
      delete from public.waitlist_entries where id = ${body.id}
      returning id, status
    ), logged as (
      insert into public.waitlist_admin_events (
        entry_id, actor_email, event_type, details
      )
      select id, ${admin.email}, 'deleted',
        jsonb_build_object('previous_status', status)
      from removed
      returning id::text, entry_id::text, actor_email, event_type, details, created_at
    )
    select row_to_json(logged) as update from logged
  `;
  if (!removed[0]) return NextResponse.json({ error: "Record not found." }, { status: 404 });
  return NextResponse.json({ success: true, update: removed[0].update });
}
