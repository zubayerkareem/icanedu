import { useTranslation } from "@/lib/i18n";
import { useHomepageSuccessStories } from "@/hooks/useSuccessStories";

const FALLBACK = [
  { id: "f1", image_url: "/7d8406ab-c3b7-4ca5-afc1-35c280e7809d.jpeg", name: "110+ Green Card Achievements | 94 BMA", description: "" },
  { id: "f2", image_url: "/263925f5-4614-4fd7-9f76-e81cbb2c598f.jpeg", name: "350+ Green Card Achievements | Success Reloaded (2024–25)", description: "" },
  { id: "f3", image_url: "/84b0e899-dc1c-48d6-bbb5-b66e1dcc3cb7.jpeg", name: "Shining Stars of 2025: 18 Students Secure Seats in Cadet College!", description: "" },
  { id: "f4", image_url: "/effcf2a8-0776-4456-a3dd-5c34a9429127.jpeg", name: "Shining Stars of 2024: 13 Students Secure Seats in Cadet College!", description: "" },
  { id: "f5", image_url: "/88775003-a6dd-488f-a279-610129e6cece.jpeg", name: "BUP HUNT Family Expands", description: "Besides BUP, Bangabandhu Sheikh Mujibur Rahman Maritime University (BSMRMU) 5 more students from BUP HUNT family got chances in different faculties." },
  { id: "f6", image_url: "/7f2aac9a-4e88-4f60-b9f8-7d19558f32d4.jpeg", name: "Alhamdulillah — First BUP HUNT Batch", description: "The first batch of BUP HUNT was an incredible success. 50% success rate — 10 people got chance in different faculties in BUP." },
];

export function SuccessStoriesSection() {
  const tr = useTranslation();
  const { title, subtitle } = tr.home.success;
  const { data: dbStories } = useHomepageSuccessStories();
  const items = dbStories && dbStories.length > 0 ? dbStories : FALLBACK;

  return (
    <section className="py-12 sm:py-16">
      <div className="container">
        <div className="mb-8 text-center">
          <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
            {title}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            {subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((a) => (
            <div
              key={a.id}
              className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              {a.image_url && (
                <div className="w-full overflow-hidden rounded-lg bg-muted">
                  <img
                    src={a.image_url}
                    alt={a.name}
                    className="w-full h-auto object-contain"
                  />
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-foreground">{a.name}</p>
                {a.description && (
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                    {a.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
