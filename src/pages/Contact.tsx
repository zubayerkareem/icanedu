import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const BRANCHES = [
  {
    name: "রংপুর শাখা",
    address: "iCAN Building, Lalkuthi More, Rangpur",
    phone: "01894734005",
  },
  {
    name: "মিরপুর ১২ শাখা",
    address: "House 73, 2nd Floor, Rd No. 6, Pallabi Metro, Mirpur Dhaka 1216",
    phone: "01894734003",
  },
  {
    name: "ফার্মগেট শাখা",
    address: "Room No-212-213, RH Home Center, Green Road, Farmgate",
    phone: "01894734002",
  },
];

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: wire up form submission
  };

  return (
    <>
      {/* Page header */}
      <section className="border-b border-border bg-gradient-to-b from-muted/40 to-background">
        <div className="container py-10 sm:py-14">
          <nav aria-label="breadcrumb" className="text-sm text-muted-foreground">
            <ol className="flex items-center gap-2">
              <li>
                <Link to="/" className="hover:text-foreground">
                  হোম
                </Link>
              </li>
              <li aria-hidden>›</li>
              <li className="text-foreground">যোগাযোগ করুন</li>
            </ol>
          </nav>
          <h1 className="mt-3 font-heading text-3xl font-bold text-foreground sm:text-4xl">
            যোগাযোগ করুন
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            আমাদের সম্পর্কে আরও জানুন
          </p>
        </div>
      </section>

      <section className="py-10 sm:py-14">
        <div className="container">
          <div className="grid gap-10 lg:grid-cols-2">

            {/* LEFT — contact info */}
            <div className="space-y-10">

              {/* Phone Numbers */}
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                    <Phone className="h-5 w-5 text-accent" />
                  </div>
                  <h2 className="font-heading text-xl font-bold text-foreground">
                    ফোন নম্বর
                  </h2>
                </div>
                <ul className="space-y-3">
                  <li className="text-sm">
                    <p className="font-medium text-foreground">রংপুর শাখা: <a href="tel:01894734005" className="text-muted-foreground hover:text-accent transition-colors font-normal">01894734005</a></p>
                  </li>
                  <li className="text-sm">
                    <p className="font-medium text-foreground">মিরপুর ১২ শাখা : <a href="tel:01894734003" className="text-muted-foreground hover:text-accent transition-colors font-normal">01894734003</a></p>
                  </li>
                  <li className="text-sm">
                    <p className="font-medium text-foreground">ফার্মগেট শাখা : <a href="tel:01894734002" className="text-muted-foreground hover:text-accent transition-colors font-normal">01894734002</a></p>
                  </li>
                </ul>
              </div>

              {/* Email */}
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                    <Mail className="h-5 w-5 text-accent" />
                  </div>
                  <h2 className="font-heading text-xl font-bold text-foreground">
                    ইমেইল এড্রেস
                  </h2>
                </div>
                <a
                  href="mailto:icanedu23@gmail.com"
                  className="text-sm text-muted-foreground hover:text-accent transition-colors"
                >
                  icanedu23@gmail.com
                </a>
              </div>

              {/* Locations */}
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                    <MapPin className="h-5 w-5 text-accent" />
                  </div>
                  <h2 className="font-heading text-xl font-bold text-foreground">
                    আমাদের শাখাসমূহ
                  </h2>
                </div>
                <div className="grid gap-4">
                  {BRANCHES.map((b) => (
                    <div
                      key={b.name}
                      className="rounded-lg border border-border bg-card p-4 shadow-sm"
                    >
                      <p className="font-heading font-semibold text-foreground text-sm">
                        {b.name}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">{b.address}</p>
                      <a
                        href={`tel:${b.phone}`}
                        className="mt-1 text-sm text-accent hover:underline"
                      >
                        {b.phone}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT — contact form */}
            <div>
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
                <h2 className="font-heading text-xl font-bold text-foreground mb-6">
                  বার্তা পাঠান
                </h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">পূর্ণ নাম</Label>
                    <Input
                      id="name"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="আপনার পূর্ণ নাম"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">ইমেইল এড্রেস</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone">ফোন নম্বর</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="01XXXXXXXXX"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="subject">বিষয়</Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      placeholder="বার্তার বিষয়"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="message">আপনার বার্তা</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      placeholder="এখানে আপনার বার্তা লিখুন..."
                      rows={5}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    জমা দিন
                  </Button>
                </form>
              </div>
            </div>
          </div>

          {/* Map button */}
          <div className="mt-14 flex justify-center">
            <Button asChild size="lg">
              <a
                href="https://maps.google.com/?q=iCAN+Education,+Pallabi+Metro,+Mirpur,+Dhaka"
                target="_blank"
                rel="noreferrer"
              >
                <MapPin className="mr-2 h-5 w-5" />
                গুগল ম্যাপে আমাদের দেখুন
              </a>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
