'use client';

import { IUserDoc } from "@/types";
import { sendRequest } from "@/utils/api";
import { EditorContent, useEditor } from "@tiptap/react";
import { Button, message, Space, Input } from "antd";
import { useState } from "react";
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Table from "@tiptap/extension-table";
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import { DownloadOutlined, SaveOutlined } from "@ant-design/icons";
import Toolbar from "./toolbar";


export default function DocumentEditor({ doc }: { doc: IUserDoc}){
    const [title, setTitle] = useState(doc.title);
    const [dirty, setDirty] = useState(false);
    const [saving, setSaving] = useState(false);

    const editor = useEditor({
        extensions: [StarterKit, Underline, Table.configure({resizable:true}), TableRow, TableHeader, TableCell],
        content: doc.content,
        immediatelyRender: false,
        onUpdate: ()=> setDirty(true)
    });
    const save = async () => {
        if (!editor) return;
        setSaving(true);
        try {
            await sendRequest(`/documents/${doc._id}`, {
                method: 'PATCH',
                body: JSON.stringify({ title, content: editor.getHTML()})
            });
            setDirty(false);
            message.success('Saved...!');
        } catch {
            message.error('Save unsuccessfully!!!');
        } finally {
            setSaving(false);
        }
    };
    const download = async () => {
        if (dirty) await save();
        window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/documents/${doc._id}/download`;
    };
    return (
        <div style={{padding: 24}}>
            <Space wrap style={{marginBottom: 12}}>
                <Input value={title} style={{ width: 320}} onChange={ e => { setTitle(e.target.value); setDirty(true);}}/>
                <Button type="primary" icon={<SaveOutlined/>} loading={saving} disabled={!dirty} onClick={save}>Save</Button>
                <Button icon={<DownloadOutlined/>} onClick={download}>Download</Button>
            </Space>
            <Toolbar editor={editor}/>
            <div className="paper"><EditorContent editor={editor}/></div>
        </div>
    );

}