import type { ReactNode } from "react";
import styles from "./editor.module.css";

interface IProps {
    title: ReactNode;
    // Small text right after the title, e.g. "Edited 5 minutes ago"
    aside?: ReactNode;
    // Second line: source, status, counts
    meta?: ReactNode;
    actions?: ReactNode;
    // Optional full-width row under the bar, e.g. the formatting toolbar
    children?: ReactNode;
}

// Shared page header for everything that shows a document page: editor, template preview, shared copy, document list
export default function DocBar({ title, aside, meta, actions, children }: IProps) {
    return (
        <header className={`${styles.docBar} no-print`}>
            <div className={styles.docBarInner}>
                <div className={styles.titleRow}>
                    {title}
                    {aside && <span className={styles.edited}>{aside}</span>}
                </div>
                {meta && <div className={styles.meta}>{meta}</div>}
                {actions && <div className={styles.actions}>{actions}</div>}
            </div>
            {children && <div className={styles.toolbarRow}>{children}</div>}
        </header>
    );
}
