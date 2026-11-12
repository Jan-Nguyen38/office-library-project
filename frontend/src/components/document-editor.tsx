"use client";

import { ITemplate, IUserDoc } from "@/types";
import { sendRequest } from "@/utils/api";
import { EditorContent, useEditor } from "@tiptap/react";
import { Button, message, Input } from "antd";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import TextAlign from "@tiptap/extension-text-align";
import {
  FileTextOutlined,
  FileWordOutlined,
  PrinterOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import Toolbar from "./toolbar";
import FillBlanks from "./fill-blanks";
import { Blank, BlankHighlight, findBlanks } from "./blank-highlight";
import { applyTemplateLayout } from "./template-layout";
import DocBar from "./doc-bar";
import { timeAgo } from "@/utils/time";
import styles from "./editor.module.css";

type SaveState = "saved" | "unsaved" | "saving";

const STATUS_TEXT: Record<SaveState, string> = {
  saved: "Saved",
  unsaved: "Unsaved changes",
  saving: "Saving…",
};

const escapeHtml = (s: string) =>
  s.replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!,
  );
const fileName = (title: string) =>
  (title.trim() || "document").replace(/[\\/:*?"<>|]/g, "-");

interface IProps {
  doc: IUserDoc;
  template: ITemplate | null;
  // Template converted from Word, with paragraph alignment
  templateHtml: string | null;
}

export default function DocumentEditor({
  doc,
  template,
  templateHtml,
}: IProps) {
  const [title, setTitle] = useState(doc.title);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [updatedAt, setUpdatedAt] = useState(
    doc.updatedAt ? new Date(doc.updatedAt) : null,
  );
  const [now, setNow] = useState(() => Date.now());
  const [blanks, setBlanks] = useState<Blank[]>([]);
  // Bumped on every edit, so a save that finishes after newer edits doesn't mark them saved
  const version = useRef(0);

  const markEdited = () => {
    version.current++;
    setSaveState("unsaved");
  };

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      // Keeps the Word alignment (text-align) that comes with the template
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right", "justify"],
      }),
      BlankHighlight,
    ],
    content: doc.content,
    immediatelyRender: false,
    onCreate: ({ editor }) => setBlanks(findBlanks(editor.state.doc)),
    onUpdate: ({ editor }) => {
      markEdited();
      setBlanks(findBlanks(editor.state.doc));
    },
  });

  const save = async (): Promise<boolean> => {
    if (!editor) return false;
    if (!title.trim()) {
      message.error("Add a title before saving");
      return false;
    }
    const savingVersion = version.current;
    setSaveState("saving");
    try {
      const updated = await sendRequest<IUserDoc>(`/documents/${doc._id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: title.trim(),
          content: editor.getHTML(),
        }),
      });
      setUpdatedAt(
        updated?.updatedAt ? new Date(updated.updatedAt) : new Date(),
      );
      setNow(Date.now());
      setSaveState(version.current === savingVersion ? "saved" : "unsaved");
      return true;
    } catch (e) {
      setSaveState("unsaved");
      message.error(
        e instanceof Error
          ? e.message
          : "Couldn't save. Check your connection and try again.",
      );
      return false;
    }
  };
  const matchLayout = (auto = false) => {
    if (!editor || !templateHtml) return;
    const changed = applyTemplateLayout(editor, templateHtml);
    if (changed)
      message.info(
        `Aligned ${changed} ${changed === 1 ? "paragraph" : "paragraphs"} like the Word template.${auto ? " Save to keep the layout." : ""}`,
      );
    else if (!auto) message.info("Layout already matches the template");
  };

  // Documents created before alignment was kept are all left-aligned: match the template once on open
  useEffect(() => {
    if (editor && templateHtml && !doc.content.includes("text-align"))
      matchLayout(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  const saveRef = useRef(save);
  saveRef.current = save;

  // Keep "Edited … ago" fresh
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);

  // Ctrl/Cmd+S saves
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void saveRef.current();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Ask before leaving with unsaved changes
  useEffect(() => {
    if (saveState === "saved") return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [saveState]);

  const downloadWord = async () => {
    // Download what's on screen: stop if saving the latest edits failed
    if (saveState !== "saved" && !(await save())) return;
    // Fetch instead of navigating: navigation fires the unsaved-changes prompt before React drops it after the save
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/documents/${doc._id}/download`,
      );
      if (!res.ok) throw new Error();
      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileName(title)}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      message.error("Couldn't download the Word file. Try again.");
    }
  };

  const downloadHtml = () => {
    if (!editor) return;
    const html = `<!doctype html>
                    <html lang="vi">
                        <head>
                            <meta charset="utf-8">
                            <title>${escapeHtml(title)}</title>
                            <style>
                                body { font-family: 'Times New Roman', serif; font-size: 13pt; line-height: 1.25; max-width: 210mm; margin: 0 auto; padding: 20mm 20mm 20mm 30mm; box-sizing: border-box; }
                                p { margin: 0 0 6pt; }
                                h1 { font-size: 16pt; } h2 { font-size: 14pt; } h3 { font-size: 13pt; }
                                table { border-collapse: collapse; width: 100%; }
                                td, th { border: 1px solid #000; padding: 4px 8px; }
                            </style>
                        </head>
                        <body>
                            ${editor.getHTML()}
                        </body>
                    </html>`;
    const url = URL.createObjectURL(
      new Blob([html], { type: "text/html;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName(title)}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.editorPage}>
      <DocBar
        title={
          <Input
            className={styles.title}
            variant="borderless"
            value={title}
            placeholder="Untitled document"
            aria-label="Document title"
            onChange={(e) => {
              setTitle(e.target.value);
              markEdited();
            }}
          />
        }
        aside={
          updatedAt && (
            <span
              title={updatedAt.toLocaleString("en-GB")}
              suppressHydrationWarning
            >
              Edited {timeAgo(updatedAt, now)}
            </span>
          )
        }
        meta={
          <>
            {template ? (
              <span>
                From template{" "}
                <Link href={`/templates/${template._id}`}>{template.name}</Link>
              </span>
            ) : (
              <span>Template no longer available</span>
            )}
            <span
              className={`${styles.status} ${styles[saveState]}`}
              role="status"
            >
              {STATUS_TEXT[saveState]}
            </span>
          </>
        }
        actions={
          <>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={saveState === "saving"}
              disabled={saveState === "saved"}
              onClick={save}
              title="Save (Ctrl+S)"
            >
              Save
            </Button>
            <Button icon={<FileWordOutlined />} onClick={downloadWord}>
              Word
            </Button>
            <Button icon={<FileTextOutlined />} onClick={downloadHtml}>
              HTML
            </Button>
            <Button icon={<PrinterOutlined />} onClick={() => window.print()}>
              Print / PDF
            </Button>
          </>
        }
      >
        <Toolbar
          editor={editor}
          onMatchLayout={templateHtml ? () => matchLayout() : undefined}
        />
      </DocBar>

      <div className={styles.workspace}>
        <div className="paper">
          <EditorContent editor={editor} />
        </div>
        <FillBlanks editor={editor} blanks={blanks} />
      </div>
    </div>
  );
}
