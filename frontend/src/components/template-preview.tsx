'use client';
import { ITemplate } from '@/types';
import { Tag } from 'antd';
import Link from 'next/link';
import UseTemplateButton from './use-template-button';
import DocBar from './doc-bar';
import styles from './editor.module.css';

interface IProps {
  template: ITemplate;
  html: string;
}

const BLANK_IN_HTML = /\[([^\[\]<>\n]{1,80})\]/g;
const UNNAMED_RE = /^[\s.…_-]*$/;

// Same page as the editor, read-only: blanks highlighted, panel lists what you'll fill in
export function TemplatePreview({template, html}: IProps) {
  const labels = new Map<string, number>();
  let unnamed = 0;
  const highlighted = html.replace(BLANK_IN_HTML, (match, inner: string) => {
    const label = inner.trim();
    if (UNNAMED_RE.test(label)) unnamed++;
    else labels.set(label, (labels.get(label) ?? 0) + 1);
    return `<span class="blank">${match}</span>`;
  });
  const named = Array.from(labels.entries());

  return (
    <div className={styles.editorPage}>
      <DocBar
        title={<h1 className={styles.pageTitle}>{template.name}</h1>}
        aside={<Tag>{template.category}</Tag>}
        meta={
          <>
            <span><Link href="/">Templates</Link></span>
            {template.description && <span>{template.description}</span>}
          </>
        }
        actions={<UseTemplateButton templateId={template._id}/>}
      />
      <div className={styles.workspace}>
        <div className="paper" dangerouslySetInnerHTML={{__html: highlighted}}/>
        <aside className={styles.panel} aria-labelledby="blanks-title">
          <h2 id="blanks-title" className={styles.panelTitle}>Blanks to fill</h2>
          <p className={styles.panelHint}>
            {named.length
              ? `${named.length} highlighted ${named.length === 1 ? 'blank' : 'blanks'}. Click Use template to fill them in.`
              : 'This template has no named blanks.'}
          </p>
          {named.length > 0 && (
            <ul className={styles.blankList}>
              {named.map(([label, count]) => (
                <li key={label}>
                  <span>{label}</span>
                  {count > 1 && <span className={styles.fieldCount}>{count} places</span>}
                </li>
              ))}
            </ul>
          )}
          {unnamed > 0 && (
            <p className={styles.panelNote}>
              Plus {unnamed} short {unnamed === 1 ? 'blank' : 'blanks'} like [..], such as the date.
            </p>
          )}
          {template.tags && template.tags.length > 0 && (
            <div className={styles.tagRow}>
              {template.tags.map((t) => <Tag key={t}>{t}</Tag>)}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
