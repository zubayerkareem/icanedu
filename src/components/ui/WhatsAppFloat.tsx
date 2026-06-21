import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";

const DEPARTMENTS = [
  {
    label: "ISSB Support",
    sublabel: "আইএসএসবি প্রস্তুতি",
    number: "8801894734002",
    color: "bg-emerald-600",
    text: "text-white",
  },
  {
    label: "Cadet Support",
    sublabel: "ক্যাডেট কোচিং",
    number: "8801894734003",
    color: "bg-sky-600",
    text: "text-white",
  },
  {
    label: "E-Commerce",
    sublabel: "প্রোডাক্ট অর্ডার হেল্পলাইন",
    number: "8801894734004",
    color: "bg-violet-600",
    text: "text-white",
  },
  {
    label: "Other Courses",
    sublabel: "অন্যান্য কোর্স",
    number: "8801894734005",
    color: "bg-orange-500",
    text: "text-white",
  },
];

export function WhatsAppFloat() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [open]);

  return (
    <div ref={ref} className="fixed bottom-6 right-5 z-50 flex flex-col items-end gap-3">
      {/* Department cards */}
      {open && (
        <div className="mb-1 flex flex-col gap-2">
          {DEPARTMENTS.map((dep) => (
            <a
              key={dep.number}
              href={`https://wa.me/${dep.number}?text=হ্যালো%2C%20আমি%20${encodeURIComponent(dep.label)}%20সম্পর্কে%20জানতে%20চাই।`}
              target="_blank"
              rel="noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-2.5 shadow-lg transition-transform hover:-translate-y-0.5 hover:shadow-xl"
            >
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${dep.color} ${dep.text}`}>
                <WhatsAppIcon className="h-4 w-4" />
              </span>
              <div className="min-w-[130px] leading-tight">
                <p className="text-sm font-semibold text-foreground">{dep.label}</p>
                <p className="text-xs text-muted-foreground">{dep.sublabel}</p>
              </div>
            </a>
          ))}
        </div>
      )}

      {/* Main FAB */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="WhatsApp Support"
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110 focus:outline-none"
      >
        {/* Pulse rings */}
        {!open && (
          <>
            <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-40 animate-ping" />
            <span className="absolute inset-0 scale-125 rounded-full bg-[#25D366] opacity-20 animate-ping [animation-delay:0.3s]" />
          </>
        )}
        <span className="relative z-10">
          {open ? <X className="h-6 w-6" /> : <WhatsAppIcon className="h-7 w-7" />}
        </span>
      </button>
    </div>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
    </svg>
  );
}
