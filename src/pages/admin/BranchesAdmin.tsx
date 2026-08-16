import { useState } from "react";
import { Plus, Trash2, Save, ChevronDown, ChevronRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  useAdminBranches,
  useUpsertBranch,
  useDeleteBranch,
} from "@/hooks/useAdminBranches";
import type { Branch } from "@/hooks/useBranches";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

function BranchFormFields({
  nameEn, setNameEn, nameBn, setNameBn,
  addressEn, setAddressEn, addressBn, setAddressBn,
  phone, setPhone, email, setEmail,
  mapUrl, setMapUrl, orderIndex, setOrderIndex,
}: {
  nameEn: string; setNameEn: (v: string) => void;
  nameBn: string; setNameBn: (v: string) => void;
  addressEn: string; setAddressEn: (v: string) => void;
  addressBn: string; setAddressBn: (v: string) => void;
  phone: string; setPhone: (v: string) => void;
  email: string; setEmail: (v: string) => void;
  mapUrl: string; setMapUrl: (v: string) => void;
  orderIndex: number; setOrderIndex: (v: number) => void;
}) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="নাম (ইংরেজি)">
          <Input value={nameEn} onChange={(e) => setNameEn(e.target.value)} placeholder="Farmgate Branch" />
        </Field>
        <Field label="নাম (বাংলা)">
          <Input value={nameBn} onChange={(e) => setNameBn(e.target.value)} placeholder="ফার্মগেট শাখা" />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="ঠিকানা (ইংরেজি)">
          <Input value={addressEn} onChange={(e) => setAddressEn(e.target.value)} placeholder="Room No-212, Green Road, Dhaka" />
        </Field>
        <Field label="ঠিকানা (বাংলা)">
          <Input value={addressBn} onChange={(e) => setAddressBn(e.target.value)} placeholder="রুম নং ২১২, গ্রিন রোড, ঢাকা" />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="ফোন">
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" />
        </Field>
        <Field label="ইমেইল">
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="branch@icanbd.com" />
        </Field>
        <Field label="ক্রম">
          <Input type="number" value={orderIndex} onChange={(e) => setOrderIndex(Number(e.target.value) || 0)} />
        </Field>
      </div>
      <Field label="ম্যাপ লিংক">
        <Input value={mapUrl} onChange={(e) => setMapUrl(e.target.value)} placeholder="https://maps.google.com/..." />
      </Field>
    </>
  );
}

function BranchCard({
  branch,
  expanded,
  onToggle,
  upsert,
  onDelete,
}: {
  branch: Branch;
  expanded: boolean;
  onToggle: () => void;
  upsert: ReturnType<typeof useUpsertBranch>;
  onDelete: () => void;
}) {
  const [nameEn, setNameEn] = useState(branch.name_en);
  const [nameBn, setNameBn] = useState(branch.name_bn);
  const [addressEn, setAddressEn] = useState(branch.address_en ?? "");
  const [addressBn, setAddressBn] = useState(branch.address_bn ?? "");
  const [phone, setPhone] = useState(branch.phone ?? "");
  const [email, setEmail] = useState(branch.email ?? "");
  const [mapUrl, setMapUrl] = useState(branch.map_url ?? "");
  const [orderIndex, setOrderIndex] = useState(branch.order_index);
  const [isPublished, setIsPublished] = useState(branch.is_published);

  async function save() {
    if (!nameEn.trim() || !nameBn.trim()) { toast.error("নাম লিখুন"); return; }
    await upsert.mutateAsync({
      id: branch.id,
      name_en: nameEn.trim(),
      name_bn: nameBn.trim(),
      address_en: addressEn.trim() || undefined,
      address_bn: addressBn.trim() || undefined,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      map_url: mapUrl.trim() || undefined,
      order_index: orderIndex,
      is_published: isPublished,
    });
    toast.success("সংরক্ষিত হয়েছে");
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3">
        <button onClick={onToggle} className="flex flex-1 items-center gap-3 text-left min-w-0">
          {expanded ? <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />}
          <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{branch.name_bn || branch.name_en}</p>
            {!branch.is_published && (
              <Badge variant="secondary" className="text-[10px] mt-0.5">আনপাবলিশড</Badge>
            )}
          </div>
        </button>
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-destructive" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {expanded && (
        <div className="border-t border-border px-4 py-4 space-y-4">
          <BranchFormFields
            nameEn={nameEn} setNameEn={setNameEn}
            nameBn={nameBn} setNameBn={setNameBn}
            addressEn={addressEn} setAddressEn={setAddressEn}
            addressBn={addressBn} setAddressBn={setAddressBn}
            phone={phone} setPhone={setPhone}
            email={email} setEmail={setEmail}
            mapUrl={mapUrl} setMapUrl={setMapUrl}
            orderIndex={orderIndex} setOrderIndex={setOrderIndex}
          />
          <Field label="প্রকাশিত">
            <div className="flex items-center gap-2 pt-1">
              <Switch checked={isPublished} onCheckedChange={setIsPublished} />
              <span className="text-sm">{isPublished ? "হ্যাঁ" : "না"}</span>
            </div>
          </Field>
          <Button onClick={save} disabled={upsert.isPending}>
            <Save className="mr-2 h-4 w-4" />
            {upsert.isPending ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ"}
          </Button>
        </div>
      )}
    </div>
  );
}

