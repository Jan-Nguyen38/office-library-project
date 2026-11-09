'use client';
import { IUserDoc } from "@/types";
import { Button, Empty, Popconfirm, Space, Table, Tooltip, message, Modal, Input } from 'antd';
import { DeleteOutlined, DownloadOutlined, EditOutlined, ShareAltOutlined } from '@ant-design/icons';
import { ColumnsType } from "antd/es/table";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { sendRequest } from '@/utils/api';
import { useState } from "react";

export default function DocumentTable( {docs}:{docs: IUserDoc[]}){
    const router = useRouter();
    const showError = (e: unknown, fallback: string) =>
    message.error(e instanceof Error ? e.message : fallback);
    const remove = async (d: IUserDoc) => {
        try {
        await sendRequest(`/documents/${d._id}`, { method: 'DELETE' });
        message.success(`Deleted "${d.title}"`);
        router.refresh();
        } catch (e) {
            showError(e, 'Can not delete');
        }
    };
    const [sharing, setSharing] = useState<{ id: string; url: string } | null>(null);
    const share = async (d: IUserDoc) => {
        try {
        const { shareId } = await sendRequest<{ shareId: string }>(`/documents/${d._id}/share`, { method: 'POST' });
        setSharing({ id: d._id, url: `${window.location.origin}/share/${shareId}` });
        } catch (e) {
            showError(e, 'Can not sharing!');
        }
    };
    const copy = async () => {
        if (!sharing) return;
        await navigator.clipboard.writeText(sharing.url);
        message.success('Copied link!');
    };
    const unshare = async () => {
        if (!sharing) return;
        try {
            await sendRequest(`/documents/${sharing.id}/share`, { method: 'DELETE' });
            message.success('Stop sharing, previous link can not open!');
            setSharing(null);
        } catch (e) {
            showError(e, 'Not share');
        }
    };


    if (docs.length === 0)
        return (
            <Empty description="Chưa có văn bản nào">
                <Link href="/"><Button type="primary">Chọn mẫu</Button></Link>
            </Empty>
        );
    console.log(docs);    
    const columns : ColumnsType<IUserDoc> = [
        { title: 'Name', dataIndex: 'title', render: (title, d) => <Link href={`/documents/${d._id}`}>{title}</Link> },
        { title: 'Last Updated', dataIndex: 'updatedAt', render: (v) => new Date(v).toLocaleDateString('vi-VN')},
        { title: 'Action', dataIndex: 'action', render: (v) => {
            
            <p>Demo</p>            
        }}
    ]
    return (
        <>
            <Table rowKey="_id" columns={columns} dataSource={docs} pagination={false}/>;
            <Modal title="Sharing document" open={!!sharing} onCancel={() => setSharing(null)} footer={null}>
            <p>Anyone has this link that can access(only read, but not update).</p>
            <Space.Compact style={{ width: '100%' }}>
                <Input readOnly value={sharing?.url} />
                <Button type="primary" onClick={copy}>Copy</Button>
            </Space.Compact>
            <Button danger type="link" onClick={unshare} style={{ padding: 0, marginTop: 12 }}>
                Stop sharing
            </Button>
            </Modal>
        </>
    )
}