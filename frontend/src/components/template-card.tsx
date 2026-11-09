import {ITemplate} from "@/types/";
import { Card, Tag } from 'antd';
import Link from "next/link";
const BASE = process.env.NEXT_PUBLIC_BACKEND_URL;
export default function TemplateCard({ template }: { template: ITemplate }) {
    return (
        <Link href={`/templates/${template._id}`}>
            <Card hoverable cover={<img alt={template.name} src={`${BASE}/${template.thumbnail}`} style={{ height: 180, objectFit: 'cover' }} />}>
                <Card.Meta
                    title={template.name}
                    description={template.description}
                />
                <Tag style={{ marginTop: 10 }}>{template.category}</Tag>
            </Card>
        </Link>
    );
}