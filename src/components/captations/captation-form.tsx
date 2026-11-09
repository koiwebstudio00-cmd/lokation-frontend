"use client";
import {startTransition,useActionState,useRef,useState} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Select} from '@/components/ui/select';
import {Textarea} from '@/components/ui/textarea';
import {RentalOptionPicker} from "@/components/rentals/option-picker";
import type {RentalOption} from "@/actions/rental-options";
import {saveCaptation} from '@/actions/captations';
import {captationStatuses,captationTypes,type Captation} from '@/lib/captations';
type Option={id:string;nombre:string};
export function CaptationForm({item,members,initialClient,initialProperty,admin,userId}:{item?:Captation;members:Option[];initialClient?:RentalOption;initialProperty?:RentalOption;admin:boolean;userId:string}){
 const [step,setStep]=useState(0),[state,action,pending]=useActionState(saveCaptation.bind(null,item?.id??null),{});
 const form=useRef<HTMLFormElement>(null);
 const steps=['Propiedad','Características y condiciones','Disponibilidad y vínculos'];
 const d=item?.details;
 const next=()=>{const fields=form.current?.querySelectorAll<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>('[data-step]:not([hidden]) input, [data-step]:not([hidden]) select, [data-step]:not([hidden]) textarea');for(const field of fields??[]){if(!field.reportValidity())return;}setStep(s=>s+1);};
 const input=(name:string,label:string,value?:string|number|null,type='text',required=false)=><div className="space-y-2" key={name}><Label htmlFor={`cap-${name}`}>{label}</Label><Input id={`cap-${name}`} name={name} type={type} defaultValue={value??''} required={required} minLength={required?(name==='city'?2:3):undefined} min={type==='number'?0:undefined} max={type==='number'?999999999999:undefined} step={type==='number'?'any':undefined} maxLength={name==='title'?160:200}/></div>;
 return <form ref={form} className="space-y-6" onSubmit={e=>{e.preventDefault();if(step<2){next();return;}const data=new FormData(e.currentTarget);startTransition(()=>action(data));}}>
  <ol aria-label="Pasos de captación" className="flex border-b pb-4 text-sm">{steps.map((label,i)=><li key={label} className={`flex-1 ${i===step?'font-medium text-foreground':'text-muted-foreground'}`} aria-current={i===step?'step':undefined}><span className="mr-2 tabular-nums">{i+1}.</span><span className="hidden sm:inline">{label}</span><span className="sm:hidden">{['Propiedad','Condiciones','Disponibilidad'][i]}</span></li>)}</ol>
  <fieldset data-step hidden={step!==0} className="space-y-4"><legend className="mb-4 text-lg font-semibold">Propiedad a captar</legend>
  {input('title','Título interno',item?.title,'text',true)}
  <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="cap-type">Tipo</Label><Select id="cap-type" name="type" defaultValue={item?.type??'casa'}>{Object.entries(captationTypes).map(([v,l])=><option value={v} key={v}>{l}</option>)}</Select></div><div className="space-y-2"><Label htmlFor="cap-operation">Operación</Label><Select id="cap-operation" name="operation" defaultValue={item?.operation??'alquiler'}><option value="alquiler">Alquiler</option><option value="venta">Venta</option></Select></div></div>
  {input('address','Dirección y unidad',item?.address,'text',true)}<div className="grid gap-4 sm:grid-cols-2">{input('city','Ciudad',item?.city,'text',true)}{input('zone','Barrio / zona',item?.zone)}</div>
  </fieldset>
  <fieldset data-step hidden={step!==1} className="space-y-4"><legend className="mb-4 text-lg font-semibold">Características y condiciones</legend><p className="text-sm text-muted-foreground">Completá solo lo que corresponda. Un campo vacío significa que está por confirmar.</p>
  <div className="grid grid-cols-2 gap-4">{input('bedrooms','Dormitorios',d?.bedrooms,'number')}{input('bathrooms','Baños',d?.bathrooms,'number')}{input('coveredArea','Cubiertos (m²)',d?.coveredArea,'number')}{input('totalArea','Totales (m²)',d?.totalArea,'number')}{input('price','Precio',d?.price,'number')}<div className="space-y-2"><Label htmlFor="cap-currency">Moneda de precio y expensas</Label><Select id="cap-currency" name="currency" defaultValue={d?.currency??'ARS'}><option>ARS</option><option>USD</option></Select></div>{input('expenses','Expensas',d?.expenses,'number')}</div>
  {input('amenities','Ambientes y comodidades',d?.amenities)}{input('services','Servicios',d?.services)}
  <div className="grid gap-4 sm:grid-cols-2">{input('term','Plazo del alquiler',d?.term)}{input('adjustment','Índice y frecuencia de actualización',d?.adjustment)}{input('deposit','Depósito',d?.deposit)}{input('guarantees','Garantías requeridas',d?.guarantees)}</div>
  </fieldset>
  <fieldset data-step hidden={step!==2} className="space-y-4"><legend className="mb-4 text-lg font-semibold">Disponibilidad y seguimiento</legend>
  {input('availability','Disponibilidad / fecha de ingreso',d?.availability)}{input('keys','¿Quién tiene las llaves?',d?.keys)}{input('visits','Condiciones para visitar',d?.visits)}
  <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="cap-publication">Permiso de publicación</Label><Select id="cap-publication" name="publication" defaultValue={d?.publication??'pendiente'}><option value="pendiente">Pendiente de autorización</option><option value="autorizada">Autorizada</option><option value="no_publicar">No publicar, solo ofrecer</option></Select></div><div className="space-y-2"><Label htmlFor="cap-status">Estado</Label><Select id="cap-status" name="status" defaultValue={item?.status??'nueva'}>{Object.entries(captationStatuses).map(([v,l])=><option key={v} value={v}>{l}</option>)}</Select></div></div>
  {admin&&<><div className="space-y-2"><Label htmlFor="cap-assigned">Responsable</Label><Select id="cap-assigned" name="assignedToId" defaultValue={item?.assignedToId??userId}>{members.map(m=><option key={m.id} value={m.id}>{m.nombre}</option>)}</Select></div><div className="grid gap-4 sm:grid-cols-2"><RentalOptionPicker name="ownerPersonId" title="Cliente vinculado" kind="client" initial={initialClient} optional/><RentalOptionPicker name="propertyId" title="Propiedad existente" kind="all-properties" initial={initialProperty} optional/></div><p className="text-xs text-muted-foreground">Vincular no publica ni modifica la propiedad o los contratos. Los clientes se administran desde Clientes.</p></>}
  <div className="space-y-2"><Label htmlFor="cap-notes">Observaciones internas</Label><Textarea id="cap-notes" name="notes" maxLength={3000} defaultValue={d?.notes}/></div>
  </fieldset>
  {state.error&&<p role="alert" className="text-sm text-destructive">{state.error}</p>}
  <div className="sticky bottom-0 z-10 flex justify-between gap-3 border-t bg-background py-4 pb-[max(1rem,env(safe-area-inset-bottom))]"><Button type="button" variant="outline" disabled={step===0||pending} onClick={()=>setStep(s=>s-1)}>Anterior</Button>{step<2?<Button key="continue" type="button" onClick={e=>{e.preventDefault();next();}}>Continuar</Button>:<Button key="save" type="submit" disabled={pending}>{pending?'Guardando…':'Guardar captación'}</Button>}</div>
 </form>;
}
