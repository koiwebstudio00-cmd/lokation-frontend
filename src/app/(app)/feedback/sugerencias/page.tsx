import {redirect} from 'next/navigation';
export default async function Page({searchParams}:{searchParams:Promise<Record<string,string|undefined>>}){
 const params=await searchParams;const query=new URLSearchParams();for(const key of ['q','estado','pagina'])if(params[key])query.set(key,params[key]!);
 query.set('tipo','sugerencia');redirect(`/feedback?${query}`);
}
