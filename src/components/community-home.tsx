import Link from "next/link";
import {FolderOpen,Building2,MessageSquarePlus,ArrowRight,FileText} from "lucide-react";
import {apiFetch} from "@/lib/api";
import {HomeSummary} from "@/components/home-summary";
import {Button} from "@/components/ui/button";
import {Table,TableHeader,TableHead,TableBody,TableRow,TableCell} from "@/components/ui/table";
import {TaskTable,type Task} from "@/components/tasks/task-manager";
import {type VaultFile} from "@/components/rentals/file-vault";
import {formatDate} from "@/lib/utils";
type Result<T>={data:T[];meta:{total:number}};
export async function CommunityHome({nombre}:{nombre:string}){
 const [pending,progress,files]=await Promise.all([
  apiFetch<Result<Task>>("/v1/tasks",{query:{status:"pendiente",sort:"due"}}),
  apiFetch<Result<Task>>("/v1/tasks",{query:{status:"en_curso",sort:"due"}}),
  apiFetch<Result<VaultFile>>("/v1/rental-documents",{query:{limit:5,sort:"modified",direction:"desc"}}),
 ]);
 const today=new Intl.DateTimeFormat("en-CA",{timeZone:"America/Argentina/Buenos_Aires",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
 const tasks=[...pending.data,...progress.data].sort((a,b)=>(a.dueDate??"9999").localeCompare(b.dueDate??"9999")).slice(0,6);
 return <div className="space-y-8">
 <header className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-2xl font-semibold tracking-tight">Hola, {nombre.split(" ")[0]}</h1><p className="mt-1 text-sm text-muted-foreground">Tus pendientes y el material del equipo, en un solo lugar.</p></div><Button asChild variant="outline" size="sm"><Link href="/propiedades"><Building2/>Consultar propiedades</Link></Button></header>
 <HomeSummary items={[
  {label:"Pendientes",value:pending.meta.total,href:"/tareas?status=pendiente",description:"Por comenzar"},
  {label:"En curso",value:progress.meta.total,href:"/tareas?status=en_curso",description:"Trabajo en marcha"},
  {label:"Archivos disponibles",value:files.meta.total,href:"/archivos",description:"Propios y del equipo"},
 ]}/>
 <section aria-labelledby="home-tasks" className="space-y-3">
  <div className="flex items-center justify-between gap-2"><div><h2 id="home-tasks" className="font-semibold">Mis próximas tareas</h2><p className="mt-1 text-sm text-muted-foreground">Ordenadas por vencimiento.</p></div><Button asChild variant="ghost" size="sm"><Link href="/tareas">Ver todas<ArrowRight/></Link></Button></div>
  <TaskTable tasks={tasks} members={[]} admin={false} today={today}/>
 </section>
 <section aria-labelledby="home-files" className="space-y-3">
  <div className="flex items-center justify-between gap-2"><h2 id="home-files" className="font-semibold">Archivos recientes</h2><Button asChild variant="ghost" size="sm"><Link href="/archivos">Abrir bóveda<ArrowRight/></Link></Button></div>
  {files.data.length?<Table><TableHeader><TableRow><TableHead>Archivo</TableHead><TableHead className="text-right">Modificado</TableHead></TableRow></TableHeader><TableBody>{files.data.map(file=><TableRow key={file.id}><TableCell className="py-3"><Link href={`/archivos?q=${encodeURIComponent(file.title)}`} className="flex items-center gap-3 font-medium hover:text-primary focus-visible:outline-ring"><FileText className="size-4 shrink-0 text-muted-foreground"/><span className="whitespace-normal break-words">{file.title}</span></Link></TableCell><TableCell className="text-right text-xs tabular-nums text-muted-foreground">{formatDate(file.updatedAt??file.createdAt)}</TableCell></TableRow>)}</TableBody></Table>:<div className="border-y py-10 text-center text-sm text-muted-foreground"><FolderOpen className="mx-auto mb-3 size-5"/>Todavía no hay archivos disponibles.</div>}
 </section>
 <footer className="flex flex-wrap items-center justify-between gap-2 border-t pt-4 text-sm text-muted-foreground"><p>¿Tenés una idea para mejorar el trabajo?</p><Button asChild variant="ghost" size="sm"><Link href="/feedback/sugerencias/nueva"><MessageSquarePlus/>Enviar sugerencia</Link></Button></footer>
 </div>;
}
