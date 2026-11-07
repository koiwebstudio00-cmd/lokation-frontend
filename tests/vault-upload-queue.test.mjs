import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateVaultFile,vaultFileTitle,MAX_VAULT_FILES} from '../src/lib/vault-upload-queue.ts';
test('valida formatos y límites antes de subir',()=>{
 for(const type of ['application/pdf','image/jpeg','image/png','image/webp'])assert.equal(validateVaultFile({type,size:10*1024*1024}),undefined);
 assert.match(validateVaultFile({type:'application/pdf',size:10*1024*1024+1}),/10 MB/);
 assert.match(validateVaultFile({type:'application/pdf',size:0}),/8 bytes/);
 assert.match(validateVaultFile({type:'text/html',size:100}),/Formato/);
 assert.equal(MAX_VAULT_FILES,20);
});
test('genera nombres válidos sin extensión',()=>{
 assert.equal(vaultFileTitle('Contrato.pdf'),'Contrato');
 assert.equal(vaultFileTitle('a.jpg'),'a__');
 assert.equal(vaultFileTitle('a'.repeat(200)+'.png').length,160);
});
