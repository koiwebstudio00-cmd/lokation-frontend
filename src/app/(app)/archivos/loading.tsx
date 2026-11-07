import {Skeleton} from "@/components/ui/skeleton";
import {VaultSkeleton} from "@/components/rentals/vault-skeleton";
export default function Loading(){return <div className="mx-auto max-w-7xl space-y-6"><Skeleton className="h-9 w-64"/><Skeleton className="h-12 max-w-2xl rounded-full"/><div className="flex gap-3">{[1,2,3].map(i=><Skeleton key={i} className="h-9 w-28"/>)}</div><VaultSkeleton/></div>;}
