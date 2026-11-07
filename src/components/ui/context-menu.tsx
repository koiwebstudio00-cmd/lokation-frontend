"use client";
import * as React from "react";
import {ContextMenu as Primitive} from "radix-ui";
import {cn} from "@/lib/utils";
export const ContextMenu=Primitive.Root;
export const ContextMenuTrigger=Primitive.Trigger;
export function ContextMenuContent({className,...props}:React.ComponentProps<typeof Primitive.Content>){return <Primitive.Portal><Primitive.Content className={cn("z-50 min-w-52 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95",className)} {...props}/></Primitive.Portal>;}
export function ContextMenuItem({className,...props}:React.ComponentProps<typeof Primitive.Item>){return <Primitive.Item className={cn("relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:size-4",className)} {...props}/>;}
