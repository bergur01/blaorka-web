import { NextResponse } from "next/server";
import { footerColumns, navigation, site } from "@/content/site";

// Opinber valmynd og fótur vefsins sem JSON.
// Vefverslunin (PayGo storefront) sækir þetta og birtir sömu valmynd og fót
// svo kynningarvefur og verslun líti út sem einn vefur – hér er eini sannleikurinn.
//
// Snið (útgáfa 1):
// { version, site: { name, url, logo, phone, email }, nav: [{ label, url, children? }], footer: [{ title, links: [{ label, url }] }] }

export const revalidate = 300;

const abs = (href: string) => (href.startsWith("http") ? href : `${site.url}${href}`);

export function GET() {
  const body = {
    version: 1,
    site: {
      name: site.name,
      url: site.url,
      logo: `${site.url}/brand/blaorka-logo-on-black-1400x190.png`,
      phone: site.phone,
      email: site.email,
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
