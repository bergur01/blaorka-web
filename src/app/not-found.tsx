import { Button, Container } from "@/components/ui";
import { LogoMark } from "@/components/logo";

export default function NotFound() {
  return (
    <section className="relative flex min-h-dvh items-center overflow-hidden bg-ink-900 pt-20 text-white">
      <div className="absolute inset-0 bg-grid-dark [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_70%)]" />
      <div className="absolute left-1/2 top-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500/20 blur-[120px] animate-aurora" />
      <Container className="relative text-center">
        <LogoMark className="anim-scale mx-auto h-14 w-auto" />
        <p className="mt-8 animate-flicker font-display text-7xl font-semibold tracking-tight text-white">404</p>
        <h1 className="mt-2 font-display text-3xl font-semibold">Rafmagnslaust hér</h1>
        <p className="mx-auto mt-3 max-w-md text-white/60">
          Síðan fannst ekki. Hún hefur annað hvort verið færð eða slóðin er röng.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button href="/">Á forsíðu</Button>
          <Button href="/frettir" variant="outline">
            Fréttir
          </Button>
        </div>
      </Container>
    </section>
  );
}
