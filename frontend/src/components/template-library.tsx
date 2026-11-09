'use client';

import { IPaginate, ITemplate } from "@/types";
import { Button, Col, Input, Pagination, Row, Select, Space } from "antd";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { PlusOutlined } from '@ant-design/icons';
import TemplateCard from "./template-card";
interface IProps{
    page: IPaginate<ITemplate>;
    categories: string[];
}


export default function TemplateLibrary({ page, categories }: IProps) {
    const router = useRouter();
    const params = useSearchParams();

    const updateQuery = ( key?: string, value?: string) => {
        const next = new URLSearchParams(params.toString());
        value ? next.set(key!, value) : next.delete(key!);
        if(key !=='current') next.delete('current');
        router.push(`/?${next.toString()}`);
    };
  return (
    <div style={{ padding: '24px' }}>
        <Space style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }} wrap>
            <Input.Search placeholder="Search templates..." allowClear style={{ width: 300 }} 
            defaultValue={params.get('q') ?? ''} 
            onSearch={(value) => updateQuery('q', value)}
            />
            <Select placeholder="Select category" allowClear style={{ width: 200 }}
                value={params.get('category') ?? undefined} 
                options={ categories.map((c) => ({ label: c, value: c })) }
                onChange={(value) => updateQuery('category', value)}/>
                <Link href="/template/new">
                    <Button type="primary" icon={<PlusOutlined />}>
                        Add Template
                    </Button>
                </Link>
        </Space>
        { page.results.length === 0 ? (
            <div>No templates found.</div>
        ) : (
                <Row gutter={[16, 16]}>
                    {page.results.map((t) => (
                        <Col key={t._id} xs={24} sm={12} md={8} lg={6}>
                            <TemplateCard template={t} />
                        </Col>
                    ))}
                </Row>

            
        )}
        <Pagination style={{ marginTop: 16, textAlign:'center'}} 
            current={parseInt(params.get('current') || '1')} 
            total={page.total} 
            pageSize={page.pageSize} onChange={(page) => updateQuery('current', page.toString())} />

    </div>
  );
}