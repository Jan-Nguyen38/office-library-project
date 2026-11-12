import type { Editor } from '@tiptap/react';

type Align = 'left' | 'center' | 'right' | 'justify';
interface TemplateBlock { pattern: RegExp; align: Align }

const normalize = (s: string) => s.replace(/\s+/g, ' ').trim().normalize('NFC');
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Each template paragraph becomes a pattern; its [blanks] match whatever the user typed in their place
function templateBlocks(templateHtml: string): TemplateBlock[] {
    const dom = new DOMParser().parseFromString(templateHtml, 'text/html');
    return Array.from(dom.querySelectorAll<HTMLElement>('p, h1, h2, h3, h4, h5, h6'))
        .map((el) => {
            const text = normalize(el.textContent ?? '');
            const source = text.split(/\[[^\[\]]*\]/).map(escapeRe).join('.*?');
            return { pattern: new RegExp(`^${source}$`, 'is'), align: (el.style.textAlign || 'left') as Align, text };
        })
        .filter((b) => b.text);
}

/**
 * Applies the Word template's paragraph alignment to the document, walking both in order.
 * Text is never changed. Returns how many paragraphs changed alignment.
 */
export function applyTemplateLayout(editor: Editor, templateHtml: string): number {
    const blocks = templateBlocks(templateHtml);
    const { state } = editor;
    const tr = state.tr;
    let next = 0;
    let changed = 0;

    state.doc.descendants((node, pos) => {
        if (!node.isTextblock) return true;
        if (!('textAlign' in node.attrs)) return false;
        const text = normalize(node.textContent);
        if (!text) return false;
        const i = blocks.findIndex((b, idx) => idx >= next && b.pattern.test(text));
        if (i === -1) return false;
        next = i + 1;
        const align = blocks[i].align;
        if ((node.attrs.textAlign ?? 'left') !== align) {
            tr.setNodeMarkup(pos, undefined, { ...node.attrs, textAlign: align });
            changed++;
        }
        return false;
    });

    if (changed) editor.view.dispatch(tr);
    return changed;
}
