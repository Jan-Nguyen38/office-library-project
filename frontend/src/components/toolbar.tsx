'use client';
import type { Editor } from '@tiptap/react';
import { Space, Button } from 'antd';
import { BoldOutlined, ItalicOutlined, UnderlineOutlined, UnorderedListOutlined, OrderedListOutlined, UndoOutlined, RedoOutlined, AlignLeftOutlined, AlignCenterOutlined, AlignRightOutlined, MenuOutlined, LayoutOutlined } from '@ant-design/icons';

export default function Toolbar( {editor, onMatchLayout}: {editor: Editor | null; onMatchLayout?: () => void} ) {
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
            <Space.Compact>
                {([
                    ['left', <AlignLeftOutlined key="l" />, 'Align left'],
                    ['center', <AlignCenterOutlined key="c" />, 'Center'],
                    ['right', <AlignRightOutlined key="r" />, 'Align right'],
                    ['justify', <MenuOutlined key="j" />, 'Justify'],
                ] as const).map(([align, icon, label]) => (
                    <Button key={align} type={btn(editor.isActive({ textAlign: align }))} icon={icon} aria-label={label} title={label}
                    onClick={() => editor.chain().focus().setTextAlign(align).run()} />
                ))}
            </Space.Compact>
            <Button icon={<UndoOutlined />} onClick={() => editor.chain().focus().undo().run()} />
            <Button icon={<RedoOutlined />} onClick={() => editor.chain().focus().redo().run()} />
            {onMatchLayout && (
                <Button icon={<LayoutOutlined />} onClick={onMatchLayout} title="Align paragraphs like the Word template">
                    Match template layout
                </Button>
            )}

        </Space>
    );
}