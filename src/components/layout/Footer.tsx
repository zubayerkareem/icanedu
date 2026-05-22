import { Link } from "react-router-dom";
import { Facebook, Youtube, Send, Mail, Phone, MapPin } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { t } from "@/lib/strings";

export function Footer() {
  const { data: settings } = useSiteSettings();

  return (
    <footer className="mt-16 border-t border-border bg-muted/30">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to="/" className="inline-block">
              <img
                src={settings?.logo_url || "/icanbdlogo.webp"}
                alt={t.brand.name}
                className="h-12 w-auto"
              />
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">
              {settings?.tagline || t.brand.tagline}
            </p>
            <div className="mt-4 flex gap-3">
              {settings?.facebook_url && (
                <a
                  href={settings.facebook_url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-background p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  aria-label="Facebook"
                >
                  <Facebook className="h-4 w-4" />
                </a>
              )}
              {settings?.youtube_url && (
                <a
                  href={settings.youtube_url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-background p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  aria-label="YouTube"
                >
                  <Youtube className="h-4 w-4" />
                </a>
              )}
              {settings?.telegram_url && (
                <a
                  href={settings.telegram_url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-background p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  aria-label="Telegram"
                >
                  <Send className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-heading text-sm font-semibold text-foreground">
              {t.footer.quickLinks}
            </h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link to="/" className="text-muted-foreground hover:text-accent">{t.nav.home}</Link></li>
              <li><Link to="/courses" className="text-muted-foreground hover:text-accent">{t.nav.courses}</Link></li>
              <li><Link to="/products" className="text-muted-foreground hover:text-accent">{t.nav.products}</Link></li>
              <li><Link to="/gallery" className="text-muted-foreground hover:text-accent">{t.nav.gallery}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-sm font-semibold text-foreground">
              {t.footer.support}
            </h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link to="/contact" className="text-muted-foreground hover:text-accent">{t.nav.contact}</Link></li>
              <li><Link to="/about" className="text-muted-foreground hover:text-accent">{t.nav.about}</Link></li>
              <li><Link to="/privacy" className="text-muted-foreground hover:text-accent">{t.footer.privacy}</Link></li>
              <li><Link to="/refund" className="text-muted-foreground hover:text-accent">{t.footer.refund}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-sm font-semibold text-foreground">
              {t.footer.contactInfo}
            </h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Phone className="mt-0.5 h-4 w-4 shrink-0" />
                <span>মিরপুর ১২: 01894734003</span>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="mt-0.5 h-4 w-4 shrink-0" />
                <a href="mailto:icanedu23@gmail.com" className="hover:text-accent">
                  icanedu23@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span>Pallabi Metro, Mirpur, Dhaka</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Branch boxes */}
        <div className="mt-10 border-t border-border pt-8">
          <h4 className="mb-5 font-heading text-base font-semibold text-foreground">আমাদের শাখাসমূহ</h4>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                name: "রংপুর শাখা",
                phone: "01894734005",
                email: "icanedu23@gmail.com",
                address: "Lalkuthi More, Rangpur",
              },
              {
                name: "মিরপুর শাখা",
                phone: "01894734003",
                email: "icanedu23@gmail.com",
                address: "Pallabi Metro, Mirpur, Dhaka",
              },
              {
                name: "ফার্মগেট শাখা",
                phone: "01894734002",
                email: "icanedu23@gmail.com",
                address: "RH Home Center, Farmgate, Dhaka",
              },
            ].map((branch) => (
              <div
                key={branch.name}
                className="rounded-lg border border-border bg-background p-4 text-sm"
              >
                <p className="font-heading font-semibold text-foreground">{branch.name}</p>
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
                    <span>{branch.address}</span>
                  </li>
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          {t.footer.rights}
        </div>
      </div>
    </footer>
  );
}
