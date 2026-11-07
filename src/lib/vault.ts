export type VaultGrant = {userId:string;permission:"read"|"edit"};
export type VaultAccess = {accessMode:"admin"|"inherit"|"team"|"selected";teamPermission:"read"|"edit";grants:VaultGrant[]};
export type VaultFolder = VaultAccess & {id:string;name:string;parentId:string|null;canEdit:boolean;createdAt?:string;updatedAt?:string;deletedAt?:string|null;trashBatchId?:string|null;purgeStartedAt?:string|null};
export type VaultUser = {id:string;nombre:string};
export const accessLabels = {admin:"Solo administradores",inherit:"Heredado de la carpeta",team:"Toda la inmobiliaria",selected:"Usuarios seleccionados"};
export function folderPath(folder:VaultFolder,folders:VaultFolder[]):string {
  const names=[folder.name],seen=new Set([folder.id]); let parent=folder.parentId;
  while(parent&&!seen.has(parent)){seen.add(parent);const node=folders.find(f=>f.id===parent);if(!node)break;names.unshift(node.name);parent=node.parentId;}
  return names.join(" / ");
}
export type VaultActivity={id:string;entityId:string;entityType:string;entityName:string;actorName:string;action:string;createdAt:string;details:Record<string,unknown>};
