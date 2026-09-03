import type { IconName } from "@/lib/types";

// Línutákn (24×24, stroke) – samræmd við útlit vefsins.

type Props = React.SVGProps<SVGSVGElement> & { name: IconName };

const paths: Record<IconName, React.ReactNode> = {
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </>
  ),
  battery: (
    <>
      <rect x="2" y="7" width="18" height="10" rx="2" />
      <path d="M22 11v2M6 11v2M10 11v2M14 11v2" />
    </>
  ),
  bolt: <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />,
  home: (
    <>
      <path d="m3 11 9-8 9 8" />
      <path d="M5 10v10h14V10" />
      <path d="M10 20v-6h4v6" />
    </>
  ),
  van: (
    <>
      <path d="M3 7h11v10H3zM14 10h4l3 3v4h-7z" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
    </>
  ),
  tower: (
    <>
      <path d="M12 2v20M8 22h8M9 8h6M8 13h8M7 18h10" />
      <path d="M4 6a11 11 0 0 1 16 0M6.5 8.5a7.5 7.5 0 0 1 11 0" />
    </>
  ),
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  panel: (
    <>
      <rect x="3" y="4" width="18" height="12" rx="1.5" />
      <path d="M9 4v12M15 4v12M3 10h18M12 16v4M8 20h8" />
    </>
  ),
  wave: (
    <>
      <path d="M2 12c2-5 4-5 6 0s4 5 6 0 4-5 6 0" />
      <path d="M2 17h20M2 7h20" strokeOpacity=".35" />
    </>
  ),
  cable: (
    <>
      <path d="M4 6h5a3 3 0 0 1 3 3v6a3 3 0 0 0 3 3h5" />
      <path d="M2 4h4v4H2zM18 16h4v4h-4z" />
    </>
  ),
  gauge: (
    <>
      <path d="M4 18a9 9 0 1 1 16 0" />
      <path d="m12 14 4-5" />
      <circle cx="12" cy="14" r="1.5" />
    </>
  ),
  wind: (
    <>
      <path d="M3 8h11a3 3 0 1 0-3-3" />
      <path d="M3 13h15a3 3 0 1 1-3 3" />
      <path d="M3 18h7" />
    </>
  ),
  question: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .8-1 1.7M12 17h.01" />
    </>
  ),
};

export function Icon({ name, ...rest }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {paths[name]}
    </svg>
  );
}

export function ArrowRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function ExternalArrow(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M7 17 17 7M9 7h8v8" />
    </svg>
  );
}
