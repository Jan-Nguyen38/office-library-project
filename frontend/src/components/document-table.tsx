'use client';
import { IUserDoc } from "@/types";
import { Button, Popconfirm, Space, Tooltip, message, Modal, Input } from 'antd';
import { DeleteOutlined, FileWordOutlined, ShareAltOutlined } from '@ant-design/icons';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { sendRequest } from '@/utils/api';
import { timeAgo } from '@/utils/time';
import { useState } from "react";
import styles from "./editor.module.css";

const BaseURL = process.env.NEXT_PUBLIC_BACKEND_URL;

// My documents: one ruled line per document on a white sheet, like the template list view
export default function DocumentTable( {docs}:{docs: IUserDoc[]}){
    const router = useRouter();
    const showError = (e: unknown, fallback: string) =>
        message.error(e instanceof Error ? e.message : fallback);
    const remove = async (d: IUserDoc) => {
        try {
            await sendRequest(`/documents/${d._id}`, { method: 'DELETE' });
            message.success(`Deleted “${d.title}”`);
            router.refresh();
        } catch (e) {
            showError(e, "Couldn't delete the document");
        }
    };
    const [sharing, setSharing] = useState<{ id: string; url: string } | null>(null);
    const share = async (d: IUserDoc) => {
        try {
            const { shareId } = await sendRequest<{ shareId: string }>(`/documents/${d._id}/share`, { method: 'POST' });
            setSharing({ id: d._id, url: `${window.location.origin}/share/${shareId}` });
        } catch (e) {
            showError(e, "Couldn't create a share link");
        }
    };
    const copy = async () => {
        if (!sharing) return;
        try {
            await navigator.clipboard.writeText(sharing.url);
            message.success('Link copied');
        } catch {
            message.error("Couldn't copy. Select the link and copy it yourself.");
        }
    };
    const unshare = async () => {
        if (!sharing) return;
        try {
            await sendRequest(`/documents/${sharing.id}/share`, { method: 'DELETE' });
            message.success('Stopped sharing. The old link no longer opens.');
            setSharing(null);
        } catch (e) {
            showError(e, "Couldn't stop sharing");
        }
    };

    if (docs.length === 0)
        return (
            <div className={styles.emptyState}>
                <p>No documents yet. Pick a template to write your first one.</p>
                <Link href="/"><Button type="primary">Browse templates</Button></Link>
            </div>
        );

    return (
        <>
            <div className={styles.docList}>
                {docs.map((d) => (
                    <article key={d._id} className={styles.docRow}>
                        <span className={styles.docGlyph} aria-hidden />
                        <div className={styles.docInfo}>
                            <Link href={`/documents/${d._id}`} className={styles.docName}>{d.title}</Link>
                            {d.updatedAt && (
                                <span className={styles.docEdited} title={new Date(d.updatedAt).toLocaleString('en-GB')} suppressHydrationWarning>
                                    Edited {timeAgo(new Date(d.updatedAt))}
                                </span>
                            )}
                        </div>
                        <Space className={styles.docActions}>
                            <Link href={`/documents/${d._id}`}><Button>Open</Button></Link>
                            <Tooltip title="Download Word">
                                <Button icon={<FileWordOutlined />} href={`${BaseURL}/documents/${d._id}/download`} aria-label="Download Word" />
                            </Tooltip>
                            <Tooltip title="Share">
                                <Button icon={<ShareAltOutlined />} onClick={() => share(d)} aria-label="Share" />
                            </Tooltip>
                            <Popconfirm
                                title="Delete this document?"
                                description="This can't be undone."
                                okText="Delete"
                                cancelText="Cancel"
                                okButtonProps={{ danger: true }}
                                onConfirm={() => remove(d)}
                            >
                                <Tooltip title="Delete">
                                    <Button danger icon={<DeleteOutlined />} aria-label="Delete" />
                                </Tooltip>
                            </Popconfirm>
                        </Space>
                    </article>
                ))}
            </div>
            <Modal title="Share a read-only link" open={!!sharing} onCancel={() => setSharing(null)} footer={null}>
                <p>Anyone with this link can read the document. They can't edit it.</p>
                <Space.Compact style={{ width: '100%' }}>
                    <Input readOnly value={sharing?.url} aria-label="Share link" />
                    <Button type="primary" onClick={copy}>Copy link</Button>
                </Space.Compact>
                <Button danger type="link" onClick={unshare} style={{ padding: 0, marginTop: 12 }}>
                    Stop sharing
                </Button>
            </Modal>
        </>
    )
}
