import DocBar from "@/components/doc-bar";
import DocumentTable from "@/components/document-table";
import { IUserDoc } from "@/types";
import { sendRequest } from "@/utils/api";
import { Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import Link from "next/link";
import styles from "@/components/editor.module.css";

export default async function DocumentsPage(){
    const docs = await sendRequest<IUserDoc[]>('/documents');
    return (
        <div className={styles.editorPage}>
            <DocBar
                title={<h1 className={styles.pageTitle}>My documents</h1>}
                meta={<span>{docs.length} {docs.length === 1 ? 'document' : 'documents'}, most recently edited first</span>}
                actions={<Link href="/"><Button type="primary" icon={<PlusOutlined />}>New document</Button></Link>}
            />
            <main className={styles.listPage}>
                <DocumentTable docs={docs}/>
            </main>
        </div>
    );
}
