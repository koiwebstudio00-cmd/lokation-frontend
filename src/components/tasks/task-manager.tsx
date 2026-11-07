"use client";
import { useActionState, useEffect, useState } from "react";
import { Plus, Circle, Clock, CheckCircle2, Ban, ListTodo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { saveTask, changeTaskStatus } from "@/actions/tasks";

export type TeamMember = { id: string; nombre: string };
export type Task = { id: string; title: string; description: string; status: string; priority: string; dueDate: string | null;
  createdAt: string; assignedToId: string; assignedTo: TeamMember; createdBy: { nombre: string } };
export const taskStatuses = { pendiente: "Pendiente", en_curso: "En curso", completada: "Completada", cancelada: "Cancelada" };
const statusIcons = { pendiente: Circle, en_curso: Clock, completada: CheckCircle2, cancelada: Ban };
const statusColors: Record<string, string> = { pendiente: "text-muted-foreground", en_curso: "text-blue-700 dark:text-blue-400", completada: "text-emerald-700 dark:text-emerald-400", cancelada: "bg-muted text-muted-foreground" };
function TaskForm({ task, members, onDone }: { task?: Task; members: TeamMember[]; onDone: () => void }) {
  const [state, action, pending] = useActionState(saveTask.bind(null, task?.id ?? null), {});
  useEffect(() => { if (state.success) onDone(); }, [state, onDone]);
  return <form action={action} className="space-y-4">
    <div className="space-y-2"><Label htmlFor="task-title">Título</Label><Input id="task-title" name="title" required minLength={3} maxLength={160} defaultValue={task?.title} /></div>
    <div className="space-y-2"><Label htmlFor="task-description">Descripción</Label><Textarea id="task-description" name="description" maxLength={5000} defaultValue={task?.description} /></div>
    <div className="space-y-2"><Label htmlFor="task-assignee">Responsable</Label><Select id="task-assignee" name="assignedToId" required defaultValue={task?.assignedToId ?? ""}><option value="" disabled>Elegí un integrante</option>{members.map(user => <option key={user.id} value={user.id}>{user.nombre}</option>)}</Select></div>
    <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label htmlFor="task-priority">Prioridad</Label><Select id="task-priority" name="priority" defaultValue={task?.priority ?? "normal"}><option value="baja">Baja</option><option value="normal">Normal</option><option value="alta">Alta</option></Select></div><div className="space-y-2"><Label htmlFor="task-due">Vencimiento</Label><Input id="task-due" name="dueDate" type="date" defaultValue={task?.dueDate?.slice(0, 10)} /></div></div>
    {state.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
    <Button disabled={pending || !members.length} type="submit">{pending ? "Guardando…" : "Guardar tarea"}</Button>
  </form>;
}
export function TaskEditor({ task, members }: { task?: Task; members: TeamMember[] }) {
  const [open, setOpen] = useState(false);
  return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button size="sm" variant={task ? "ghost" : "default"}>{!task && <Plus className="size-4" />}{task ? "Editar" : "Nueva tarea"}</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>{task ? "Editar tarea" : "Nueva tarea"}</DialogTitle><DialogDescription>Asigná un responsable del equipo y una fecha de vencimiento opcional.</DialogDescription></DialogHeader><TaskForm task={task} members={members} onDone={() => setOpen(false)} /></DialogContent></Dialog>;
}
function TaskStatus({ task }: { task: Task }) {
  const [state, action, pending] = useActionState(changeTaskStatus.bind(null, task.id), {});
  return <form action={action} className="space-y-3"><Label htmlFor={`status-${task.id}`}>Estado</Label><div className="flex gap-2"><Select id={`status-${task.id}`} name="status" defaultValue={task.status} key={task.status}>{Object.entries(taskStatuses).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</Select><Button disabled={pending} type="submit">Actualizar</Button></div>{state.error && <p role="alert">{state.error}</p>}{state.success && <p role="status" className="text-sm">{state.success}</p>}</form>;
}
export function TaskTable({ tasks, members, admin, today }: { tasks: Task[]; members: TeamMember[]; admin: boolean; today: string }) {
  if (!tasks.length) return <div className="border-y py-14 text-center"><ListTodo className="mx-auto mb-3 size-6 text-muted-foreground"/><p className="text-sm font-medium">No hay tareas para mostrar</p><p className="mt-1 text-sm text-muted-foreground">Las tareas que coincidan con estos filtros aparecerán acá.</p></div>;
  return <Table><TableHeader><TableRow><TableHead>Tarea</TableHead>{admin && <TableHead>Responsable</TableHead>}<TableHead>Estado</TableHead><TableHead className="hidden md:table-cell">Prioridad</TableHead><TableHead className="text-right">Vencimiento</TableHead>{admin && <TableHead><span className="sr-only">Acciones</span></TableHead>}</TableRow></TableHeader><TableBody>{tasks.map(task => {
    const Icon = statusIcons[task.status as keyof typeof statusIcons] ?? Circle;
    const overdue = task.dueDate && task.dueDate.slice(0, 10) < today && !["completada", "cancelada"].includes(task.status);
    const due = task.dueDate ? new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(task.dueDate)) : "Sin fecha";
    return <TableRow key={task.id}>
      <TableCell className="w-full min-w-40 max-w-md py-4 whitespace-normal">
        <Dialog><DialogTrigger asChild><Button variant="link" className="h-auto max-w-full justify-start p-0 text-left font-medium whitespace-normal text-foreground hover:text-primary">{task.title}</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>{task.title}</DialogTitle><DialogDescription>Asignada a {task.assignedTo.nombre} · Creada por {task.createdBy.nombre}</DialogDescription></DialogHeader><div className="flex flex-wrap gap-4 border-y py-3 text-sm text-muted-foreground"><span className="capitalize">Prioridad {task.priority}</span><span>Vencimiento: {task.dueDate?.slice(0, 10) ?? "Sin fecha"}</span></div><p className="whitespace-pre-wrap break-words text-sm">{task.description || "Sin descripción"}</p><TaskStatus task={task} /></DialogContent></Dialog>
        <p className="mt-1 text-xs capitalize text-muted-foreground md:hidden">Prioridad {task.priority}</p>
      </TableCell>
      {admin && <TableCell className="text-muted-foreground">{task.assignedTo.nombre}</TableCell>}
      <TableCell><span className={`inline-flex items-center gap-2 text-xs ${statusColors[task.status]}`}><Icon aria-hidden="true" className="size-3.5" />{taskStatuses[task.status as keyof typeof taskStatuses]}</span></TableCell>
      <TableCell className="hidden text-xs md:table-cell"><span className={task.priority === "alta" ? "font-medium text-amber-700 dark:text-amber-400" : "text-muted-foreground"}>{task.priority === "alta" ? "Alta" : task.priority === "baja" ? "Baja" : "Normal"}</span></TableCell>
      <TableCell className={`text-right text-xs tabular-nums ${overdue ? "text-destructive" : "text-muted-foreground"}`}><time dateTime={task.dueDate?.slice(0,10)}>{due}</time>{overdue && <span className="mt-1 block text-[11px]">Vencida</span>}</TableCell>
      {admin && <TableCell><TaskEditor task={task} members={members} /></TableCell>}
    </TableRow>;
  })}</TableBody></Table>;
}
