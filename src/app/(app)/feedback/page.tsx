import {Suspense} from 'react';
import {getFeedbackList} from '@/lib/queries';
import {FeedbackFilters} from '@/components/feedback/feedback-filters';
import {FeedbackFeed} from '@/components/feedback/feedback-feed';
import {NewFeedbackPost} from '@/components/feedback/new-post';
import {Pagination} from '@/components/pagination';
export const metadata={title:'Feedback — Cubiko AI'};
export default async function Page({searchParams}:{searchParams:Promise<Record<string,string|undefined>>}){
 const params=await searchParams;
 const result=await getFeedbackList({...params,pagina:Math.max(1,Math.floor(Number(params.pagina)||1))});
 return <div className="mx-auto max-w-3xl space-y-6"><header className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-2xl font-semibold">Feedback</h1><p className="mt-1 text-sm text-muted-foreground">Ideas, problemas y respuestas de toda la comunidad de Cubiko.</p></div><NewFeedbackPost/></header><Suspense><FeedbackFilters/></Suspense>{result.items.length?<FeedbackFeed items={result.items}/>:<div className="border-y py-14 text-center"><p className="font-medium">No hay publicaciones para mostrar</p><p className="mt-2 text-sm text-muted-foreground">Creá una publicación o probá otros filtros.</p></div>}<Pagination page={result.page} count={result.count} basePath="/feedback" searchParams={params}/></div>;
}
