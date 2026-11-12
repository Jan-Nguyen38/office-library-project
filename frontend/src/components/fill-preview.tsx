'use client';

import { Button, Modal } from "antd";
import { PrinterOutlined } from "@ant-design/icons";
import styles from "./editor.module.css";

const BLANK_IN_HTML = /\[([^\[\]<>\n]{1,80})\]/g;
const UNNAMED_RE = /^[\s.…_-]*$/;

const escapeHtml = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
const decodeHtml = (s: string) => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');

interface IProps {
    open: boolean;
    html: string;
    // Values typed in the fill panel but not yet put into the document
    pending: Record<string, string>;
    onClose: () => void;
    onFill: () => void;
}

// The finished page: pending values shown in blue ink, blanks still empty marked in red
export default function FillPreview({ open, html, pending, onClose, onFill }: IProps) {
    let pendingCount = 0;
    let emptyCount = 0;
    const previewHtml = html.replace(BLANK_IN_HTML, (match, inner: string) => {
        const label = decodeHtml(inner).trim();
        const value = UNNAMED_RE.test(label) ? '' : pending[label]?.trim();
        if (value) {
            pendingCount++;
            return `<span class="preview-pending">${escapeHtml(value)}</span>`;
        }
        emptyCount++;
        return `<mark class="preview-empty">${match}</mark>`;
    });
    const pendingFields = Object.values(pending).filter((v) => v.trim()).length;

    const status = [
        emptyCount
            ? `${emptyCount} ${emptyCount === 1 ? 'blank is' : 'blanks are'} still empty, marked in red.`
            : 'Every blank is filled.',
        pendingCount ? `Blue text is typed in the panel but not in the document yet.` : '',
    ].filter(Boolean).join(' ');

    return (
        <Modal
            open={open}
            onCancel={onClose}
            title="Preview"
            width={900}
            centered
            rootClassName="no-print"
            footer={[
                <Button key="back" onClick={onClose}>Keep editing</Button>,
                pendingFields
                    ? <Button key="fill" type="primary" onClick={onFill}>Fill {pendingFields} {pendingFields === 1 ? 'blank' : 'blanks'}</Button>
                    : <Button key="print" type="primary" icon={<PrinterOutlined />} onClick={() => window.print()}>Print / PDF</Button>,
            ]}
        >
            <p className={`${styles.previewStatus} ${emptyCount ? styles.previewStatusWarn : ''}`} role="status">{status}</p>
            <div className={styles.previewDesk}>
                <div className="paper" dangerouslySetInnerHTML={{ __html: previewHtml }} />
            </div>
        </Modal>
    );
}
