"use server";

import { headers } from "next/headers";
import { ATTACHMENT_LIMITS, createTicket } from "@/lib/helpdesk";
import { site } from "@/content/site";
import type { ContactState } from "@/lib/contact-state";

// Server Action fyrir öll samskiptaform vefsins.
// Keyrir eingöngu á bakenda – vafrinn sér aldrei API-slóð eða lykil.

const str = (fd: FormData, key: string, max: number) =>
  String(fd.get(key) ?? "")
    .trim()
    .slice(0, max);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function submitContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  // Honeypot – vélmenni fylla þetta út. Þykjumst hafa tekið við.
  if (str(formData, "website", 10)) {
    return { status: "success", message: "Takk fyrir!", ticketNumber: "" };
  }

  const name = str(formData, "name", 255);
  const email = str(formData, "email", 255);
  const message = str(formData, "message", 20_000);
  const phone = str(formData, "phone", 50);
  const address = str(formData, "address", 500);
  const company = str(formData, "company", 255);
  const projectType = str(formData, "projectType", 100);
  const subjectRaw = str(formData, "subject", 200);
  const reference = str(formData, "reference", 255);
  const sourcePath = str(formData, "sourcePath", 200);

  const fieldErrors: ContactState["fieldErrors"] = {};
  if (name.length < 2) fieldErrors.name = "Vinsamlegast sláðu inn nafn.";
  if (!EMAIL_RE.test(email)) fieldErrors.email = "Netfangið lítur ekki rétt út.";
  if (message.length < 5) fieldErrors.message = "Segðu okkur aðeins meira um erindið.";

  // Viðhengi
  const attachments = formData
    .getAll("attachments")
    .filter((f): f is File => f instanceof File && f.size > 0);
  if (attachments.length > ATTACHMENT_LIMITS.maxFiles) {
    fieldErrors.attachments = `Mest ${ATTACHMENT_LIMITS.maxFiles} skrár.`;
  } else if (attachments.some((f) => f.size > ATTACHMENT_LIMITS.maxBytesPerFile)) {
    fieldErrors.attachments = "Hver skrá má mest vera 25 MB.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", message: "Athugaðu reitina sem eru merktir.", fieldErrors };
  }

  // Efnislína: annað hvort gefin (t.d. „Tilboð – Ótengd kerfi“) eða byggð á tegund verkefnis
  const subject =
    subjectRaw || (projectType ? `Fyrirspurn – ${projectType}` : `Fyrirspurn frá ${name}`);

  // sourceIdentifier = opinber slóð vefsins + slóð formsins (aðeins örugg tákn)
  const safePath = /^\/[\w\-/]*$/.test(sourcePath) ? sourcePath : "/hafa-samband";
  const sourceIdentifier = `${site.url}${safePath}`;

  // Bætum tegund verkefnis efst í erindið svo það sjáist á miðanum
  const fullMessage = projectType ? `Tegund verkefnis: ${projectType}\n\n${message}` : message;

  const result = await createTicket({
    name,
    email,
    message: fullMessage,
    subject,
    phone,
    address,
    company,
    reference,
    sourceIdentifier,
    attachments,
  });

  if (!result.ok) {
    return { status: "error", message: result.message };
  }

  // Létt log án persónuupplýsinga
  const ua = (await headers()).get("user-agent") ?? "";
  console.info("[contact] miði stofnaður", result.ticketNumber, safePath, ua.slice(0, 40));

  return {
    status: "success",
    ticketNumber: result.ticketNumber,
    message: "Takk fyrir! Við höfum móttekið erindið og höfum samband fljótlega.",
  };
}
