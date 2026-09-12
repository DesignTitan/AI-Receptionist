import { NextResponse } from 'next/server';
import { checkOrigin, owner } from '@/lib/platform/server';
import { serviceClient } from '@/lib/supabase';
import { validateSetupDraft } from '@/lib/platform/setup-draft';
export async function PATCH(request:Request){
 try{checkOrigin(request);}catch{return NextResponse.json({error:'Invalid request.'},{status:403});}
 const user=await owner();if(!user)return NextResponse.json({error:'Sign in again to save your draft.'},{status:401});
 try{const raw=await request.text();if(raw.length>20000)throw Error('Draft is too large.');const draft=validateSetupDraft(JSON.parse(raw));const db=serviceClient();const {data:c,error}=await db.from('customers').select('id,config,status,billing_status').eq('owner_id',user.id).maybeSingle();
 if(error||!c||c.status!=='paid'||c.billing_status!=='active'||!c.config.setupPending)return NextResponse.json({error:'Your setup is no longer open for draft changes.'},{status:409});
 const result=await db.from('customers').update({config:{...c.config,setupDraft:draft}}).eq('id',c.id).eq('owner_id',user.id).eq('config',JSON.stringify(c.config)).select('id').maybeSingle();
 if(result.error||!result.data)return NextResponse.json({error:'Your account changed. Please reload before editing further.'},{status:409});
 return NextResponse.json({saved:true});}catch{return NextResponse.json({error:'Could not save your draft. Please try again.'},{status:400});}
}
