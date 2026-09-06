import { NextResponse } from "next/server";
import { footerColumns, navigation, site } from "@/content/site";

// Opinber valmynd og fótur vefsins sem JSON.
// Vefverslunin (PayGo storefront) sækir þetta og birtir sömu valmynd og fót
// svo kynningarvefur og verslun líti út sem einn vefur – hér er eini sannleikurinn.
//
// Snið (útgáfa 1):
// { version, site: { name, url, logo, tagline, description, address, phone, email, social }, nav: [{ label, url, children? }], footer: [{ title, links: [{ label, url }] }] }

export const dynamic = "force-dynamic";

/** Slóð vefsins sem svarar – virkar jafnt á new.blaorka.is (staging) og blaorka.is. */
function originOf(request: Request): string {
  const h = request.headers;
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  if (host && !/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host)) return `${proto}://${host}`;
  return host ? `http://${host}` : site.url;
}

export function GET(request: Request) {
  const origin = originOf(request);
  const abs = (href: string) => (href.startsWith("http") ? href : `${origin}${href}`);
  const body = {
    version: 1,
    site: {
      name: site.name,
      url: origin,
      logo: `${origin}/brand/blaorka-logo-on-black-1400x190.png`,
      tagline: site.tagline,
      description: site.description,
      address: `${site.address.street}, ${site.address.postal} ${site.address.city}`,
      phone: site.phone,
      email: site.email,
      social: { facebook: site.social.facebook },
    },
    nav: navigation.map((n) => ({ label: n.label, url: abs(n.href) })),
    footer: footerColumns.map((c) => ({
      title: c.title,
      links: c.links.map((l) => ({ label: l.label, url: abs(l.href) })),
    })),
  };
  return NextResponse.json(body, {
    headers: {
      "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=3600",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
