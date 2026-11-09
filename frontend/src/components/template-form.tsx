'use client';

import { sendRequest } from "@/utils/api";
import { UploadOutlined } from "@ant-design/icons";
import { UploadFile, Form, Input, AutoComplete, Select, Upload, Button, message} from "antd";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface IFormValues{
    name: string;
    category: string;
    description?: string;
    tags: string[];
    file: UploadFile[];
    thumbnail?: UploadFile[];
}
const normFile = (e: { fileList: UploadFile[] } | UploadFile[]) => Array.isArray(e) ? e : e?.fileList;

export default function TemplateForm({ categories} : { categories: string[]}){
    const route = useRouter();
    const [saving, setSaving] = useState(false);
    const onFinish = async (values: IFormValues) => {
        const fd = new FormData();
        fd.append('name', values.name);
        fd.append('category', values.category);
        if (values.description) fd.append('description', values.description);
        if (values.tags?.length) fd.append('tags', values.tags.join(','));
        fd.append('file', values.file[0].originFileObj as File);
        if (values.thumbnail?.length) fd.append('thumbnail', values.thumbnail[0].originFileObj as File);
        setSaving(true);
        try {
            const {_id} = await sendRequest<{_id: string}>('/templates/upload', {
                method: 'POST',
                body: fd
            });
            message.success('Added template!');
            route.push(`/templates/${_id}`);
        } catch (e) {
            message.error( e instanceof Error ? e.message : "No added template");
            setSaving(false)
        }
    };
    return (
        <Form<IFormValues> layout="vertical" onFinish={onFinish} style={{maxWidth: 600, margin: '24px auto'}}>
            <Form.Item name="name" label="Tên mẫu" rules={[{required:true, message:'Nhập tên mẫu'}]}>
                <Input/>
            </Form.Item>
            <Form.Item name="category" label="Danh mục" rules={[{required:true, message:'Nhập danh mục'}]}>
                <AutoComplete options={categories.map((c) => ({value: c}))} placeholder="Chọn có sẵn hoặc tạo mới"/>
            </Form.Item>
            <Form.Item name="description" label="Mô tả">
                <Input.TextArea rows={3}/>
            </Form.Item>
            <Form.Item name="tags" label="Thẻ">
                <Select mode="tags" placeholder="Type then Enter"/>
            </Form.Item>
            <Form.Item name="file" label="File Docx" valuePropName="fileList" getValueFromEvent={normFile} rules={[{required:true, message:'Chọn file DOCX'}]}>
                <Upload beforeUpload={() => false} maxCount={1} accept=".docx">
                    <Button icon={<UploadOutlined/>}>Select file</Button>
                </Upload>
            </Form.Item>
            <Form.Item name="thumbnail" label="Ảnh thumbnail" valuePropName="fileList" getValueFromEvent={normFile}>
                <Upload beforeUpload={()=> false} maxCount={1} accept="image/*" listType="picture">
                    <Button icon={<UploadOutlined/>}>Select thumbnail</Button>
                </Upload>
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={saving}>Save file</Button>
        </Form>
    );
}
