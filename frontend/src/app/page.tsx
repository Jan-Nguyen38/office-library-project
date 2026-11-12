export const dynamic= 'force-dynamic'
import { sendRequest } from "@/utils/api";
import { IPaginate, ITemplate } from "@/types";
import TemplateLibrary from "@/components/template-library";

const PAGE_SIZE = 12;

export default async function Home({searchParams} : { searchParams: {q?: string; category?: string; current?: string}; }) {
  const qs = new URLSearchParams({ current: searchParams.current ?? '1', pageSize: String(PAGE_SIZE)});
  if (searchParams.q) qs.set('q', searchParams.q);
  if (searchParams.category) qs.set('category', searchParams.category);

  const countQs = searchParams.q ? `?${new URLSearchParams({ q: searchParams.q })}` : '';
  const [ page, categories, counts] = await Promise.all([
    sendRequest<IPaginate<ITemplate>>(`/templates?${qs.toString()}`),
    sendRequest<string[]>(`/templates/categories`),
    sendRequest<Record<string, number>>(`/templates/categories/counts${countQs}`)
  ]);
  return <TemplateLibrary page={page} pageSize={PAGE_SIZE} categories={categories} counts={counts} />;
}
