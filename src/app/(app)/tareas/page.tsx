import Link from "next/link";
import { redirect } from "next/navigation";
import { apiFetch, getCurrentUser } from "@/lib/api";
import { TaskEditor, TaskTable, type Task, type TeamMember } from "@/components/tasks/task-manager";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

export const metadata = { title: "Tareas del equipo" };
export default async function TasksPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const me = await getCurrentUser();
  if (!me || !["admin", "agente"].includes(me.rol)) redirect("/");
  const admin = me.rol === "admin";
  const params = await searchParams;
  const value = (key: string) => typeof params[key] === "string" ? params[key] as string : "";
  const q = value("q").slice(0, 160);
  const statuses = { pendiente: "Pendiente", en_curso: "En curso", completada: "Completada", cancelada: "Cancelada" };
  const status = value("status") in statuses ? value("status") : "";
  const assignedToId = /^[0-9a-f-]{36}$/i.test(value("assignedToId")) ? value("assignedToId") : "";
  const requested = Number(value("page"));
  const page = Number.isSafeInteger(requested) && requested > 0 && requested <= 100000 ? requested : 1;
  const [result, users] = await Promise.all([
    apiFetch<{ data: Task[]; meta: { total: number; limit: number } }>("/v1/tasks", { query: { page, ...(q ? { q } : {}), ...(status ? { status } : {}), ...(assignedToId ? { assignedToId } : {}) } }),
    admin ? apiFetch<{ data: TeamMember[] }>("/v1/users", { query: { estado: "activo" } }) : Promise.resolve({ data: [] })
  ]);
  const href = (next: number) => `?${new URLSearchParams({ q, status, assignedToId, page: String(next) })}`;
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Argentina/Buenos_Aires", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  return <div className="mx-auto max-w-7xl space-y-6"><header className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-2xl font-semibold">{admin ? "Tareas del equipo" : "Mis tareas"}</h1><p className="text-sm text-muted-foreground">{result.meta.total} tareas encontradas. {admin ? "Organizá el trabajo y asigná responsables." : "Consultá tus pendientes y actualizá su estado."}</p></div>{admin && <TaskEditor members={users.data} />}</header>
    <form key={`${q}:${status}:${assignedToId}`} className="flex flex-wrap items-end gap-4 rounded-xl border p-4"><div className="space-y-2"><Label htmlFor="task-q">Buscar</Label><Input id="task-q" name="q" defaultValue={q} placeholder="Título de la tarea" /></div><div className="space-y-2"><Label htmlFor="task-filter-status">Estado</Label><Select id="task-filter-status" name="status" defaultValue={status}><option value="">Todos</option>{Object.entries(statuses).map(([key,label]) => <option key={key} value={key}>{label}</option>)}</Select></div>{admin && <div className="space-y-2"><Label htmlFor="task-filter-user">Responsable</Label><Select id="task-filter-user" name="assignedToId" defaultValue={assignedToId}><option value="">Todo el equipo</option>{users.data.map(user => <option key={user.id} value={user.id}>{user.nombre}</option>)}</Select></div>}<Button type="submit">Filtrar</Button><Button asChild variant="ghost"><Link href="/tareas">Limpiar</Link></Button></form>
    <TaskTable tasks={result.data} members={users.data} admin={admin} today={today} />
    <nav aria-label="Páginas de tareas" className="flex items-center justify-center gap-4">{page > 1 && <Button asChild variant="outline"><Link href={href(page - 1)}>Anterior</Link></Button>}<span className="text-sm">Página {page}</span>{page * result.meta.limit < result.meta.total && <Button asChild variant="outline"><Link href={href(page + 1)}>Siguiente</Link></Button>}</nav>
  </div>;
}
