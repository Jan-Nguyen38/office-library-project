import DocumentTable from "@/components/document-table";
import { IUserDoc } from "@/types";
import { sendRequest } from "@/utils/api";

export default async function DocumentsPage(){
    const docs = await sendRequest<IUserDoc[]>('/documents');
    return (
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: 24}}>
            <h2>My Documents</h2>
            <DocumentTable docs={docs}/>
        </div>        
    );

}