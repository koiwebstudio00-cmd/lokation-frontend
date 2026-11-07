"use client";
import {useEffect,useRef,useState,type PointerEvent as ReactPointerEvent,type MouseEvent as ReactMouseEvent,type KeyboardEvent as ReactKeyboardEvent} from "react";
import {intersects,nextSelection,selectionRectangle,type Point} from "@/lib/vault-selection";

type Item={id:string;folder:boolean};
export function useVaultSelection(items:Item[],canMove:boolean,onOpen:(id:string)=>void,onMove:(ids:string[],folder:string|null)=>void,resetKey?:unknown){
 const [touchMode,setTouchMode]=useState(false);
 const [selected,setSelected]=useState<string[]>([]),[box,setBox]=useState<ReturnType<typeof selectionRectangle>|null>(null),[dropTarget,setDropTarget]=useState<string|null>(null),[dragPreview,setDragPreview]=useState<{x:number;y:number;count:number}|null>(null);
 const [previousKey,setPreviousKey]=useState(resetKey);
 if(previousKey!==resetKey){setPreviousKey(resetKey);setSelected([]);setBox(null);setDropTarget(null);setDragPreview(null);setTouchMode(false);}
 const anchor=useRef<string|null>(null),start=useRef<Point|null>(null),base=useRef<string[]>([]);
 const held=useRef(false),moved=useRef(false);
 const hold=useRef<ReturnType<typeof setTimeout>|null>(null),touchStart=useRef<Point|null>(null),suppressClick=useRef(false),touchSelecting=useRef(false);
 const ids=items.map(i=>i.id);
 function cancelHold(){if(hold.current)clearTimeout(hold.current);hold.current=null;}
 useEffect(()=>()=>{if(hold.current)clearTimeout(hold.current);},[]);
 function choose(id:string,e:{shiftKey:boolean;metaKey:boolean;ctrlKey:boolean}){setSelected(prev=>nextSelection(ids,prev,id,anchor.current,e.shiftKey,e.metaKey||e.ctrlKey));if(!e.shiftKey)anchor.current=id;}
 function itemProps(id:string){return {
  style:{touchAction:touchMode?'none':'pan-y'},'data-vault-item':id,'data-selected':selected.includes(id)||undefined,tabIndex:0,
  draggable:false,
  onClick:(e:ReactMouseEvent)=>{if((!e.currentTarget.contains(e.target as Node)||(e.target as HTMLElement).closest('[data-vault-menu]')))return;e.stopPropagation();if(suppressClick.current){suppressClick.current=false;return;}if(touchSelecting.current){setSelected(prev=>nextSelection(ids,prev,id,null,false,true));return;}choose(id,e);},
  onDoubleClick:(e:ReactMouseEvent)=>{if((!e.currentTarget.contains(e.target as Node)||(e.target as HTMLElement).closest('[data-vault-menu]')))return;if(!e.shiftKey&&!e.metaKey&&!e.ctrlKey){e.preventDefault();onOpen(id);}},
  onKeyDown:(e:ReactKeyboardEvent)=>{if((!e.currentTarget.contains(e.target as Node)||(e.target as HTMLElement).closest('[data-vault-menu]')))return;if(e.key==='Enter'){e.preventDefault();onOpen(id);}if(e.key===' '){e.preventDefault();choose(id,{...e,ctrlKey:true});}},
  onPointerDown:(e:ReactPointerEvent)=>{if((!e.currentTarget.contains(e.target as Node)||(e.target as HTMLElement).closest('[data-vault-menu]'))||e.button!==0)return;cancelHold();held.current=false;moved.current=false;suppressClick.current=false;touchStart.current={x:e.clientX,y:e.clientY};if(e.pointerType==='mouse'){if(canMove)e.currentTarget.setPointerCapture(e.pointerId);return;}e.preventDefault();hold.current=setTimeout(()=>{held.current=true;touchSelecting.current=true;setTouchMode(true);suppressClick.current=true;setSelected(prev=>nextSelection(ids,prev,id,null,false,true));},500);},
  onPointerMove:(e:ReactPointerEvent)=>{if(touchStart.current&&Math.hypot(e.clientX-touchStart.current.x,e.clientY-touchStart.current.y)>10){cancelHold();moved.current=true;if(canMove&&(e.pointerType==='mouse'||touchSelecting.current)){const moving=selected.includes(id)?selected:[id];setSelected(moving);setDragPreview({x:e.clientX+12,y:e.clientY+12,count:moving.length});const target=document.elementFromPoint(e.clientX,e.clientY)?.closest<HTMLElement>('[data-vault-folder]');setDropTarget(target?.dataset.vaultFolder??null);}}},
  onPointerUp:(e:ReactPointerEvent)=>{cancelHold();if(e.button!==0)return;if((!e.currentTarget.contains(e.target as Node)||(e.target as HTMLElement).closest('[data-vault-menu]')))return;
   if(moved.current){const target=document.elementFromPoint(e.clientX,e.clientY)?.closest<HTMLElement>('[data-vault-folder]')?.dataset.vaultFolder;if(canMove&&(e.pointerType==='mouse'||touchSelecting.current)&&target){const moving=selected.includes(id)?selected:[id];if(!moving.includes(target))onMove(moving,target==='root'?null:target);}setDropTarget(null);setDragPreview(null);suppressClick.current=true;}
   else if(e.pointerType!=='mouse'&&!held.current){if(touchSelecting.current)setSelected(prev=>nextSelection(ids,prev,id,null,false,true));else onOpen(id);suppressClick.current=true;}
   if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);touchStart.current=null;moved.current=false;
  },
  onPointerCancel:()=>{cancelHold();touchStart.current=null;setDragPreview(null);setDropTarget(null);},
  onContextMenu:(e:ReactMouseEvent)=>{if(touchSelecting.current){e.preventDefault();return;}if(!selected.includes(id))setSelected([id]);},
 };}
 function targetProps(folder:string|null){return {'data-vault-folder':folder??'root'};}
 const areaProps={
  onPointerDown:(e:ReactPointerEvent<HTMLDivElement>)=>{if(!e.currentTarget.contains(e.target as Node)||e.button!==0||e.pointerType!=='mouse'||(e.target as HTMLElement).closest('[data-vault-item],button,a,input'))return;start.current={x:e.clientX,y:e.clientY};base.current=e.shiftKey||e.metaKey||e.ctrlKey?selected:[];if(!base.current.length)setSelected([]);e.currentTarget.setPointerCapture(e.pointerId);},
  onPointerMove:(e:ReactPointerEvent<HTMLDivElement>)=>{if(!e.currentTarget.contains(e.target as Node)||!start.current)return;const rect=selectionRectangle(start.current,{x:e.clientX,y:e.clientY});if(rect.width+rect.height<5)return;setBox(rect);const hits=Array.from(e.currentTarget.querySelectorAll<HTMLElement>('[data-vault-item]')).filter(el=>intersects(rect,el.getBoundingClientRect())).map(el=>el.dataset.vaultItem!);setSelected([...new Set([...base.current,...hits])].slice(0,100));},
  onPointerUp:(e:ReactPointerEvent<HTMLDivElement>)=>{if(start.current){start.current=null;setBox(null);if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);}},
  onPointerCancel:()=>{start.current=null;setBox(null);},
  onKeyDown:(e:ReactKeyboardEvent)=>{if(!e.currentTarget.contains(e.target as Node)||(e.target as HTMLElement).closest('input,textarea,select,[data-vault-menu]'))return;if(e.key==='Escape'){clear();}if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='a'){e.preventDefault();setSelected(ids.slice(0,100));}},
 };
 function clear(){setSelected([]);setTouchMode(false);touchSelecting.current=false;anchor.current=null;}
 return {selected,setSelected,clear,areaProps,itemProps,targetProps,box,dropTarget,dragPreview};
}
