import { notFound } from 'next/navigation';
import { ApiError, sendRequest } from '@/utils/api';
import DocBar from '@/components/doc-bar';
import PrintButton from '@/components/print-button';
import styles from '@/components/editor.module.css';

export const dynamic = 'force-dynamic';

interface ISharedDoc {
  title: string;
  content: string;
  updatedAt: string;
}

export default async function SharedPage({ params }: { params: { shareId: string } }) {
  let doc: ISharedDoc;
  try {
    doc = await sendRequest<ISharedDoc>(`/documents/shared/${params.shareId}`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
  return (
    <div className={styles.editorPage}>
      <DocBar
        title={<h1 className={styles.pageTitle}>{doc.title}</h1>}
        meta={
          <>
            <span>Read-only copy shared with you</span>
            <span>Last updated {new Date(doc.updatedAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</span>
          </>
        }
        actions={<PrintButton />}
      />
      <div className={`${styles.workspace} ${styles.single}`}>
        <div className="paper" dangerouslySetInnerHTML={{ __html: doc.content }} />
      </div>
    </div>
  )
}
