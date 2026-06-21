import { Link } from "react-router-dom";
import { Facebook, Youtube, Instagram, Mail, Phone, MapPin, Navigation } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { BRANCHES } from "@/lib/branches";
import { useTranslation, useLanguage } from "@/lib/i18n";

export function Footer() {
  const { data: settings } = useSiteSettings();
  const tr = useTranslation();
  const { lang } = useLanguage();
  const f = tr.home.footer;

  return (
    <footer className="mt-16 border-t border-border bg-muted/30">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div>
            <Link to="/" className="inline-block">
              <img
                src={settings?.logo_url || "/icanbdlogo.webp"}
                alt="iCAN Academy"
                className="h-12 w-auto"
              />
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">
              iCAN Academy- iCAN Make It Possible
            </p>
            <div className="mt-4 flex gap-3">
              <a href="https://www.facebook.com/icanbdedu" target="_blank" rel="noreferrer"
                className="rounded-full bg-background p-2 text-muted-foreground transition-colors hover:bg-[#1877F2] hover:text-white" aria-label="Facebook">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="https://www.youtube.com/@ican_academy" target="_blank" rel="noreferrer"
                className="rounded-full bg-background p-2 text-muted-foreground transition-colors hover:bg-[#FF0000] hover:text-white" aria-label="YouTube">
                <Youtube className="h-4 w-4" />
              </a>
              <a href="https://www.instagram.com/icanacademybd" target="_blank" rel="noreferrer"
                className="rounded-full bg-background p-2 text-muted-foreground transition-colors hover:bg-[#E1306C] hover:text-white" aria-label="Instagram">
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-sm font-semibold text-foreground">{f.quickLinks}</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link to="/" className="text-muted-foreground hover:text-accent">{tr.nav.home}</Link></li>
              <li><Link to="/courses" className="text-muted-foreground hover:text-accent">{tr.nav.courses}</Link></li>
              <li><Link to="/products" className="text-muted-foreground hover:text-accent">{tr.nav.products}</Link></li>
              <li><Link to="/gallery" className="text-muted-foreground hover:text-accent">{tr.nav.gallery}</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-heading text-sm font-semibold text-foreground">{f.support}</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link to="/contact" className="text-muted-foreground hover:text-accent">{tr.nav.contact}</Link></li>
              <li><Link to="/about" className="text-muted-foreground hover:text-accent">{tr.nav.about}</Link></li>
              <li><Link to="/privacy" className="text-muted-foreground hover:text-accent">{f.privacy}</Link></li>
              <li><Link to="/refund" className="text-muted-foreground hover:text-accent">{f.refund}</Link></li>
            </ul>
          </div>

          {/* App Download & Community */}
          <div>
            <h4 className="font-heading text-sm font-semibold text-foreground">অ্যাপ ডাউনলোড করুন</h4>
            <div className="mt-3 space-y-2.5">
              {/* Google Play */}
              <a
                href="#"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2.5 transition-colors hover:border-accent hover:bg-accent/5"
              >
                <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0" fill="none">
                  <path d="M3.18 23.76c.27.15.57.24.9.24.32 0 .63-.08.9-.23l11.6-6.71-2.81-2.81L3.18 23.76z" fill="#EA4335"/>
                  <path d="M20.68 9.27l-2.62-1.52L14.77 11l3.29 3.29 2.62-1.52a1.49 1.49 0 0 0 0-2.5z" fill="#FBBC05"/>
                  <path d="M3.18.24A1.47 1.47 0 0 0 2.59 0C2.27 0 1.98.09 1.72.24L13.5 12 3.18.24z" fill="#4285F4"/>
                  <path d="M1.72.24C1.21.52.88 1.06.88 1.7v20.6c0 .64.33 1.18.84 1.46L13.5 12 1.72.24z" fill="#34A853"/>
                </svg>
                <div className="leading-tight">
                  <p className="text-[9px] uppercase tracking-wide text-muted-foreground">GET IT ON</p>
                  <p className="text-sm font-semibold text-foreground">Google Play</p>
                </div>
              </a>

              {/* App Store */}
              <a
                href="#"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2.5 transition-colors hover:border-accent hover:bg-accent/5"
              >
                <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0 text-foreground" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                <div className="leading-tight">
                  <p className="text-[9px] uppercase tracking-wide text-muted-foreground">DOWNLOAD ON THE</p>
                  <p className="text-sm font-semibold text-foreground">App Store</p>
                </div>
              </a>

              {/* Facebook Helpline Group */}
              <a
                href="#"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2.5 transition-colors hover:border-[#1877F2] hover:bg-[#1877F2]/5"
              >
                <Facebook className="h-6 w-6 shrink-0 text-[#1877F2]" />
                <div className="leading-tight">
                  <p className="text-[9px] uppercase tracking-wide text-muted-foreground">JOIN OUR</p>
                  <p className="text-sm font-semibold text-foreground">Helpline Group</p>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Branch boxes */}
        <div className="mt-10 border-t border-border pt-8">
          <h4 className="mb-5 font-heading text-base font-semibold text-foreground">
            {tr.home.branches.title}
          </h4>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {BRANCHES.map((branch) => (
              <div key={branch.name.en} className="rounded-lg border border-border bg-background p-4 text-sm">
                <p className="font-heading font-semibold text-foreground">{branch.name[lang]}</p>
                <ul className="mt-3 space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    <a href={`tel:${branch.phone}`} className="hover:text-accent">{branch.phone}</a>
                  </li>
                  <li className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    <a href={`mailto:${branch.email}`} className="hover:text-accent">{branch.email}</a>
                  </li>
                  <li className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>{branch.address[lang]}</span>
                  </li>
                </ul>
                <a href={branch.mapUrl} target="_blank" rel="noreferrer"
                  className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-md border border-border bg-muted/50 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-accent hover:bg-accent/10 hover:text-accent">
                  <Navigation className="h-3 w-3" />
                  {tr.home.branches.viewOnMap}
                </a>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          {f.rights}
        </div>
      </div>
    </footer>
  );
}
