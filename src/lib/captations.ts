export const captationStatuses = { nueva:'Nueva', en_revision:'En revisión', lista:'Lista para ofrecer', archivada:'Archivada' };
export const captationTypes = {casa:'Casa',departamento:'Departamento',duplex:'Dúplex',local_comercial:'Local comercial',oficina:'Oficina',galpon:'Galpón',cochera:'Cochera',terreno:'Terreno',otro:'Otro'};
export type CaptationDetails = {bedrooms:number|null;bathrooms:number|null;coveredArea:number|null;totalArea:number|null;price:number|null;currency:'ARS'|'USD';expenses:number|null;amenities:string;services:string;term:string;adjustment:string;deposit:string;guarantees:string;availability:string;keys:string;visits:string;notes:string;publication:'pendiente'|'autorizada'|'no_publicar'};
export type Captation = {id:string;title:string;address:string;city:string;zone:string;type:keyof typeof captationTypes;operation:'venta'|'alquiler';status:keyof typeof captationStatuses;assignedToId:string;assignedTo?:{id:string;nombre:string}|null;ownerPersonId:string|null;propertyId:string|null;details:CaptationDetails;createdAt:string;updatedAt:string};
export function captationSummary(c:Captation){
 const d=c.details;
 return [c.title,`${captationTypes[c.type]} · ${c.operation==='venta'?'Venta':'Alquiler'}`,`${c.address} · ${c.zone?c.zone+', ':''}${c.city}`,
 d.price!==null?`Precio: ${d.currency} ${d.price.toLocaleString('es-AR')}`:'Precio a confirmar',
 d.expenses!==null?`Expensas: ${d.currency} ${d.expenses.toLocaleString('es-AR')}`:'',
 d.bedrooms!==null?`Dormitorios: ${d.bedrooms}`:'',d.bathrooms!==null?`Baños: ${d.bathrooms}`:'',
 d.coveredArea!==null?`Superficie cubierta: ${d.coveredArea} m²`:'',d.totalArea!==null?`Superficie total: ${d.totalArea} m²`:'',
 ...([['Comodidades','amenities'],['Servicios','services'],['Plazo','term'],['Actualización','adjustment'],['Depósito','deposit'],['Garantías','guarantees'],['Disponibilidad','availability'],['Llaves','keys'],['Visitas','visits'],['Observaciones','notes']] as const).filter(([,key])=>d[key]).map(([label,key])=>`${label}: ${d[key]}`),
 `Publicación: ${{pendiente:'Pendiente de autorización',autorizada:'Autorizada',no_publicar:'No publicar, solo ofrecer'}[d.publication]}`,
 c.assignedTo?`Responsable: ${c.assignedTo.nombre}`:''].filter(Boolean).join('\n');
}
