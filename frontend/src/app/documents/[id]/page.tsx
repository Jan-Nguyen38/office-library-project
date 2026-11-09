import DocumentEditor from '@/components/document-editor';
import { IUserDoc } from '@/types';
import { ApiError, sendRequest } from '@/utils/api';
import { notFound } from 'next/navigation';

export default async function DocumentPage({ params }: { params: { id: string } }) {
    let doc: IUserDoc;
    try {
        doc = await sendRequest<IUserDoc>(`/documents/${params.id}`);
    } catch (error) {
        if (error instanceof ApiError && (error.status === 404 || error.status === 400)) notFound();
        throw error;
    }
    if (!doc) notFound();

    return <DocumentEditor doc={doc}/>;
}
