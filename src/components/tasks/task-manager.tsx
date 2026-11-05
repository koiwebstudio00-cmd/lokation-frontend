"use client";
import { useActionState, useEffect, useState } from "react";
import { Plus, Circle, Clock, CheckCircle2, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { saveTask, changeTaskStatus } from "@/actions/tasks";

export type TeamMember = { id: string; nombre: string };
export type Task = { id: string; title: string; description: string; status: string; priority: string; dueDate: string | null;
  createdAt: string; assignedToId: string; assignedTo: TeamMember; createdBy: { nombre: string } };
export const taskStatuses = { pendiente: "Pendiente", en_curso: "En curso", completada: "Completada", cancelada: "Cancelada" };
const statusIcons = { pendiente: Circle, en_curso: Clock, completada: CheckCircle2, cancelada: Ban };
const statusColors: Record<string, string> = { pendiente: "bg-amber-100 text-amber-900", en_curso: "bg-blue-100 text-blue-900", completada: "bg-emerald-100 text-emerald-900", cancelada: "bg-muted text-muted-foreground" };
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
  return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button variant={task ? "outline" : "default"}>{!task && <Plus className="size-4" />}{task ? "Editar" : "Nueva tarea"}</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>{task ? "Editar tarea" : "Nueva tarea"}</DialogTitle><DialogDescription>Asigná un responsable del equipo y una fecha de vencimiento opcional.</DialogDescription></DialogHeader><TaskForm task={task} members={members} onDone={() => setOpen(false)} /></DialogContent></Dialog>;
}
function TaskStatus({ task }: { task: Task }) {
  const [state, action, pending] = useActionState(changeTaskStatus.bind(null, task.id), {});
  return <form action={action} className="space-y-3"><Label htmlFor={`status-${task.id}`}>Estado</Label><div className="flex gap-2"><Select id={`status-${task.id}`} name="status" defaultValue={task.status} key={task.status}>{Object.entries(taskStatuses).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</Select><Button disabled={pending} type="submit">Actualizar</Button></div>{state.error && <p role="alert">{state.error}</p>}{state.success && <p role="status" className="text-sm">{state.success}</p>}</form>;
}
export function TaskTable({ tasks, members, admin, today }: { tasks: Task[]; members: TeamMember[]; admin: boolean; today: string }) {
  if (!tasks.length) return <p className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">No hay tareas con estos filtros.</p>;
  return <div className="rounded-xl border"><Table><TableHeader><TableRow><TableHead>Tarea</TableHead><TableHead>Responsable</TableHead><TableHead>Estado</TableHead><TableHead>Vencimiento</TableHead><TableHead>Acciones</TableHead></TableRow></TableHeader><TableBody>{tasks.map(task => {
    const Icon = statusIcons[task.status as keyof typeof statusIcons] ?? Circle;
    const overdue = task.dueDate && task.dueDate.slice(0, 10) < today && !["completada", "cancelada"].includes(task.status);
    return <TableRow key={task.id}><TableCell><p className="font-medium">{task.title}</p><p className="text-xs capitalize text-muted-foreground">Prioridad {task.priority}</p></TableCell><TableCell>{task.assignedTo.nombre}</TableCell><TableCell><Badge className={statusColors[task.status]}><Icon className="mr-1 size-3" />{taskStatuses[task.status as keyof typeof taskStatuses]}</Badge></TableCell><TableCell>{task.dueDate?.slice(0, 10) ?? "Sin fecha"}{overdue && <Badge variant="outline" className="ml-2 border-red-300 bg-red-50 text-red-800">Vencida</Badge>}</TableCell><TableCell><div className="flex gap-2">
      <Dialog><DialogTrigger asChild><Button variant="outline">Ver detalle</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>{task.title}</DialogTitle><DialogDescription>Asignada a {task.assignedTo.nombre} · Creada por {task.createdBy.nombre}</DialogDescription></DialogHeader><p className="whitespace-pre-wrap break-words text-sm">{task.description || "Sin descripción"}</p><TaskStatus task={task} /></DialogContent></Dialog>
      {admin && <TaskEditor task={task} members={members} />}
    </div></TableCell></TableRow>;
  })}</TableBody></Table></div>;
}
