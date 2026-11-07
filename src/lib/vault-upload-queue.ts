export const MAX_VAULT_FILES = 20;
export function validateVaultFile(file: {size:number;type:string}): string | undefined {
 if(!["application/pdf","image/jpeg","image/png","image/webp"].includes(file.type))return "Formato no permitido. Usá PDF, JPG, PNG o WebP.";
 if(file.size<8||file.size>10*1024*1024)return "El archivo debe pesar entre 8 bytes y 10 MB.";
}
export function vaultFileTitle(name:string){return name.replace(/\.[^.]+$/,"").trim().slice(0,160).padEnd(3,"_");}
