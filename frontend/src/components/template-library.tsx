'use client';

import { IPaginate, ITemplate } from "@/types";
import { Button, Input, Pagination, Space, Tabs } from "antd";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AppstoreOutlined, PlusOutlined, SearchOutlined, UnorderedListOutlined } from '@ant-design/icons';
import TemplateCard, { TemplateRow } from "./template-card";
import styles from "./library.module.css";

interface IProps{
    page: IPaginate<ITemplate>;
    pageSize: number;
    categories: string[];
    // Templates per category, filtered by the current keyword
    counts: Record<string, number>;
}

const ALL = '__all';

function TabLabel({ name, count }: { name: string; count: number }) {
    return <>{name}<span className={styles.tabCount}>{count}</span></>;
}

export default function TemplateLibrary({ page, pageSize, categories, counts }: IProps) {
    const router = useRouter();
    const params = useSearchParams();
    const q = params.get('q') ?? '';
    const category = params.get('category');
    const view = params.get('view') === 'list' ? 'list' : 'grid';

    const updateQuery = (key: string, value?: string) => {
        const next = new URLSearchParams(params.toString());
        value ? next.set(key, value) : next.delete(key);
        // Switching view keeps the current page; any other filter change starts from page 1
        if (key !== 'current' && key !== 'view') next.delete('current');
        router.push(`/?${next.toString()}`);
    };

    const totalAll = Object.values(counts).reduce((sum, n) => sum + n, 0);

    return (
        <main className={styles.page}>
            <header className={styles.hero}>
                <h1 className={styles.title}>What document do you need?</h1>
                <Input
                    key={q}
                    className={styles.search}
                    // Inline so it wins over antd's own input radius
                    style={{ borderRadius: 999 }}
                    size="large"
                    prefix={<SearchOutlined aria-hidden />}
                    placeholder="Search templates, e.g. leave request"
                    aria-label="Search templates"
                    allowClear
                    defaultValue={q}
                    onPressEnter={(e) => updateQuery('q', e.currentTarget.value.trim())}
                    // Clearing the box also clears the keyword filter
                    onChange={(e) => { if (e.target.value === '' && q) updateQuery('q'); }}
                />
                {q && <p className={styles.searchNote}>Results for “{q}”</p>}
            </header>

            <Tabs
                className={styles.tabs}
                activeKey={category ?? ALL}
                onChange={(key) => updateQuery('category', key === ALL ? undefined : key)}
                tabBarExtraContent={{
                    right: (
                        <div className={styles.toolbar}>
                            <Space.Compact>
                                <Button
                                    icon={<AppstoreOutlined />}
                                    type={view === 'grid' ? 'primary' : 'default'}
                                    aria-label="Grid view" title="Grid view" aria-pressed={view === 'grid'}
                                    onClick={() => updateQuery('view')}
                                />
                                <Button
                                    icon={<UnorderedListOutlined />}
                                    type={view === 'list' ? 'primary' : 'default'}
                                    aria-label="List view" title="List view" aria-pressed={view === 'list'}
                                    onClick={() => updateQuery('view', 'list')}
                                />
                            </Space.Compact>
                            <Link href="/templates/new" aria-label="Add template">
                                <Button icon={<PlusOutlined />}><span className={styles.addLabel}>Add template</span></Button>
                            </Link>
                        </div>
                    ),
                }}
                items={[
                    { key: ALL, label: <TabLabel name="All" count={totalAll} /> },
                    ...categories.map((c) => ({ key: c, label: <TabLabel name={c} count={counts[c] ?? 0} /> })),
                ]}
            />

            {page.results.length === 0 ? (
                <div className={styles.empty}>
                    <p>
                        {q ? `No templates match “${q}”. ` : 'This category has no templates yet. '}
                        Try a shorter keyword, another category, or add your own template.
                    </p>
                    <Button onClick={() => router.push('/')}>Show all templates</Button>
                </div>
            ) : view === 'list' ? (
                <div className={styles.list}>
                    {page.results.map((t) => <TemplateRow key={t._id} template={t} />)}
                </div>
            ) : (
                <div className={styles.grid}>
                    {page.results.map((t) => <TemplateCard key={t._id} template={t} />)}
                </div>
            )}

            <Pagination
                className={styles.pager}
                align="center"
                hideOnSinglePage
                showSizeChanger={false}
                current={parseInt(params.get('current') || '1')}
                total={page.total}
                pageSize={pageSize}
                onChange={(p) => updateQuery('current', p.toString())}
            />
        </main>
    );
}
