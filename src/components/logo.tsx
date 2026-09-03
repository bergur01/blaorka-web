import Image from "next/image";

/**
 * Eldingarkubburinn úr vörumerki Bláorku – endurteiknaður sem SVG
 * svo hann skalist skarpt í öllum stærðum.
 */
export function LogoMark({
  className = "h-9 w-auto",
  dark = false,
}: {
  className?: string;
  dark?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 130 100"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <clipPath id="lm-clip">
          <rect width="130" height="100" rx="18" />
        </clipPath>
      </defs>
      <g clipPath="url(#lm-clip)">
        <rect width="65" height="100" fill="#1288ca" />
        <rect x="65" width="65" height="100" fill={dark ? "#ffffff" : "#050b14"} />
        {/* Elding */}
        <path
          d="M38 0 L72 0 L58 44 L104 44 L44 100 L26 100 L56 56 L20 56 Z"
          fill={dark ? "#050b14" : "#ffffff"}
        />
      </g>
    </svg>
  );
}

/**
 * Fullt vörumerki (orðmerki). Notar upprunalegar PNG-myndir af blaorka.is
 * þar til vektor-útgáfa fæst.
 */
export function Logo({
  variant = "dark",
  className = "h-8 w-auto",
  priority = false,
}: {
  variant?: "dark" | "light";
  className?: string;
  priority?: boolean;
}) {
  const src =
    variant === "dark"
      ? "/brand/blaorka-logo-on-black-1400x190.png"
      : "/brand/Blaorka-medium-on-white.png";
  return (
    <Image
      src={src}
      alt="Bláorka"
      width={1020}
      height={138}
      priority={priority}
      className={className}
    />
  );
}
