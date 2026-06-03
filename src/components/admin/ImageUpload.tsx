import { useRef, useState } from "react";
import { Upload, Loader2, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadCourseMedia } from "@/lib/storage";
import { toast } from "sonner";

interface UploadProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: "thumbnails" | "resources" | "products";
  accept?: string;
  /** "image" shows a thumbnail preview; "file" shows a filename badge */
  kind?: "image" | "file";
}

export function ImageUpload({
  value,
  onChange,
  folder = "thumbnails",
  accept = "image/*",
  kind = "image",
}: UploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File) {
    setBusy(true);
    try {
      const url = await uploadCourseMedia(file, folder);
      onChange(url);
      toast.success("আপলোড সম্পন্ন হয়েছে");
    } catch (err) {
      toast.error("আপলোড ব্যর্থ হয়েছে: " + ((err as Error).message ?? ""));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />

      {value && kind === "image" && (
        <div className="relative inline-block">
          <img src={value} alt="preview" className="h-28 w-auto rounded-md border border-border object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground shadow"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {value && kind === "file" && (
        <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm">
          <FileText className="h-4 w-4 text-accent" />
          <a href={value} target="_blank" rel="noreferrer" className="flex-1 truncate text-accent hover:underline">
            {value.split("/").pop()}
          </a>
          <button type="button" onClick={() => onChange("")} className="text-muted-foreground hover:text-destructive">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => inputRef.current?.click()}>
        {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
        {value ? "পরিবর্তন করুন" : "আপলোড করুন"}
      </Button>
    </div>
  );
}

/** PDF-only convenience wrapper. */
export function FileUpload(props: Omit<UploadProps, "accept" | "kind" | "folder">) {
  return <ImageUpload {...props} folder="resources" accept="application/pdf" kind="file" />;
}
