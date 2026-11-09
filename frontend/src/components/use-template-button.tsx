'use client';

import { sendRequest } from "@/utils/api";
import { Button } from "antd";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function UseTemplateButton({ templateId }: { templateId: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const handleClick = async () => {
        setLoading(true);
        try {
            const response = await sendRequest<{_id: string}>('/documents', {
                method: 'POST',
                body: JSON.stringify({ templateId })
            }); 
            router.push(`/documents/${response._id}`);
        } catch (error) {
            console.error('Error using template:', error);
            setLoading(false);
        }
    }
    return <Button type="primary" loading={loading} onClick={handleClick} >Use Template</Button>
}