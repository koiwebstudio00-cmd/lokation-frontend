import {CaptationEditor} from '@/components/captations/captation-editor';
export const metadata={title:'Editar captación — Cubiko AI'};
export default async function Page({params}:{params:Promise<{id:string}>}){return <CaptationEditor id={(await params).id}/>;}
