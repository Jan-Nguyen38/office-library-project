'use client';

import { ITemplate } from "@/types";
import { Button } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import UseTemplateButton from "./use-template-button";
import styles from "./library.module.css";

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

function SheetContent({ template }: { template: ITemplate }) {
    return template.thumbnail
        // Decorative: the link carries the template name
        ? <img src={`${BASE}/${template.thumbnail}`} alt="" loading="lazy" />
        : <span className={styles.blank} aria-hidden="true">{template.name}</span>;
}

function Actions({ template, className }: { template: ITemplate; className: string }) {
    const router = useRouter();
    return (
        <div className={className}>
            <Button block onClick={() => router.push(`/templates/${template._id}`)}>Preview</Button>
            <UseTemplateButton templateId={template._id} block />
        </div>
    );
}

// Grid view: actions appear centered over the sheet on hover / keyboard focus
export default function TemplateCard({ template }: { template: ITemplate }) {
    const href = `/templates/${template._id}`;
    return (
        <article className={styles.item}>
            <div className={styles.thumb}>
                <Link href={href} className={styles.sheet} aria-label={template.name}>
                    <div className={styles.sheetPage}><SheetContent template={template} /></div>
                </Link>
                <Actions template={template} className={styles.overlay} />
            </div>
            <Link href={href} className={styles.name} tabIndex={-1}>{template.name}</Link>
            <div className={styles.category}>{template.category}</div>
            {template.description && <p className={styles.desc}>{template.description}</p>}
        </article>
    );
}

// List view: one ruled line per template, like a document register
export function TemplateRow({ template }: { template: ITemplate }) {
    const href = `/templates/${template._id}`;
    return (
        <article className={styles.row}>
            <Link href={href} className={styles.rowThumb} tabIndex={-1} aria-hidden="true">
                <div className={styles.sheetPage}><SheetContent template={template} /></div>
            </Link>
            <div className={styles.rowBody}>
                <Link href={href} className={styles.rowName}>{template.name}</Link>
                {template.description && <p className={styles.rowDesc}>{template.description}</p>}
            </div>
            <div className={styles.rowCategory}>{template.category}</div>
            <Actions template={template} className={styles.rowActions} />
        </article>
    );
}
