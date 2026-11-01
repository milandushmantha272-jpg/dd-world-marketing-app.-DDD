import { createClient } from "npm:@supabase/supabase-js@2";
import ExcelJS from "npm:exceljs@4.4.0";
import JSZip from "npm:jszip@3.10.1";
import { PDFDocument, StandardFonts, rgb } from "npm:pdf-lib@1.17.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const TABLES = [
  "users","teams","attendance","sales","messages","security_alerts","leaves",
  "commission_reports","commission_team_submissions","commission_payment_issues",
  "commission_agent_payments","dialog_officers","dialog_weekly_reports",
  "dialog_report_distributions","dialog_officer_contacts","commission_settings",
  "product_access_controls","live_meeting_rooms","notifications",
  "attendance_monthly_summary","attendance_annual_summary","sales_monthly_summary",
  "sales_annual_summary","employee_career_reviews","team_leader_commission_agreements",
  "presentation_decks","attendance_annual_archive","sales_annual_archive",
  "community_posts","community_comments","community_reactions","employee_star_rewards",
  "dialog_report_import_rows","employee_profiles","employee_status_history",
  "employee_transfer_history","employee_approval_requests","team_members",
  "team_transfer_history","team_leader_history","team_audit_logs","attendance_logs",
  "leave_requests","activations","activation_logs","activation_statistics","commissions",
  "commission_history","commission_complaints","commission_comments","dialog_reports",
  "report_downloads","report_archive","complaint_messages","complaint_attachments",
  "ez_cash_records","ez_cash_reports","ez_cash_history","meetings","meeting_attendance",
  "conversations","conversation_members","conversation_messages","groups","group_members",
  "group_messages","user_devices","employee_id_cards","qr_verifications",
  "employee_documents","document_verifications","leave_approvals","downloads",
  "download_history","training_materials","training_views"
];

