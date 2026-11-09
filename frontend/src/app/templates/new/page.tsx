import TemplateForm from "@/components/template-form";
import { sendRequest } from "@/utils/api";

export default async function NewTemplatePage(){
    const categories = await sendRequest<string[]>('/templates/categories');
    return <TemplateForm categories={categories}/>;
}