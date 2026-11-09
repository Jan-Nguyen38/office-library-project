const BASE = process.env.NEXT_PUBLIC_BACKEND_URL;
import { IPaginate, ITemplate } from "@/types";
export  class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
}}
export async function sendRequest<T>(path: string, init: RequestInit = {}):Promise<T>{
    // Let the browser set multipart/form-data with its boundary for FormData bodies
    const isFormData = init.body instanceof FormData;
    const res = await fetch(`${BASE}${path}`, {
        cache: 'no-store',
        ...init,
        headers: isFormData ? init.headers : { 'Content-Type': 'application/json', ...init.headers },
    });
    const body = await res.json().catch(() => null);
    if (!res.ok) throw new ApiError(body?.message ?? 'Lỗi gọi API', res.status);
    return body?.data as T;
}