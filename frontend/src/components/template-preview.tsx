'use client'
import { ITemplate } from '@/types';
import { Space, Tag, Typography } from 'antd';
import UseTemplateButton from './use-template-button';

interface IProps {
  template: ITemplate;
  html: string;
}

export async function TemplatePreview({template, html}: IProps) {
  return (
    <div style={{ padding: '24px' }}>
        <Space align='center' wrap>
            <Typography.Title level={3} style={{margin: 0}}>{template.name}</Typography.Title>
            <Tag>{template.category}</Tag>
            <UseTemplateButton templateId={template._id}/>
        </Space>
        <div className="paper" dangerouslySetInnerHTML={{__html: html}}/>
    </div>
  );
}