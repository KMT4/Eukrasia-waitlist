import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
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
    select id, full_name, email, audience, source, consent_version, consented_at,
      status, internal_note, created_at, updated_at
    from public.waitlist_entries
    order by created_at desc
    limit 10000
  `;

  if (new URL(request.url).searchParams.get("format") === "xlsx") {
    try {
      const columns: { key: keyof (typeof entries)[number]; header: string; width: number }[] = [
        { key: "id", header: "Record ID", width: 38 },
        { key: "full_name", header: "Full name", width: 25 },
        { key: "email", header: "Email address", width: 34 },
        { key: "audience", header: "Joining as", width: 24 },
        { key: "source", header: "Signup source", width: 17 },
        { key: "consent_version", header: "Consent version", width: 18 },
        { key: "consented_at", header: "Consent date", width: 23 },
        { key: "status", header: "Status", width: 16 },
        { key: "internal_note", header: "Private team note", width: 42 },
        { key: "last_contacted_at", header: "Last contacted", width: 23 },
        { key: "created_at", header: "Joined", width: 23 },
        { key: "updated_at", header: "Last updated", width: 23 },
      ];
      const workbook = new ExcelJS.Workbook();
      workbook.creator = "Eukrasia";
      workbook.subject = "Eukrasia waitlist export";
      workbook.title = "Eukrasia Waitlist";
      workbook.created = new Date();
      const sheet = workbook.addWorksheet("Waitlist", {
        views: [{ state: "frozen", xSplit: 2, ySplit: 1, topLeftCell: "C2", activeCell: "C2" }],
        properties: { defaultRowHeight: 25, tabColor: { argb: "FF0C70D1" } },
        pageSetup: { orientation: "landscape", fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
      });
      sheet.columns = columns.map(({ key, header, width }) => ({ key: String(key), header, width }));
      sheet.autoFilter = { from: "A1", to: `${String.fromCharCode(64 + columns.length)}1` };

      const header = sheet.getRow(1);
      header.height = 34;
      header.eachCell((cell) => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF082B4D" } };
        cell.font = { name: "Aptos", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
        cell.alignment = { vertical: "middle", wrapText: true };
        cell.border = { bottom: { style: "medium", color: { argb: "FF42B9E6" } } };
      });

      const dateFields = new Set(["consented_at", "last_contacted_at", "created_at", "updated_at"]);
      for (const [index, entry] of entries.entries()) {
        const values = columns.map(({ key }) => {
          const value = entry[key];
          if (value == null || value === "") return "";
          if (dateFields.has(String(key))) {
            const date = value instanceof Date ? value : new Date(String(value));
            return Number.isNaN(date.getTime()) ? String(value) : date;
          }
          return String(value);
        });
        const row = sheet.addRow(values);
        const contentLines = columns.map(({ key, width }) => {
          const value = entry[key];
          return value == null ? 1 : Math.ceil(String(value).length / Math.max(8, width - 2));
        });
        row.height = Math.min(96, Math.max(27, Math.max(...contentLines) * 14 + 9));
        row.eachCell((cell, columnNumber) => {
          const argb = index % 2 === 0 ? "FFF2F8FC" : "FFFFFFFF";
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb } };
          cell.font = { name: "Aptos", size: 9, color: { argb: "FF173B58" } };
          cell.alignment = { vertical: "top", wrapText: true };
          cell.border = { bottom: { style: "hair", color: { argb: "FFDCE8F0" } } };
          const field = String(columns[columnNumber - 1]?.key ?? "");
          if (dateFields.has(field) && cell.value instanceof Date) cell.numFmt = "dd mmm yyyy, hh:mm";
          if (field === "status") {
            const colors: Record<string, string> = {
              new: "FFDBF0FF", contacted: "FFE9E6FF", qualified: "FFDDF5EB", invited: "FFFFF0CF", archived: "FFE9EEF2",
            };
            const color = colors[String(cell.value)] ?? "FFE9EEF2";
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: color } };
            cell.font = { name: "Aptos", size: 9, bold: true, color: { argb: "FF173B58" } };
          }
        });
      }

      const buffer = await workbook.xlsx.writeBuffer();
      let auditRecorded = true;
      try {
        await sql`
          insert into public.waitlist_admin_events (
            entry_id, actor_email, event_type, details
          ) values (
            null,
            ${admin.email},
            'exported',
            jsonb_build_object('record_count', ${entries.length}, 'format', 'xlsx')
          )
        `;
      } catch (error) {
        auditRecorded = false;
        console.error("Waitlist export audit failed", error instanceof Error ? error.message : "Unknown error");
      }

      return new Response(buffer, {
        headers: {
          "content-type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "content-disposition": `attachment; filename="eukrasia-waitlist-${new Date().toISOString().slice(0, 10)}.xlsx"`,
          "cache-control": "no-store",
          "x-eukrasia-audit": auditRecorded ? "recorded" : "failed",
        },
      });
    } catch (error) {
      console.error("Waitlist Excel export failed", error instanceof Error ? error.message : "Unknown error");
      return NextResponse.json({ error: "The Excel workbook could not be created. Please try again." }, { status: 500 });
    }
  }

  if (new URL(request.url).searchParams.get("format") === "csv") {
    const keys = Object.keys(entries[0] ?? {
      id: "", full_name: "", email: "", audience: "", source: "", consent_version: "",
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
        jsonb_build_object('record_count', ${entries.length}, 'format', 'csv')
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
      returning id, status, full_name
    ), logged as (
      insert into public.waitlist_admin_events (
        entry_id, actor_email, event_type, details
      )
      select id, ${admin.email}, 'deleted',
        jsonb_build_object('previous_status', status, 'full_name', full_name)
      from removed
      returning id::text, entry_id::text, actor_email, event_type, details, created_at
    )
    select row_to_json(logged) as update from logged
  `;
  if (!removed[0]) return NextResponse.json({ error: "Record not found." }, { status: 404 });
  return NextResponse.json({ success: true, update: removed[0].update });
}
