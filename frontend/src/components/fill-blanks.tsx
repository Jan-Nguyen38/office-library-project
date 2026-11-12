'use client';

import type { Editor } from "@tiptap/react";
import { Button, Input, message } from "antd";
import { useEffect, useMemo, useState } from "react";
import { DownOutlined, EyeOutlined } from "@ant-design/icons";
import { Blank, blankKey, findBlanks } from "./blank-highlight";
import FillPreview from "./fill-preview";
import styles from "./editor.module.css";

export default function FillBlanks({ editor, blanks }: { editor: Editor | null; blanks: Blank[] }) {
    const [values, setValues] = useState<Record<string, string>>({});
    // Beside the paper the panel is always open; when it stacks above the paper (narrow screens) it starts collapsed
    const [open, setOpen] = useState(true);
    const [previewOpen, setPreviewOpen] = useState(false);
    useEffect(() => { if (window.matchMedia('(max-width: 1100px)').matches) setOpen(false); }, []);

    // Unique named blanks in document order, with how many times each appears
    const named = useMemo(() => {
        const counts = new Map<string, number>();
        blanks.filter((b) => b.named).forEach((b) => counts.set(b.label, (counts.get(b.label) ?? 0) + 1));
        return Array.from(counts.entries());
    }, [blanks]);
    const unnamedCount = blanks.filter((b) => !b.named).length;
    const readyCount = named.filter(([label]) => values[label]?.trim()).length;

    const highlight = (label: string) => {
        if (!editor) return;
        editor.view.dispatch(editor.state.tr.setMeta(blankKey, label));
        const first = blanks.find((b) => b.named && b.label === label);
        if (!label || !first) return;
        const { node } = editor.view.domAtPos(first.from);
        const el = node instanceof Element ? node : node.parentElement;
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        el?.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' });
    };

    const fill = () => {
        if (!editor || !readyCount) return;
        const tr = editor.state.tr;
        // Replace from the end so earlier positions stay valid
        for (const b of findBlanks(editor.state.doc).reverse()) {
            const value = values[b.label]?.trim();
            if (b.named && value) tr.insertText(value, b.from, b.to);
        }
        editor.view.dispatch(tr.setMeta(blankKey, ''));
        message.success(`Filled ${readyCount} ${readyCount === 1 ? 'blank' : 'blanks'}`);
        setValues({});
    };

    return (
        <aside className={`${styles.panel} ${styles.collapsible} ${open ? '' : styles.collapsed} no-print`} aria-labelledby="fill-blanks-title">
            <h2 id="fill-blanks-title" className={styles.panelTitle}>
                <button type="button" className={styles.panelToggle} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
                    Fill in blanks
                    {named.length > 0 && <span className={styles.panelCount}>{named.length}</span>}
                    <DownOutlined className={styles.chevron} aria-hidden />
                </button>
            </h2>
            <div className={styles.panelBody}>
            <p className={styles.panelHint}>
                {!editor
                    ? 'Finding blanks…'
                    : named.length
                        ? 'Type each value once. It replaces every matching blank in the document.'
                        : 'Every named blank in this document is filled.'}
            </p>

            {named.length > 0 && (
                <form onSubmit={(e) => { e.preventDefault(); fill(); }}>
                    {named.map(([label, count]) => (
                        <label key={label} className={styles.field}>
                            <span className={styles.fieldLabel}>
                                {label}
                                {count > 1 && <span className={styles.fieldCount}>{count} places</span>}
                            </span>
                            <Input
                                value={values[label] ?? ''}
                                onChange={(e) => setValues((v) => ({ ...v, [label]: e.target.value }))}
                                onFocus={() => highlight(label)}
                                onBlur={() => highlight('')}
                            />
                        </label>
                    ))}
                    <Button type="primary" htmlType="submit" block disabled={!readyCount}>
                        {readyCount ? `Fill ${readyCount} ${readyCount === 1 ? 'blank' : 'blanks'}` : 'Fill blanks'}
                    </Button>
                </form>
            )}

            {editor && (
                <Button className={styles.previewButton} block icon={<EyeOutlined />} onClick={() => setPreviewOpen(true)}>
                    Preview result
                </Button>
            )}

            {unnamedCount > 0 && (
                <p className={styles.panelNote}>
                    {unnamedCount} short {unnamedCount === 1 ? 'blank' : 'blanks'} like [..] {unnamedCount === 1 ? 'has' : 'have'} no name.
                    Type over {unnamedCount === 1 ? 'it' : 'them'} directly in the document.
                </p>
            )}
            </div>
            {editor && previewOpen && (
                <FillPreview
                    open
                    html={editor.getHTML()}
                    pending={values}
                    onClose={() => setPreviewOpen(false)}
                    onFill={fill}
                />
            )}
        </aside>
    );
}
