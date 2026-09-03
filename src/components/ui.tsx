import Link from "next/link";
import { ArrowRight, ExternalArrow } from "./icons";

// ---------- Uppbygging ----------

export function Container({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={`container-x ${className}`}>{children}</div>;
}

export function Section({
  id,
  tone = "light",
  className = "",
  children,
}: {
  id?: string;
  tone?: "light" | "white" | "dark";
  className?: string;
  children: React.ReactNode;
}) {
  const tones = {
    light: "bg-mist-50 text-ink-900",
    white: "bg-white text-ink-900",
    dark: "bg-ink-900 text-white",
  };
  return (
    <section
      id={id}
      className={`relative py-20 sm:py-24 lg:py-28 ${tones[tone]} ${className}`}
    >
      {children}
    </section>
  );
}

// ---------- Texti ----------

export function Eyebrow({
  children,
  tone = "brand",
  className = "",
}: {
  children: React.ReactNode;
  tone?: "brand" | "volt" | "muted";
  className?: string;
}) {
  const tones = {
    brand: "text-brand-500",
    volt: "text-volt-400",
    muted: "text-ink-900/50",
  };
  return (
    <p
      className={`inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] ${tones[tone]} ${className}`}
    >
      <span className="h-px w-6 bg-current opacity-60" aria-hidden="true" />
      {children}
    </p>
  );
}

export function Heading({
  as: Tag = "h2",
  size = "lg",
  className = "",
  children,
}: {
  as?: "h1" | "h2" | "h3" | "h4";
  size?: "xl" | "lg" | "md" | "sm";
  className?: string;
  children: React.ReactNode;
}) {
  const sizes = {
    xl: "text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.02] tracking-[-0.03em]",
    lg: "text-3xl sm:text-4xl lg:text-5xl leading-[1.06] tracking-[-0.025em]",
    md: "text-2xl sm:text-3xl leading-tight tracking-[-0.02em]",
    sm: "text-xl sm:text-2xl leading-snug tracking-[-0.015em]",
  };
  return (
    <Tag className={`font-display font-semibold text-balance ${sizes[size]} ${className}`}>
      {children}
    </Tag>
  );
}

export function Lead({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <p className={`text-lg sm:text-xl leading-relaxed text-pretty ${className}`}>
      {children}
    </p>
  );
}

// ---------- Hnappar ----------

type ButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "outline" | "outline-dark";
  size?: "md" | "lg";
  external?: boolean;
  arrow?: boolean;
  className?: string;
};

export function Button({
  href,
  children,
  variant = "primary",
  size = "md",
  external = false,
  arrow = true,
  className = "",
}: ButtonProps) {
  const base =
    "group inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 whitespace-nowrap";
  const sizes = {
    md: "h-11 px-5 text-sm",
    lg: "h-13 px-7 text-base",
  };
  const variants = {
    primary:
      "bg-brand-500 text-white hover:bg-brand-400 shadow-[0_8px_30px_-10px_rgb(18_136_202/0.8)] hover:shadow-[0_12px_36px_-10px_rgb(32_202_225/0.8)] hover:-translate-y-0.5",
    secondary:
      "bg-white text-ink-900 hover:bg-mist-100 border border-mist-200 hover:-translate-y-0.5",
    ghost: "text-white/85 hover:text-white hover:bg-white/8",
    outline:
      "border border-white/25 text-white hover:border-volt-400 hover:text-volt-300 backdrop-blur",
    "outline-dark":
      "border border-ink-900/15 text-ink-900 hover:border-brand-500 hover:text-brand-600",
  };
  const cls = `${base} ${sizes[size]} ${variants[variant]} ${className}`;
  const icon = arrow ? (
    external ? (
      <ExternalArrow className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    ) : (
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
    )
  ) : null;

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {children}
        {icon}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
      {icon}
    </Link>
  );
}

export function TextLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-1.5 font-semibold text-brand-500 hover:text-brand-600 ${className}`}
    >
      {children}
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
    </Link>
  );
}

// ---------- Kort & merki ----------

export function Card({
  className = "",
  children,
  tone = "light",
}: {
  className?: string;
  children: React.ReactNode;
  tone?: "light" | "dark";
}) {
  const tones = {
    light: "bg-white border border-mist-200 shadow-card",
    dark: "glass",
  };
  return (
    <div className={`rounded-3xl ${tones[tone]} ${className}`}>{children}</div>
  );
}

export function Badge({
  children,
  tone = "brand",
  className = "",
}: {
  children: React.ReactNode;
  tone?: "brand" | "volt" | "neutral" | "dark";
  className?: string;
}) {
  const tones = {
    brand: "bg-brand-50 text-brand-700 ring-brand-200",
    volt: "bg-volt-500/15 text-volt-300 ring-volt-500/30",
    neutral: "bg-mist-100 text-ink-700 ring-mist-200",
    dark: "bg-white/10 text-white ring-white/15",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ring-1 ring-inset ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

// ---------- Síðuhaus fyrir undirsíður ----------

export function PageHero({
  eyebrow,
  title,
  lead,
  children,
  compact = false,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  children?: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <section
      className={`relative overflow-hidden bg-ink-900 text-white ${
        compact ? "pt-32 pb-14 sm:pt-36 sm:pb-16" : "pt-36 pb-20 sm:pt-44 sm:pb-24"
      }`}
    >
      <div className="absolute inset-0 bg-grid-dark [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" />
      <div className="absolute -top-40 left-1/2 h-[32rem] w-[60rem] -translate-x-1/2 rounded-full bg-brand-500/25 blur-[120px]" />
      <div className="absolute top-10 right-[-10rem] h-72 w-72 rounded-full bg-volt-500/20 blur-[90px] animate-float" />
      <Container className="relative">
        <div className="max-w-3xl">
          {eyebrow && (
            <Eyebrow tone="volt" className="mb-5">
              {eyebrow}
            </Eyebrow>
          )}
          <Heading as="h1" size="xl">
            {title}
          </Heading>
          {lead && <Lead className="mt-6 text-white/70 max-w-2xl">{lead}</Lead>}
          {children && <div className="mt-8">{children}</div>}
        </div>
      </Container>
    </section>
  );
}

// ---------- Skeleton-merking ----------

export function WipNote({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-dashed border-brand-300/60 bg-brand-50/60 px-4 py-3 text-sm text-brand-800">
      <span className="mt-0.5 inline-block h-2 w-2 shrink-0 animate-pulse-slow rounded-full bg-brand-500" />
      <p>{children ?? "Í vinnslu – virkni kemur þegar gagnagrunnur hefur verið tengdur."}</p>
    </div>
  );
}
