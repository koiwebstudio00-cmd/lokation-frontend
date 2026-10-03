"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { loadNotifications, readNotification } from "@/app/notification-actions";

type Notification = { id: string; title: string; body: string; href: string; readAt: string | null; createdAt: string };
export type NotificationPage = { items: Notification[]; total: number; unread: number; page: number; limit: number };
const changed = "ubikka-notifications-changed";
export function Notifications({ full = false }: { full?: boolean }) {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<NotificationPage | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const refresh = useCallback(async () => {
    try { setData(await loadNotifications(page, full ? 20 : 5)); setError(""); }
    catch { setError("No pudimos cargar las notificaciones. Volvé a intentar."); }
  }, [page, full]);
  useEffect(() => {
    let active = true;
    const update = () => { if (active && document.visibilityState === "visible") void refresh(); };
    update();
    const timer = setInterval(update, 45000);
    window.addEventListener("focus", update); window.addEventListener(changed, update);
    document.addEventListener("visibilitychange", update);
    return () => { active = false; clearInterval(timer); window.removeEventListener("focus", update);
      window.removeEventListener(changed, update); document.removeEventListener("visibilitychange", update); };
  }, [refresh]);
  const mark = async (id?: string) => {
    setBusy(true);
    try { await readNotification(id); await refresh(); window.dispatchEvent(new Event(changed)); }
    catch { setError("No pudimos marcar como leída. Volvé a intentar."); }
    finally { setBusy(false); }
  };
  const content = (item: Notification) => <>
    <span className="flex items-center gap-2 font-medium">{!item.readAt && <span className="size-2 shrink-0 rounded-full bg-primary" aria-label="Sin leer" />}{item.title}</span>
    <span className="mt-1 block text-sm text-muted-foreground">{item.body}</span>
    <time dateTime={item.createdAt} className="mt-2 block text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" })}</time>
  </>;
  const status = <>{error && <div role="alert" className="p-3 text-sm text-destructive">{error}<Button variant="ghost" size="sm" onClick={() => void refresh()}>Reintentar</Button></div>}
    {!data && !error && <p className="p-6 text-sm text-muted-foreground">Cargando notificaciones…</p>}
    {data?.items.length === 0 && <p className="p-6 text-sm text-muted-foreground">Todavía no tenés notificaciones.</p>}</>;
  if (full) return <section className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-semibold">Notificaciones</h1><p className="text-sm text-muted-foreground">{data ? `${data.unread} sin leer` : "Tu actividad reciente"}</p></div>
      <Button variant="outline" disabled={busy || !data?.unread} onClick={() => void mark()}><CheckCheck className="size-4" />Marcar todas como leídas</Button></div>
    {status}<div className="divide-y overflow-hidden rounded-xl border bg-card">{data?.items.map(item => <article key={item.id} className={`flex flex-wrap items-center justify-between gap-4 p-4 ${!item.readAt ? "bg-primary/5" : ""}`}>
      <Link href={item.href} className="min-w-0 flex-1 break-words" onClick={() => { if (!item.readAt) void mark(item.id); }}>{content(item)}</Link>
      {!item.readAt && <Button variant="ghost" size="sm" disabled={busy} onClick={() => void mark(item.id)}>Marcar como leída</Button>}
    </article>)}</div>
    {data && data.total > 20 && <nav aria-label="Páginas de notificaciones" className="flex items-center justify-center gap-4"><Button variant="outline" disabled={page === 1} onClick={() => setPage(page-1)}>Anterior</Button><span>{page} / {Math.ceil(data.total/20)}</span><Button variant="outline" disabled={page*20 >= data.total} onClick={() => setPage(page+1)}>Siguiente</Button></nav>}
  </section>;
  return <DropdownMenu onOpenChange={open => { if (open) void refresh(); }}>
    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="relative shrink-0" aria-label={`Notificaciones${data ? `, ${data.unread} sin leer` : ""}`}><Bell className="size-5" />
      {!!data?.unread && <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-primary px-1 text-[10px] font-bold leading-4 text-primary-foreground">{data.unread > 99 ? "99+" : data.unread}</span>}
    </Button></DropdownMenuTrigger>
    <DropdownMenuContent align="end" sideOffset={8} className="w-[min(380px,calc(100vw-24px))]">
      <DropdownMenuLabel className="flex justify-between">Notificaciones <span className="text-muted-foreground">{data?.unread ?? 0} sin leer</span></DropdownMenuLabel><DropdownMenuSeparator />
      {status}<div className="max-h-[55dvh] overflow-y-auto">{data?.items.map(item => <DropdownMenuItem key={item.id} asChild className="items-start p-3">
        <Link href={item.href} className="block! break-words" onClick={() => { if (!item.readAt) void mark(item.id); }}>{content(item)}</Link>
      </DropdownMenuItem>)}</div>
      <DropdownMenuSeparator /><DropdownMenuItem asChild><Link href="/notificaciones" className="justify-center font-medium">Ver todas las notificaciones</Link></DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>;
}
