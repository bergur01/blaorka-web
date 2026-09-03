"use client";

import { useActionState, useState } from "react";
import { usePathname } from "next/navigation";
import { submitContact } from "@/app/actions/contact";
import { initialContactState } from "@/lib/contact-state";
import { ArrowRight } from "./icons";

const MAX_FILES = 5;
const MAX_BYTES = 25 * 1024 * 1024;
const ACCEPT =
  ".jpg,.jpeg,.png,.gif,.webp,.heic,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv,.txt,.zip";

const PROJECT_TYPES = [
  "Heimili / sumarhús",
  "Ótengt kerfi",
  "Húsbíll / bátur",
  "Fyrirtæki / fjarskipti",
  "Rafgeymar / búnaður",
  "Annað",
];

type Props = {
  /** "full" = /hafa-samband með öllum reitum, "compact" = stutt tilboðsform */
  variant?: "full" | "compact";
  /** Forstillt efnislína, t.d. „Tilboð – Ótengd kerfi“ */
  subject?: string;
  /** Forstillt tegund verkefnis */
  projectType?: string;
  /** Tilvísun á miðann, t.d. lausn eða vöru */
  reference?: string;
  /** Dökk útgáfa (á dökkum bakgrunni) */
  tone?: "light" | "dark";
  title?: string;
  intro?: string;
  className?: string;
};