function AddBranchForm({ onClose }: { onClose: () => void }) {
  const upsert = useUpsertBranch();
  const [nameEn, setNameEn] = useState("");
  const [nameBn, setNameBn] = useState("");
  const [addressEn, setAddressEn] = useState("");
  const [addressBn, setAddressBn] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [mapUrl, setMapUrl] = useState("");
  const [orderIndex, setOrderIndex] = useState(0);

  async function save() {
    if (!nameEn.trim() || !nameBn.trim()) { toast.error("নাম লিখুন"); return; }
    await upsert.mutateAsync({
      name_en: nameEn.trim(),
      name_bn: nameBn.trim(),
      address_en: addressEn.trim() || undefined,
      address_bn: addressBn.trim() || undefined,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      map_url: mapUrl.trim() || undefined,
      order_index: orderIndex,
      is_published: true,
    });
    toast.success("শাখা যোগ হয়েছে");
    onClose();
  }

  return (
    <div className="rounded-lg border-2 border-accent/30 bg-accent/5 p-4 space-y-4">
      <p className="text-sm font-semibold text-accent">নতুন শাখা</p>
      <BranchFormFields
        nameEn={nameEn} setNameEn={setNameEn}
        nameBn={nameBn} setNameBn={setNameBn}
        addressEn={addressEn} setAddressEn={setAddressEn}
        addressBn={addressBn} setAddressBn={setAddressBn}
        phone={phone} setPhone={setPhone}
        email={email} setEmail={setEmail}
        mapUrl={mapUrl} setMapUrl={setMapUrl}
        orderIndex={orderIndex} setOrderIndex={setOrderIndex}
      />
      <div className="flex gap-2">
        <Button onClick={save} disabled={upsert.isPending}>
          <Save className="mr-2 h-4 w-4" />
          {upsert.isPending ? "যোগ হচ্ছে..." : "যোগ করুন"}
        </Button>
        <Button variant="outline" onClick={onClose}>বাতিল</Button>
      </div>
    </div>
  );
}

export default function BranchesAdmin() {
  const { data: branches = [], isLoading } = useAdminBranches();
  const upsert = useUpsertBranch();
  const del = useDeleteBranch();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  function toggle(id: string) {
    setExpanded((prev) => (prev === id ? null : id));
  }

  async function handleDelete(id: string) {
    await del.mutateAsync(id);
    toast.success("মুছে ফেলা হয়েছে");
  }

  if (isLoading) return <div className="py-16 text-center text-sm text-muted-foreground">লোড হচ্ছে...</div>;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">শাখা / লোকেশন</h1>
          <p className="mt-1 text-sm text-muted-foreground">ফুটার ও কন্টাক্ট পেজে দেখানো শাখাগুলো নিয়ন্ত্রণ করুন</p>
        </div>
        {!adding && (
          <Button onClick={() => setAdding(true)}>
            <Plus className="mr-2 h-4 w-4" /> নতুন শাখা
          </Button>
        )}
      </div>

      {adding && <AddBranchForm onClose={() => setAdding(false)} />}

      {branches.length === 0 && !adding && (
        <p className="py-4 text-center text-xs text-muted-foreground rounded-lg border border-dashed border-border">কোনো শাখা নেই।</p>
      )}
      {branches.map((b) => (
        <BranchCard key={b.id} branch={b} expanded={expanded === b.id}
          onToggle={() => toggle(b.id)} upsert={upsert}
          onDelete={() => handleDelete(b.id)} />
      ))}
    </div>
  );
}
