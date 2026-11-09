import Image from "next/image";
import styles from "./page.module.css";
export const dynamic= 'force-dynamic'
import { sendRequest } from "@/utils/api";
import { IPaginate, ITemplate } from "@/types";
import TemplateLibrary from "@/components/template-library";

export default async function Home({searchParams} : { searchParams: {q?: string; category?: string; current?: string}; }) {
  const qs = new URLSearchParams({ current: searchParams.current ?? '1', pageSize: '10'});
  if (searchParams.q) qs.set('q', searchParams.q);
  if (searchParams.category) qs.set('category', searchParams.category);

  const [ page, categories] = await Promise.all([
    sendRequest<IPaginate<ITemplate>>(`/templates?${qs.toString()}`),
    sendRequest<string[]>(`/templates/categories`)
  ]);
  console.log('categories', categories);
  return <TemplateLibrary page={page} categories={categories} />;
}
