"use server";
import { revalidatePath } from "next/cache";
import { ApiError, apiFetch } from "@/lib/api";

type State = { error?: string; success?: string };
export async function saveTask(id: string | null, _state: State, form: FormData): Promise<State> {
  const body = { title: form.get("title"), description: form.get("description"), assignedToId: form.get("assignedToId"),
    priority: form.get("priority"), dueDate: form.get("dueDate") || null };
  try {
    await apiFetch(id ? `/v1/tasks/${encodeURIComponent(id)}` : "/v1/tasks", { method: id ? "PATCH" : "POST", body });
    revalidatePath("/tareas");
    return { success: "Tarea guardada." };
  } catch (error) { return { error: error instanceof ApiError ? error.message : "No pudimos guardar la tarea." }; }
}
export async function changeTaskStatus(id: string, _state: State, form: FormData): Promise<State> {
  try {
    await apiFetch(`/v1/tasks/${encodeURIComponent(id)}`, { method: "PATCH", body: { status: form.get("status") } });
    revalidatePath("/tareas");
    return { success: "Estado actualizado." };
  } catch (error) { return { error: error instanceof ApiError ? error.message : "No pudimos actualizar la tarea." }; }
}
