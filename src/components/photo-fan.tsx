import Image from "next/image";

/**
 * Þrjár ljósmyndir sem raðast út úr bunka eins og prentuð myndaspjöld og
 * vagga svo hægt. HTML + next/image (svo myndirnar séu bjartsýnaðar) + CSS.
 * Notað á Verkefni-síðunni.
 */
const photos = [
  { src: "/gallery/11.webp", alt: "Sólarsellur á grind úti í náttúrunni", rotate: -10, x: -34, y: 10, d: 0.35 },
  { src: "/gallery/37.webp", alt: "Uppsetning á sólarsellum", rotate: 7, x: 34, y: 20, d: 0.55 },
  { src: "/gallery/17.webp", alt: "Rafgeymabanki og Victron búnaður", rotate: -2, x: 0, y: -8, d: 0.75 },
];

export function PhotoFan({ className = "" }: { className?: string }) {
  return (
    <div className={`pf relative mx-auto aspect-[4/3] w-full max-w-[26rem] ${className}`} role="img" aria-label="Myndir úr uppsetningum Bláorku">
      <style>{`
        .pf-card { animation: pf-in 1.1s cubic-bezier(.2,.8,.2,1) backwards, pf-float 7s ease-in-out infinite; animation-delay: var(--d), calc(var(--d) + 1.1s); }
        @keyframes pf-in { from { opacity: 0; transform: translate(0, 60px) rotate(0deg) scale(.85); } to { opacity: 1; transform: translate(var(--x), var(--y)) rotate(var(--r)) scale(1); } }
        @keyframes pf-float { 0%,100% { transform: translate(var(--x), var(--y)) rotate(var(--r)); } 50% { transform: translate(var(--x), calc(var(--y) - 8px)) rotate(calc(var(--r) + 1.5deg)); } }
        .pf-flash { animation: pf-flash 1.1s ease-out .9s backwards; opacity: 0; }
        @keyframes pf-flash { 0% { opacity: 0; } 15% { opacity: .9; } 100% { opacity: 0; } }
      `}</style>
      <div className="absolute inset-0 rounded-full bg-brand-500/20 blur-[60px]" />
      {photos.map((p) => (
        <div
          key={p.src}
          className="pf-card absolute left-[19%] top-[10%] w-[62%] rounded-xl bg-white p-2 pb-8 shadow-[0_30px_60px_-20px_rgb(0_0_0/0.6)]"
          style={
            {
              "--x": `${p.x}%`,
              "--y": `${p.y}%`,
              "--r": `${p.rotate}deg`,
              "--d": `${p.d}s`,
            } as React.CSSProperties
          }
        >
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-ink-800">
            <Image src={p.src} alt={p.alt} fill sizes="260px" className="object-cover" />
          </div>
        </div>
      ))}
      <div className="pf-flash pointer-events-none absolute inset-0 rounded-3xl bg-white" />
    </div>
  );
}
