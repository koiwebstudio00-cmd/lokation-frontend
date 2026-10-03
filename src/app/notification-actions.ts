"use server";
import { apiFetch } from "@/lib/api";
import type { NotificationPage } from "@/components/notifications";
export async function loadNotifications(page = 1, limit = 5): Promise<NotificationPage> {
  return apiFetch<NotificationPage>(`/v1/notifications?page=${page}&limit=${limit}`);
}
export async function readNotification(id?: string) {
  if (id && !/^[0-9a-f-]{36}$/i.test(id)) throw new Error("Identificador inválido");
  await apiFetch(`/v1/notifications/${id ? `${id}/read` : "read-all"}`, { method: "PATCH", body: {} });
}
