'use client';
import type { Editor } from '@tiptap/react';
import { Space, Button } from 'antd';
import { BoldOutlined, ItalicOutlined, UnderlineOutlined, UnorderedListOutlined, OrderedListOutlined, UndoOutlined, RedoOutlined } from '@ant-design/icons';

export default function Toolbar( {editor}: {editor: Editor | null} ) {
    if (!editor) return null;

    const btn = (active: boolean) => (active ? 'primary' : 'default');
   return (
        <Space wrap>
            <Button type={btn(editor.isActive('bold'))} icon={<BoldOutlined />}
            onClick={() => editor.chain().focus().toggleBold().run()} />
            <Button type={btn(editor.isActive('italic'))} icon={<ItalicOutlined />}
            onClick={() => editor.chain().focus().toggleItalic().run()} />
            <Button type={btn(editor.isActive('underline'))} icon={<UnderlineOutlined />}
            onClick={() => editor.chain().focus().toggleUnderline().run()} />
            <Button type={btn(editor.isActive('heading', { level: 2 }))}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</Button>
            <Button type={btn(editor.isActive('bulletList'))} icon={<UnorderedListOutlined />}
            onClick={() => editor.chain().focus().toggleBulletList().run()} />
            <Button type={btn(editor.isActive('orderedList'))} icon={<OrderedListOutlined />}
            onClick={() => editor.chain().focus().toggleOrderedList().run()} />
            <Button icon={<UndoOutlined />} onClick={() => editor.chain().focus().undo().run()} />
            <Button icon={<RedoOutlined />} onClick={() => editor.chain().focus().redo().run()} />

        </Space>
    );
}