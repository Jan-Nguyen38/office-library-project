import type { Editor } from '@tiptap/react';

type Align = 'left' | 'center' | 'right' | 'justify';
// Literal text between the paragraph's [blanks], lowercased
interface TemplateBlock { pieces: string[]; align: Align }

const normalize = (s: string) => s.replace(/\s+/g, ' ').trim().normalize('NFC');

// Each template paragraph becomes a pattern; its [blanks] match whatever the user typed in their place
function templateBlocks(templateHtml: string): TemplateBlock[] {
    const dom = new DOMParser().parseFromString(templateHtml, 'text/html');
    return Array.from(dom.querySelectorAll<HTMLElement>('p, h1, h2, h3, h4, h5, h6'))
        .map((el) => {
            const text = normalize(el.textContent ?? '').toLowerCase();
            return { pieces: text.split(/\[[^\[\]]*\]/), align: (el.style.textAlign || 'left') as Align, text };
        })
        .filter((b) => b.text);
}

// Wildcard match: text starts with the first piece, ends with the last, and holds the middle ones in order.
// Taking the leftmost match of each middle piece is enough, and runs in linear time (a regex with one
// .*? per blank can backtrack exponentially on long paragraphs and freeze the tab).
function matches(pieces: string[], text: string) {
    const first = pieces[0];
    const last = pieces[pieces.length - 1];
    if (pieces.length === 1) return text === first;
    if (text.length < first.length + last.length || !text.startsWith(first) || !text.endsWith(last)) return false;
    const end = text.length - last.length;
    let pos = first.length;
    for (const piece of pieces.slice(1, -1)) {
        const i = text.indexOf(piece, pos);
        if (i === -1 || i + piece.length > end) return false;
        pos = i + piece.length;
    }
    return true;
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
        const text = normalize(node.textContent).toLowerCase();
        if (!text) return false;
        const i = blocks.findIndex((b, idx) => idx >= next && matches(b.pieces, text));
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
