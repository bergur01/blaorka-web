import "server-only";

// Hjúpun á PayGo Helpdesk API.
// Þessi skrá má ALDREI vera flutt inn í client-component – `server-only`
// tryggir að byggingin bregst ef það gerist. Lykill og slóð koma úr .env.local.

export const ATTACHMENT_LIMITS = {
  maxFiles: 5,
  maxBytesPerFile: 25 * 1024 * 1024,
  accept:
    ".jpg,.jpeg,.png,.gif,.webp,.heic,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv,.txt,.zip",
} as const;

export interface TicketInput {
  name: string;
  email: string;
  message: string;
  subject?: string;
  phone?: string;
  address?: string;
  company?: string;
  kennitala?: string;
  reference?: string;
  /** Slóð formsins – birtist á miðanum */
  sourceIdentifier?: string;
  attachments?: File[];
}

export type TicketResult =
  | { ok: true; ticketNumber: string; ticketId: string }
  | { ok: false; status: number; message: string };

function env(name: "HELPDESK_API_URL" | "HELPDESK_API_KEY"): string {
  const v = process.env[name];
  if (!v) throw new Error(`Vantar umhverfisbreytu ${name}`);
  return v;
}

export async function createTicket(input: TicketInput): Promise<TicketResult> {
  const url = env("HELPDESK_API_URL");
  const key = env("HELPDESK_API_KEY");

  const fields: Record<string, string> = {
    name: input.name,
    email: input.email,
    message: input.message,
  };
  for (const k of [
    "subject",
    "phone",
    "address",
    "company",
    "kennitala",
    "reference",
    "sourceIdentifier",
  ] as const) {
    const v = input[k];
    if (v && v.trim()) fields[k] = v.trim();
  }

  const files = (input.attachments ?? []).filter((f) => f && f.size > 0);

  let res: Response;
  try {
    if (files.length > 0) {
      const form = new FormData();
      for (const [k, v] of Object.entries(fields)) form.append(k, v);
      for (const f of files) form.append("attachments", f, f.name);
      res = await fetch(url, {
        method: "POST",
        headers: { "X-Helpdesk-Api-Key": key },
        body: form,
        cache: "no-store",
      });
    } else {
      res = await fetch(url, {
        method: "POST",
        headers: {
          "X-Helpdesk-Api-Key": key,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fields),
        cache: "no-store",
      });
    }
  } catch (err) {
    console.error("[helpdesk] netvilla", err);
    return { ok: false, status: 0, message: "Náði ekki sambandi við þjónustuborð." };
  }

  let data: { success?: boolean; ticketId?: string; ticketNumber?: string; message?: string; error?: string } = {};
  try {
    data = await res.json();
  } catch {
    /* tómt svar */
  }

  if (res.ok && data.success) {
    return {
      ok: true,
      ticketNumber: data.ticketNumber ?? "",
      ticketId: data.ticketId ?? "",
    };
  }

  // Skráum stöðu í server-log (aldrei lykilinn) svo hægt sé að rekja villur.
  console.error("[helpdesk] villa", res.status, data.message ?? data.error ?? "");

  const message =
    res.status === 429
      ? "Of margar beiðnir – reyndu aftur eftir smá stund."
      : res.status === 413
        ? "Viðhengi eru of stór (hámark 25 MB hvert, 5 skrár)."
        : res.status === 400
          ? "Eitthvað í forminu var ógilt. Athugaðu netfang og viðhengi."
          : "Ekki tókst að senda fyrirspurnina. Reyndu aftur eða hringdu í okkur.";

  return { ok: false, status: res.status, message };
}