const ARCHIVE_DATE_COLUMNS: Record<string, string> = {
  attendance_logs: "occurred_at",
  activation_logs: "created_at",
  commission_history: "created_at",
  commission_comments: "created_at",
  community_comments: "created_at",
  complaint_messages: "created_at",
  complaint_attachments: "created_at",
  conversation_messages: "created_at",
  group_messages: "created_at",
  meeting_attendance: "marked_at",
  download_history: "downloaded_at",
  training_views: "viewed_at",
  report_downloads: "downloaded_at",
  team_audit_logs: "created_at",
  employee_transfer_history: "transferred_at",
  team_transfer_history: "transferred_at",
  commission_agent_payments: "received_at",
  commission_payment_issues: "reported_at",
  notifications: "created_at",
  security_alerts: "timestamp",
  qr_verifications: "scanned_at",
  messages: "timestamp",
  sales: "sale_date",
  attendance: "date",
  activations: "created_at",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function canonical(value: unknown): string {
  if (Array.isArray(value)) return \`[\${value.map(canonical).join(",")}]\`;
  if (value && typeof value === "object") {
    const object = value as Record<string, unknown>;
    return \`{\${Object.keys(object).sort().map((key) => \`\${JSON.stringify(key)}:\${canonical(object[key])}\`).join(",")}}\`;
  }
  return JSON.stringify(value);
}

async function sha256(bytes: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function fetchAllRows(admin: ReturnType<typeof createClient>, table: string) {
  const rows: Record<string, unknown>[] = [];
  const pageSize = 500;
  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await admin.from(table).select("*").range(offset, offset + pageSize - 1);
    if (error) throw new Error(\`Backup read failed for \${table}: \${error.message}\`);
    const page = (data ?? []) as Record<string, unknown>[];
    rows.push(...page);
    if (page.length < pageSize) break;
  }
  return rows;
}

async function stageArchiveCandidates(
  admin: ReturnType<typeof createClient>,
  backupId: string,
  snapshot: Record<string, Record<string, unknown>[]>,
  cutoff: Date,
) {
  const stagedCounts: Record<string, number> = {};
  const stagingRows: Record<string, unknown>[] = [];
  for (const [table, dateColumn] of Object.entries(ARCHIVE_DATE_COLUMNS)) {
    const rows = snapshot[table] ?? [];
    const candidates = rows.filter((row) => {
      const value = row[dateColumn];
      if (value === null || value === undefined) return false;
      const timestamp = new Date(String(value));
      return !Number.isNaN(timestamp.getTime()) && timestamp < cutoff;
    });
    stagedCounts[table] = candidates.length;
    for (const row of candidates) {
      if (!row.id) throw new Error(\`Archive candidate in \${table} has no id primary key.\`);
      stagingRows.push({
        backup_id: backupId,
        source_table: table,
        source_pk: { id: String(row.id) },
        record_data: row,
        record_timestamp: new Date(String(row[dateColumn])).toISOString(),
        row_sha256: await sha256(new TextEncoder().encode(canonical(row))),
      });
    }
  }
  for (let offset = 0; offset < stagingRows.length; offset += 200) {
    const { error } = await admin.from("backup_snapshot_records").insert(stagingRows.slice(offset, offset + 200));
    if (error) throw new Error(\`Could not stage archive candidates: \${error.message}\`);
  }
  return { stagedCounts, stagedRows: stagingRows.length };
}

async function createExcel(snapshot: Record<string, Record<string, unknown>[]>) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "DD WORLD CONNECT";
  workbook.created = new Date();
  for (const [table, rows] of Object.entries(snapshot)) {
    const sheet = workbook.addWorksheet(table.slice(0, 31));
    const serialized = rows.map((row) => canonical(row));
    const parts = Math.max(1, ...serialized.map((value) => Math.ceil(value.length / 30000)));
    sheet.columns = Array.from({ length: parts }, (_, index) => ({
      header: \`record_json_part_\${index + 1}\`,
      key: \`part_\${index + 1}\`,
      width: 42,
    }));
    serialized.forEach((value) => {
      const record: Record<string, string> = {};
      for (let index = 0; index < parts; index++) {
        record[\`part_\${index + 1}\`] = value.slice(index * 30000, (index + 1) * 30000);
      }
      sheet.addRow(record);
    });
    sheet.views = [{ state: "frozen", ySplit: 1 }];
  }
  return new Uint8Array(await workbook.xlsx.writeBuffer());
}

async function createPdfReport(
  backupYear: number,
  tableCounts: Record<string, number>,
  totalRows: number,
  stagedRows: number,
) {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  let page = pdf.addPage([595, 842]);
  let y = 800;
  const line = (text: string, size = 10, isBold = false) => {
    if (y < 48) {
      page = pdf.addPage([595, 842]);
      y = 800;
    }
    page.drawText(text.slice(0, 110), {
      x: 42, y, size, font: isBold ? bold : font,
      color: rgb(0.12, 0.18, 0.28),
    });
    y -= size + 7;
  };
  line("DD WORLD CONNECT - YEARLY DATA BACKUP", 16, true);
  line(\`Backup year: \${backupYear}\`);
  line(\`Created at: \${new Date().toISOString()}\`);
  line(\`Total database rows: \${totalRows}\`);
  line(\`Records older than 12 months staged for archive: \${stagedRows}\`);
  y -= 12;
  line("TABLE SUMMARY", 12, true);
  for (const [table, count] of Object.entries(tableCounts)) line(\`\${table}: \${count}\`);
  y -= 12;
  line("This report is a summary. The ZIP contains the complete JSON data snapshot and Excel export.", 9);
  return new Uint8Array(await pdf.save());
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  const authorization = req.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) return jsonResponse({ error: "Authentication required" }, 401);

  const url = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !anonKey || !serviceRoleKey) return jsonResponse({ error: "Server configuration is incomplete." }, 500);

  const token = authorization.slice("Bearer ".length);
  const authClient = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: authData, error: authError } = await authClient.auth.getUser(token);
  if (authError || !authData.user) return jsonResponse({ error: "Invalid or expired session." }, 401);

  const admin = createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: employee, error: employeeError } = await admin
    .from("users")
    .select("id,role,status,employment_status,id_approval_status")
    .eq("auth_user_id", authData.user.id)
    .maybeSingle();

  if (employeeError || !employee || employee.role?.toLowerCase() !== "owner" ||
      employee.status?.toLowerCase() !== "active" ||
      employee.employment_status?.toUpperCase() !== "ACTIVE" ||
      employee.id_approval_status?.toUpperCase() !== "APPROVED") {
    return jsonResponse({ error: "Owner access only." }, 403);
  }

  let backupId: string | null = null;
  try {
    const body = await req.json().catch(() => ({}));
    const requestedYear = Number(body.backup_year ?? new Date().getUTCFullYear());
    if (!Number.isInteger(requestedYear) || requestedYear < 2000 || requestedYear > 2100) {
      return jsonResponse({ error: "Invalid backup year." }, 400);
    }

    backupId = crypto.randomUUID();
    const { error: createError } = await admin.from("backup_history").insert({
      id: backupId,
      backup_year: requestedYear,
      created_by: employee.id,
      status: "pending",
      storage_bucket: "dd-backups",
      manifest: { format_version: 1, source: "dd_world_connect", archive_policy_months: 12 },
    });
    if (createError) throw new Error(\`Could not create backup history: \${createError.message}\`);

    const snapshot: Record<string, Record<string, unknown>[]> = {};
    const tableCounts: Record<string, number> = {};
    let totalRows = 0;
    for (const table of TABLES) {
      const rows = await fetchAllRows(admin, table);
      snapshot[table] = rows;
      tableCounts[table] = rows.length;
      totalRows += rows.length;
    }

    const cutoff = new Date();
    cutoff.setUTCMonth(cutoff.getUTCMonth() - 12);
    const { stagedCounts, stagedRows } = await stageArchiveCandidates(admin, backupId, snapshot, cutoff);
    const excelBytes = await createExcel(snapshot);
    const pdfBytes = await createPdfReport(requestedYear, tableCounts, totalRows, stagedRows);

    const manifest = {
      format_version: 1,
      project: "DD WORLD CONNECT",
      backup_year: requestedYear,
      generated_at: new Date().toISOString(),
      cutoff_at: cutoff.toISOString(),
      table_counts: tableCounts,
      total_rows: totalRows,
      archive_candidate_counts: stagedCounts,
      archive_candidate_rows: stagedRows,
      tables_included: TABLES,
    };
    const zip = new JSZip();
    zip.file("manifest.json", JSON.stringify(manifest, null, 2));
    zip.file("database.json", JSON.stringify(snapshot));
    zip.file("archive-candidates.json", JSON.stringify(
      Object.fromEntries(Object.entries(ARCHIVE_DATE_COLUMNS).map(([table, column]) => [
        table,
        (snapshot[table] ?? []).filter((row) => {
          const value = row[column];
          return value !== null && value !== undefined && new Date(String(value)) < cutoff;
        }),
      ])),
    ));
    zip.file("exports/dd-world-connect.xlsx", excelBytes);
    zip.file("exports/backup-report.pdf", pdfBytes);
    const zipBytes = await zip.generateAsync({
      type: "uint8array",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    });

    const prefix = \`\${requestedYear}/\${backupId}\`;
    const paths = {
      zip: \`\${prefix}/dd-world-connect-\${requestedYear}.zip\`,
      excel: \`\${prefix}/dd-world-connect-\${requestedYear}.xlsx\`,
      pdf: \`\${prefix}/dd-world-connect-\${requestedYear}.pdf\`,
    };
    const files = [
      { path: paths.zip, bytes: zipBytes, contentType: "application/zip" },
      { path: paths.excel, bytes: excelBytes, contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
      { path: paths.pdf, bytes: pdfBytes, contentType: "application/pdf" },
    ];

    for (const file of files) {
      const { error } = await admin.storage.from("dd-backups").upload(file.path, file.bytes, {
        contentType: file.contentType,
        upsert: false,
      });
      if (error) throw new Error(\`Backup upload failed (\${file.path}): \${error.message}\`);
    }

    const hashes: Record<string, string> = {};
    for (const file of files) {
      const { data, error } = await admin.storage.from("dd-backups").download(file.path);
      if (error || !data) throw new Error(\`Backup verification download failed (\${file.path}): \${error?.message ?? "No data"}\`);
      const downloaded = new Uint8Array(await data.arrayBuffer());
      const expected = await sha256(file.bytes);
      const actual = await sha256(downloaded);
      if (expected !== actual) throw new Error(\`Backup verification hash mismatch (\${file.path}).\`);
      hashes[file.path] = actual;
    }

    const { error: completeError } = await admin.from("backup_history").update({
      status: "verified",
      zip_path: paths.zip,
      excel_path: paths.excel,
      pdf_path: paths.pdf,
      zip_sha256: hashes[paths.zip],
      excel_sha256: hashes[paths.excel],
      pdf_sha256: hashes[paths.pdf],
      total_rows: totalRows,
      table_counts: tableCounts,
      manifest: { ...manifest, verified: true, hashes },
      completed_at: new Date().toISOString(),
    }).eq("id", backupId);
    if (completeError) throw new Error(\`Could not mark backup verified: \${completeError.message}\`);

    return jsonResponse({
      success: true,
      backup_id: backupId,
      backup_year: requestedYear,
      status: "verified",
      total_rows: totalRows,
      table_counts: tableCounts,
      archive_candidate_rows: stagedRows,
      archive_cutoff: cutoff.toISOString(),
      files: paths,
      sha256: hashes,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Backup failed.";
    if (backupId) {
      await admin.from("backup_history").update({
        status: "failed",
        failure_message: message.slice(0, 2000),
      }).eq("id", backupId);
    }
    return jsonResponse({ error: message, backup_id: backupId }, 500);
  }
});
