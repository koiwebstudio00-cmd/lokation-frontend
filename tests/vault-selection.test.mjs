import {test} from 'node:test';
import assert from 'node:assert/strict';
import {nextSelection,selectionRectangle,intersects} from '../src/lib/vault-selection.ts';
test('shift selects range, command toggles, plain click replaces',()=>{
 const ids=['folder','a','b','c'];
 assert.deepEqual(nextSelection(ids,['a'],'c','a',true,false),['a','b','c']);
 assert.deepEqual(nextSelection(ids,['a'],'folder','a',false,true),['a','folder']);
 assert.deepEqual(nextSelection(ids,['a'],'a','a',false,true),[]);
 assert.deepEqual(nextSelection(ids,['a'],'b','a',false,false),['b']);
});
test('rectangle works in both directions and includes intersecting items only',()=>{
 const rect=selectionRectangle({x:200,y:300},{x:100,y:100});
 assert.deepEqual(rect,{left:100,top:100,width:100,height:200});
 assert.equal(intersects(rect,{left:0,top:120,right:150,bottom:160}),true);
 assert.equal(intersects(rect,{left:201,top:120,right:230,bottom:160}),false);
});
test('selection caps batches at 100 items',()=>{
 const ids=Array.from({length:150},(_,i)=>String(i));
 assert.equal(nextSelection(ids,[],'149','0',true,false).length,100);
});
