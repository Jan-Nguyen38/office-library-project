import DocumentEditor from '@/components/document-editor';
import { IPaginate, ITemplate, IUserDoc } from '@/types';
import { ApiError, sendRequest } from '@/utils/api';
import { notFound } from 'next/navigation';

const plain = (html: string) => html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().normalize('NFC').toLowerCase();

// The document's templateId can point to a template that no longer exists (e.g. templates re-seeded).
// Fall back to the template whose name matches the document's main heading.
async function findTemplate(doc: IUserDoc): Promise<ITemplate | null> {
    const byId = await sendRequest<ITemplate>(`/templates/${doc.templateId}`).catch(() => null);
    if (byId) return byId;
    const heading = doc.content.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1];
    if (!heading) return null;
    const all = await sendRequest<IPaginate<ITemplate>>('/templates?pageSize=100').catch(() => null);
    return all?.results.find((t) => plain(t.name) === plain(heading)) ?? null;
}

export default async function DocumentPage({ params }: { params: { id: string } }) {
    let doc: IUserDoc;
    try {
        doc = await sendRequest<IUserDoc>(`/documents/${params.id}`);
    } catch (error) {
        if (error instanceof ApiError && (error.status === 404 || error.status === 400)) notFound();
        throw error;
    }
    if (!doc) notFound();

    const template = await findTemplate(doc);
    const templateHtml = template
        ? (await sendRequest<{ html: string }>(`/templates/${template._id}/content`).catch(() => null))?.html ?? null
        : null;

    return <DocumentEditor doc={doc} template={template} templateHtml={templateHtml}/>;
}
