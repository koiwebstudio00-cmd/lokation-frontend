import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync, sign } from 'node:crypto';
import { createGoogleOAuth, exchangeGoogleIdentity, expiredGoogleCookies, googleCookiePrefix } from '../src/lib/google-oauth.ts';

const baseURL = 'http://localhost:3003';
const options = { baseURL, secret: 'local-regression-test-secret-32-characters', clientId: 'test-client', clientSecret: 'test-secret' };
async function start(auth) {
  const response = await auth.api.signInSocial({ asResponse: true, headers: new Headers({ origin: baseURL }),
    body: { provider: 'google', callbackURL: `${baseURL}/api/auth/google-complete`, errorCallbackURL: `${baseURL}/login?google=error`, disableRedirect: true } });
  assert.equal(response.status,200);
  const { url } = await response.json();
  const set = response.headers.getSetCookie();
  assert.ok(set.every(c=>c.includes('Path=/api/auth')));
  const cookie = set.map(c=>c.split(';')[0]).join('; ');
  assert.ok(cookie.length < 2048, 'only small state data goes to the browser');
  return { state: new URL(url).searchParams.get('state'), cookie };
}

test('Google exchange handles oversized provider tokens entirely inside the server', async t => {
  const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
  const jwk = { ...publicKey.export({ format: 'jwk' }), kid:'test-key', alg:'RS256', use:'sig' };
  const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
  const now = Math.floor(Date.now()/1000);
  const signed = `${encode({alg:'RS256',kid:'test-key'})}.${encode({sub:'google-user',email:'test@example.test',email_verified:true,name:'Test User',iss:'https://accounts.google.com',aud:'test-client',iat:now,exp:now+300})}`;
  const idToken = `${signed}.${sign('RSA-SHA256',Buffer.from(signed),privateKey).toString('base64url')}`;
  t.mock.method(globalThis,'fetch',async input => {
    const url = String(input instanceof Request ? input.url : input);
    if(url === 'https://oauth2.googleapis.com/token') return Response.json({access_token:'x'.repeat(18000),id_token:idToken,expires_in:3600,token_type:'Bearer',scope:'openid email profile'});
    if(url === 'https://www.googleapis.com/oauth2/v3/certs') return Response.json({keys:[jwk]});
    throw new Error('Unexpected external request: '+new URL(url).origin);
  });
  const auth=createGoogleOAuth(options); const {state,cookie}=await start(auth);
  let temporaryHeaderBytes=0;
  const wrapped={...auth,handler:async request=>{const response=await auth.handler(request); temporaryHeaderBytes=response.headers.getSetCookie().join(';').length;return response;}};
  const request=new Request(`${baseURL}/api/auth/callback/google?code=test-code&state=${state}`,{headers:{cookie}});
  assert.equal(await exchangeGoogleIdentity(wrapped,request,baseURL),idToken);
  assert.ok(temporaryHeaderBytes>16384, 'fixture reproduces oversized cookie headers');
  const cleanup=expiredGoogleCookies(cookie,false);
  assert.ok(cleanup.every(c=>c.includes('Max-Age=0')));
  assert.ok(cleanup.join(';').length<2048);
  assert.ok(!cleanup.join(';').includes(idToken));
});

test('invalid state never reaches token exchange',async t=>{
  let requests=0;
  t.mock.method(globalThis,'fetch',async()=>{requests++;throw new Error('must not fetch');});
  const auth=createGoogleOAuth(options);const {cookie}=await start(auth);
  await assert.rejects(exchangeGoogleIdentity(auth,new Request(`${baseURL}/api/auth/callback/google?code=test&state=invalid`,{headers:{cookie}}),baseURL));
  assert.equal(requests,0);
});

test('denied callback cannot reuse browser account cookies from an earlier attempt',async()=>{
  const auth=createGoogleOAuth(options); const {state,cookie}=await start(auth);
  await assert.rejects(exchangeGoogleIdentity(auth,new Request(`${baseURL}/api/auth/callback/google?error=access_denied&state=${state}`,{headers:{cookie:`${cookie}; ${googleCookiePrefix}.account_data=stale`}}),baseURL));
});

test('cleanup removes own legacy chunks at both paths and preserves app sessions / 2FA',()=>{
  const cookies=`${googleCookiePrefix}.account_data.0=large; __Secure-${googleCookiePrefix}.session_data=large; ${googleCookiePrefix}_pending_2fa=challenge; ubikka_sa_access=keep; another.session=keep`;
  const cleared=expiredGoogleCookies(cookies,true);
  assert.equal(cleared.length,4);
  assert.ok(cleared.every(c=>c.includes('Secure')&&c.includes('HttpOnly')));
  assert.ok(!cleared.join(';').includes('pending_2fa'));
  assert.ok(!cleared.join(';').includes('ubikka_sa_access'));
  assert.ok(!cleared.join(';').includes('another.session'));
});
