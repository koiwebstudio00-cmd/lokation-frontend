export type Point={x:number;y:number};
export function selectionRectangle(a:Point,b:Point){return {left:Math.min(a.x,b.x),top:Math.min(a.y,b.y),width:Math.abs(a.x-b.x),height:Math.abs(a.y-b.y)};}
export function intersects(a:{left:number;top:number;width:number;height:number},b:{left:number;top:number;right:number;bottom:number}){return a.left<=b.right&&a.left+a.width>=b.left&&a.top<=b.bottom&&a.top+a.height>=b.top;}
export function nextSelection(ids:string[],previous:string[],id:string,anchor:string|null,range:boolean,toggle:boolean){
 if(range&&anchor&&ids.includes(anchor)){const a=ids.indexOf(anchor),b=ids.indexOf(id);return ids.slice(Math.min(a,b),Math.max(a,b)+1).slice(0,100);}
 if(toggle)return previous.includes(id)?previous.filter(x=>x!==id):[...previous,id].slice(0,100);
 return [id];
}
