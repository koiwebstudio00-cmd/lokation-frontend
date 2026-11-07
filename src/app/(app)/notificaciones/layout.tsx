import {getCurrentUser} from "@/lib/api";
import {redirect} from "next/navigation";
export default async function RestrictedLayout({children}:{children:React.ReactNode}){
 if((await getCurrentUser())?.rol === "community") redirect("/");
 return children;
}
