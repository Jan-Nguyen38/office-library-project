'use client';

import { sendRequest } from "@/utils/api";
import { Button, ButtonProps, message } from "antd";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = { templateId: string } & Pick<ButtonProps, 'size' | 'block' | 'className'>;

export default function UseTemplateButton({ templateId, ...buttonProps }: Props) {
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
            message.error(error instanceof Error ? error.message : 'Could not create a document from this template');
            setLoading(false);
        }
    }
    return <Button {...buttonProps} type="primary" loading={loading} onClick={handleClick}>Use template</Button>
}
