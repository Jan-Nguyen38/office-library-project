import { Extension } from '@tiptap/react';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import type { Node as PMNode } from '@tiptap/pm/model';

// Blanks in templates look like [Họ và tên], [Tên công ty] or unnamed ones like [..]
const BLANK_RE = /\[([^\[\]\n]{1,80})\]/g;
const UNNAMED_RE = /^[\s.…_-]*$/;

export interface Blank {
    from: number;
    to: number;
    label: string;
    named: boolean;
}

export function findBlanks(doc: PMNode): Blank[] {
    const blanks: Blank[] = [];
    doc.descendants((node, pos) => {
        if (!node.isTextblock) return true;
        const start = pos + 1;
        // Leaf nodes (e.g. hard breaks) count as one character so offsets map 1:1 to positions
        const text = doc.textBetween(start, pos + node.nodeSize - 1, '', '￼');
        const re = new RegExp(BLANK_RE);
        let m: RegExpExecArray | null;
        while ((m = re.exec(text))) {
            const label = m[1].trim();
            blanks.push({ from: start + m.index, to: start + m.index + m[0].length, label, named: !UNNAMED_RE.test(label) });
        }
        return false;
    });
    return blanks;
}

// Plugin state = label of the blank currently focused in the fill panel ('' for none)
export const blankKey = new PluginKey<string>('blankHighlight');

export const BlankHighlight = Extension.create({
    name: 'blankHighlight',
    addProseMirrorPlugins() {
        return [
            new Plugin<string>({
                key: blankKey,
                state: {
                    init: () => '',
                    apply: (tr, active) => tr.getMeta(blankKey) ?? active,
                },
                props: {
                    decorations(state) {
                        const active = blankKey.getState(state);
                        return DecorationSet.create(
                            state.doc,
                            findBlanks(state.doc).map((b) =>
                                Decoration.inline(b.from, b.to, { class: b.named && b.label === active ? 'blank blank-active' : 'blank' }),
                            ),
                        );
                    },
                },
            }),
        ];
    },
});
