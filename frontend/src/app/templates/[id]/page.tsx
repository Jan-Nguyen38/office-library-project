import { ApiError, sendRequest } from '@/utils/api';
import { ITemplate } from '@/types';
import { notFound } from 'next/navigation';
import { TemplatePreview } from '@/components/template-preview';
export default async function TemplatePage({ params }: { params: { id: string } }) {
    let template: ITemplate;
    let html:string;
    try {
        [template, { html }] = await Promise.all([
            sendRequest<ITemplate>(`/templates/${params.id}`),
            sendRequest<{ html: string }>(`/templates/${params.id}/content`)
        ]);
       
    } catch (error) {
        if (error instanceof ApiError && (error.status === 404 || error.status === 400)) notFound();
        throw error;
    }

  
    return (<TemplatePreview template= {template} html={html}/>);
}