export function ContactForm({
  variant = "full",
  subject,
  projectType,
  reference,
  tone = "light",
  title,
  intro,
  className = "",
}: Props) {
  const pathname = usePathname();
  const [state, action, pending] = useActionState(submitContact, initialContactState);
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const dark = tone === "dark";
  const input = dark
    ? "h-12 w-full rounded-xl border border-white/15 bg-white/5 px-4 text-sm text-white placeholder:text-white/35 focus:border-volt-400 focus:bg-white/10 outline-none"
    : "h-12 w-full rounded-xl border border-mist-300 bg-mist-50 px-4 text-sm text-ink-900 placeholder:text-ink-900/35 focus:border-brand-500 focus:bg-white outline-none";
  const label = dark ? "text-sm font-medium text-white/85" : "text-sm font-medium text-ink-900";
  const muted = dark ? "text-white/50" : "text-ink-900/50";
  const errCls = "mt-1.5 block text-xs font-medium text-red-500";

  function onFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const list = Array.from(e.target.files ?? []);
    setFileError(null);
    if (list.length > MAX_FILES) {
      setFileError(`Mest ${MAX_FILES} skrár.`);
      e.target.value = "";
      setFiles([]);
      return;
    }
    const tooBig = list.find((f) => f.size > MAX_BYTES);
    if (tooBig) {
      setFileError(`„${tooBig.name}“ er yfir 25 MB.`);
      e.target.value = "";
      setFiles([]);
      return;
    }
    setFiles(list);
  }

  if (state.status === "success") {
    return (
      <div
        className={`rounded-3xl p-8 text-center ${
          dark ? "border border-volt-500/30 bg-white/5" : "border border-brand-200 bg-brand-50"
        } ${className}`}
        role="status"
      >
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-500 text-white shadow-glow">
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m5 12 5 5L20 7" />
          </svg>
        </span>
        <h3 className={`mt-5 font-display text-xl font-semibold ${dark ? "text-white" : "text-ink-900"}`}>
          Erindið er móttekið
        </h3>
        <p className={`mt-2 text-sm ${dark ? "text-white/70" : "text-ink-900/70"}`}>{state.message}</p>
        {state.ticketNumber && (
          <p className={`mt-4 text-xs uppercase tracking-wider ${muted}`}>
            Málsnúmer{" "}
            <span className={`font-semibold tracking-normal ${dark ? "text-volt-300" : "text-brand-600"}`}>
              {state.ticketNumber}
            </span>
          </p>
        )}
      </div>
    );
  }

  const compact = variant === "compact";

  return (
    <form
      action={action}
      noValidate
      className={className}
      aria-busy={pending}
    >
      {title && (
        <h2 className={`font-display text-xl font-semibold ${dark ? "text-white" : "text-ink-900"}`}>
          {title}
        </h2>
      )}
      {intro && <p className={`mt-1 text-sm ${dark ? "text-white/60" : "text-ink-900/60"}`}>{intro}</p>}

      {/* Faldir reitir */}
      <input type="hidden" name="sourcePath" value={pathname} />
      {subject && <input type="hidden" name="subject" value={subject} />}
      {reference && <input type="hidden" name="reference" value={reference} />}
      {compact && projectType && <input type="hidden" name="projectType" value={projectType} />}
      {/* Honeypot – á að vera tómur */}
      <div className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label>
          Vefsíða
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className={`mt-6 grid gap-5 ${compact ? "" : "sm:grid-cols-2"}`}>
        <label className="block">
          <span className={label}>Nafn *</span>
          <input name="name" required autoComplete="name" className={`mt-1.5 ${input}`} placeholder="Fullt nafn" />
          {state.fieldErrors?.name && <span className={errCls}>{state.fieldErrors.name}</span>}
        </label>
        <label className="block">
          <span className={label}>{compact ? "Netfang *" : "Sími"}</span>
          {compact ? (
            <input name="email" type="email" required autoComplete="email" className={`mt-1.5 ${input}`} placeholder="nafn@dæmi.is" />
          ) : (
            <input name="phone" type="tel" autoComplete="tel" className={`mt-1.5 ${input}`} placeholder="xxx xxxx" />
          )}
          {compact && state.fieldErrors?.email && <span className={errCls}>{state.fieldErrors.email}</span>}
        </label>

        {!compact && (
          <>
            <label className="block sm:col-span-2">
              <span className={label}>Netfang *</span>
              <input name="email" type="email" required autoComplete="email" className={`mt-1.5 ${input}`} placeholder="nafn@dæmi.is" />
              {state.fieldErrors?.email && <span className={errCls}>{state.fieldErrors.email}</span>}
            </label>
            <label className="block">
              <span className={label}>Tegund verkefnis</span>
              <select name="projectType" defaultValue={projectType ?? PROJECT_TYPES[0]} className={`mt-1.5 appearance-none ${input}`}>
                {PROJECT_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className={label}>Staðsetning verkefnis</span>
              <input name="address" autoComplete="off" className={`mt-1.5 ${input}`} placeholder="t.d. Borgarfjörður" />
            </label>
          </>
        )}

        {compact && (
          <label className="block">
            <span className={label}>Sími</span>
            <input name="phone" type="tel" autoComplete="tel" className={`mt-1.5 ${input}`} placeholder="xxx xxxx" />
          </label>
        )}

        <label className={`block ${compact ? "" : "sm:col-span-2"}`}>
          <span className={label}>{compact ? "Stutt lýsing *" : "Lýsing *"}</span>
          <textarea
            name="message"
            required
            rows={compact ? 4 : 5}
            className={`mt-1.5 w-full rounded-xl px-4 py-3 text-sm outline-none ${
              dark
                ? "border border-white/15 bg-white/5 text-white placeholder:text-white/35 focus:border-volt-400 focus:bg-white/10"
                : "border border-mist-300 bg-mist-50 text-ink-900 placeholder:text-ink-900/35 focus:border-brand-500 focus:bg-white"
            }`}
            placeholder={
              compact
                ? "Staðsetning, hvað þarf að keyra, rafstöð til staðar…"
                : "Hvaða tæki þarf að keyra, er rafstöð til staðar, hvað er stórt þak…"
            }
          />
          {state.fieldErrors?.message && <span className={errCls}>{state.fieldErrors.message}</span>}
        </label>

        {!compact && (
          <div className="sm:col-span-2">
            <span className={label}>Viðhengi</span>
            <label
              className={`mt-1.5 flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-dashed px-4 py-3 text-sm transition ${
                dark
                  ? "border-white/20 text-white/70 hover:border-volt-400"
                  : "border-mist-300 bg-mist-50 text-ink-900/70 hover:border-brand-500 hover:bg-white"
              }`}
            >
              <span>
                {files.length === 0
                  ? "Bættu við myndum, teikningum eða PDF"
                  : files.map((f) => f.name).join(", ")}
              </span>
              <span className={`shrink-0 text-xs ${muted}`}>mest 5 × 25 MB</span>
              <input
                type="file"
                name="attachments"
                multiple
                accept={ACCEPT}
                onChange={onFilesChange}
                className="sr-only"
              />
            </label>
            {(fileError || state.fieldErrors?.attachments) && (
              <span className={errCls}>{fileError ?? state.fieldErrors?.attachments}</span>
            )}
          </div>
        )}
      </div>

      {state.status === "error" && !state.fieldErrors && (
        <p
          className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {state.message}
        </p>
      )}

      <div className="mt-7 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={pending || !!fileError}
          className="group inline-flex h-12 items-center gap-2 rounded-full bg-brand-500 px-6 text-sm font-semibold text-white shadow-[0_8px_30px_-10px_rgb(18_136_202/0.8)] transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Sendi…
            </>
          ) : (
            <>
              {compact ? "Fá tilboð" : "Senda fyrirspurn"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>
        <span className={`text-xs ${muted}`}>Við deilum aldrei upplýsingunum þínum.</span>
      </div>
    </form>
  );
}
