import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Link from "@tiptap/extension-link";
import {
  Bold, Italic, UnderlineIcon, Strikethrough, List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight, Link2, Link2Off, Undo, Redo,
  Heading2, Heading3, Quote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useCallback } from "react";

interface RichEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function RichEditor({ value, onChange, placeholder }: RichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-accent underline" } }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: [
          "min-h-[200px] w-full rounded-b-md border-x border-b border-input bg-background px-4 py-3",
          "text-sm leading-relaxed text-foreground focus:outline-none",
          "prose prose-sm max-w-none dark:prose-invert",
        ].join(" "),
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, false);
    }
  }, [value, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href ?? "";
    const url = window.prompt("URL লিখুন:", prev);
    if (url === null) return;
    if (!url) { editor.chain().focus().extendMarkRange("link").unsetLink().run(); return; }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  const btn = (active: boolean) =>
    `h-7 w-7 p-0 ${active ? "bg-accent text-accent-foreground" : ""}`;

  return (
    <div className="overflow-hidden rounded-md border border-input">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-input bg-muted/50 px-2 py-1.5">
        <ToolBtn icon={<Undo className="h-3.5 w-3.5" />} onClick={() => editor.chain().focus().undo().run()} title="Undo" />
        <ToolBtn icon={<Redo className="h-3.5 w-3.5" />} onClick={() => editor.chain().focus().redo().run()} title="Redo" />
        <Divider />
        <ToolBtn icon={<Heading2 className="h-3.5 w-3.5" />} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="H2" />
        <ToolBtn icon={<Heading3 className="h-3.5 w-3.5" />} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="H3" />
        <Divider />
        <ToolBtn icon={<Bold className="h-3.5 w-3.5" />} onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold" />
        <ToolBtn icon={<Italic className="h-3.5 w-3.5" />} onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic" />
        <ToolBtn icon={<UnderlineIcon className="h-3.5 w-3.5" />} onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline" />
        <ToolBtn icon={<Strikethrough className="h-3.5 w-3.5" />} onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strike" />
        <Divider />
        <ToolBtn icon={<List className="h-3.5 w-3.5" />} onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet list" />
        <ToolBtn icon={<ListOrdered className="h-3.5 w-3.5" />} onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Ordered list" />
        <ToolBtn icon={<Quote className="h-3.5 w-3.5" />} onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Quote" />
        <Divider />
        <ToolBtn icon={<AlignLeft className="h-3.5 w-3.5" />} onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Align left" />
        <ToolBtn icon={<AlignCenter className="h-3.5 w-3.5" />} onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Align center" />
        <ToolBtn icon={<AlignRight className="h-3.5 w-3.5" />} onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Align right" />
        <Divider />
        <ToolBtn icon={<Link2 className="h-3.5 w-3.5" />} onClick={setLink} active={editor.isActive("link")} title="Add link" />
        <ToolBtn icon={<Link2Off className="h-3.5 w-3.5" />} onClick={() => editor.chain().focus().unsetLink().run()} title="Remove link" />
      </div>

      {/* Editor area */}
      <EditorContent editor={editor} placeholder={placeholder} />
    </div>
  );
}

function ToolBtn({
  icon, onClick, active, title,
}: {
  icon: React.ReactNode; onClick: () => void; active?: boolean; title?: string;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={`h-7 w-7 p-0 ${active ? "bg-accent text-accent-foreground" : ""}`}
      onClick={onClick}
      title={title}
    >
      {icon}
    </Button>
  );
}

function Divider() {
  return <span className="mx-1 h-4 w-px bg-border" />;
}

// Read-only renderer for notice content
export function RichContent({ html, className }: { html: string; className?: string }) {
  return (
    <div
      className={[
        "prose prose-sm max-w-none dark:prose-invert",
        "prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1",
        className ?? "",
      ].join(" ")}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
