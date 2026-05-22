import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { FaqConfig } from "@/lib/page-builder/types";

export function FaqSection({ config }: { config: FaqConfig }) {
  return (
    <section className="py-12 sm:py-16">
      <div className="container max-w-3xl">
        <h2 className="mb-8 text-center font-heading text-2xl font-bold text-foreground sm:text-3xl">
          {config.heading}
        </h2>
        <Accordion type="single" collapsible className="w-full">
          {config.items.map((it, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger className="text-left font-semibold text-foreground">
                {it.question}
              </AccordionTrigger>
              <AccordionContent className="font-body text-muted-foreground">
                {it.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
