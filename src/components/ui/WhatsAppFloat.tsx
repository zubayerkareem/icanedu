import { useState } from "react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

/** Converts a local BD number like "01XXXXXXXXX" to international wa.me format "880XXXXXXXXX" */
function toWaNumber(raw: string) {
  const digits = raw.replace(/\D/g, "");
  return digits.startsWith("880") ? digits : `880${digits.replace(/^0/, "")}`;
}

interface SupportWaContact {
  title: string;
  number: string;
  icon: string;
}

export function WhatsAppFloat() {
  const { data: settings = [] } = useSiteSettings();
  const [open, setOpen] = useState(false);

  const find = (key: string) => settings.find((s) => s.key === key)?.value?.trim() ?? "";

  const whatsapp  = find("whatsapp_number");
  const facebook  = find("facebook_group_url");
  const playstore = find("playstore_url");
  const appstore  = find("appstore_url");

  // Parse multi-contact WhatsApp list
  let supportContacts: SupportWaContact[] = [];
  try {
    const raw = find("support_whatsapp_contacts");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        supportContacts = (parsed as SupportWaContact[]).filter(
          (c) => c.title?.trim() && c.number?.trim()
        );
      }
    }
  } catch { /* ignore malformed */ }

  const hasMultiContact = supportContacts.length > 0;

  // Nothing to show
  if (!whatsapp && !facebook && !playstore && !appstore && !hasMultiContact) return null;

  return (
    <>
      {/* Click-away overlay to close panel */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="fixed bottom-6 right-5 z-50 flex flex-col items-end gap-3">

        {/* ── Multi-contact expandable panel ─────────────────────── */}
        {hasMultiContact && open && (
          <div className="mb-1 flex flex-col gap-2 items-end">
            {/* Panel heading */}
            <div className="rounded-xl bg-white dark:bg-zinc-900 border border-border shadow-xl px-4 py-2.5">
              <p className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">
                সাপোর্টে যোগাযোগ করুন
              </p>
            </div>
            {/* Contacts list */}
            {supportContacts.map((c, i) => (
              <a
                key={i}
                href={`https://wa.me/${toWaNumber(c.number)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-2xl bg-white dark:bg-zinc-900 border border-green-200 dark:border-green-800 shadow-lg px-4 py-3 pr-5 min-w-[180px] transition-transform hover:scale-[1.03] hover:border-green-400"
              >
                <span className="text-2xl leading-none shrink-0">{c.icon || "💬"}</span>
                <span className="text-sm font-semibold text-foreground">{c.title}</span>
                <span className="ml-auto text-green-600">
                  <WhatsAppIcon className="h-4 w-4" />
                </span>
              </a>
            ))}
          </div>
        )}

        {/* App Store */}
        {appstore && (
          <a
            href={appstore}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="App Store"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-800 text-white shadow-lg transition-transform hover:scale-110"
            title="App Store"
          >
            <AppleIcon className="h-6 w-6" />
          </a>
        )}

        {/* Play Store */}
        {playstore && (
          <a
            href={playstore}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Play Store"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-gray-800 shadow-lg transition-transform hover:scale-110 border border-gray-200"
            title="Google Play Store"
          >
            <PlayStoreIcon className="h-6 w-6" />
          </a>
        )}

        {/* Facebook */}
        {facebook && (
          <a
            href={facebook}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook Group"
            className="flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-110"
            style={{ backgroundColor: "#1877F2" }}
            title="Facebook গ্রুপ"
          >
            <FacebookIcon className="h-6 w-6" />
          </a>
        )}

        {/* ── WhatsApp button ──────────────────────────────────────── */}
        {hasMultiContact ? (
          /* Multi-contact mode: pulsing toggle button */
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="WhatsApp সাপোর্ট"
            title="সাপোর্টে যোগাযোগ করুন"
            className="relative flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-110 focus:outline-none"
            style={{ backgroundColor: "#25D366" }}
          >
            {/* Pulse rings — only when panel is closed */}
            {!open && (
              <>
                <span className="absolute inset-0 rounded-full opacity-40 animate-ping" style={{ backgroundColor: "#25D366" }} />
                <span className="absolute inset-0 scale-125 rounded-full opacity-20 animate-ping [animation-delay:0.3s]" style={{ backgroundColor: "#25D366" }} />
              </>
            )}
            <span className="relative z-10">
              {open ? (
                /* X icon when open */
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <WhatsAppIcon className="h-7 w-7" />
              )}
            </span>
          </button>
        ) : whatsapp ? (
          /* Single-contact fallback */
          <a
            href={`https://wa.me/${toWaNumber(whatsapp)}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="relative flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-110"
            style={{ backgroundColor: "#25D366" }}
            title="WhatsApp"
          >
            <span className="absolute inset-0 rounded-full opacity-40 animate-ping" style={{ backgroundColor: "#25D366" }} />
            <span className="absolute inset-0 scale-125 rounded-full opacity-20 animate-ping [animation-delay:0.3s]" style={{ backgroundColor: "#25D366" }} />
            <span className="relative z-10">
              <WhatsAppIcon className="h-7 w-7" />
            </span>
          </a>
        ) : null}
      </div>
    </>
  );
}

/* ── SVG icons ─────────────────────────────────────────────────── */

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

function PlayStoreIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M3.18 23.76a1.5 1.5 0 0 0 .93-.3l12.1-7.04-2.67-2.67-10.36 10z" fill="#EA4335"/>
      <path d="M21.12 10.34L18.28 8.7l-2.97 2.97 2.97 2.97 2.87-1.67a1.5 1.5 0 0 0 0-2.63z" fill="#FBBC04"/>
      <path d="M3.18.24a1.5 1.5 0 0 0-.93 1.37v20.78a1.5 1.5 0 0 0 .93 1.37L14.54 12z" fill="#4285F4"/>
      <path d="M15.31 12l2.97-2.97L6.1.23a1.5 1.5 0 0 0-1.53.02L15.3 12z" fill="#34A853"/>
    </svg>
  );
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
  );
}
