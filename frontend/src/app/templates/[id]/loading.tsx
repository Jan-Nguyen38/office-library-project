'use client';
import { Skeleton } from 'antd';
import DocBar from '@/components/doc-bar';
import styles from '@/components/editor.module.css';

// Mirrors the layout of TemplatePreview so the page doesn't jump when data arrives
export default function TemplateLoading() {
  return (
    <div className={styles.editorPage}>
      <DocBar
        title={<Skeleton.Input active style={{ width: 280 }} />}
        meta={<Skeleton.Input active size="small" style={{ width: 200 }} />}
        actions={<Skeleton.Button active style={{ width: 120 }} />}
      />
      <div className={styles.workspace}>
        <div className="paper">
          <Skeleton active title={{ width: '40%' }} paragraph={{ rows: 12 }} />
        </div>
        <aside className={styles.panel}>
          <Skeleton active paragraph={{ rows: 6 }} />
        </aside>
      </div>
    </div>
  );
}
