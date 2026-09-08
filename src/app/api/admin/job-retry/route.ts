import { NextResponse, after } from 'next/server';
import { checkOrigin, requireStaff } from '@/lib/platform/server';
import { serviceClient } from '@/lib/supabase';
import { runJobs } from '@/lib/platform/jobs';
export async function POST(request:Request){try{checkOrigin(request);await requireStaff();const {id}=await request.json();const r=await serviceClient().from('customer_jobs').update({state:'queued',error:null}).eq('id',id).eq('state','failed').neq('kind','call').lt('attempts',3).gt('created_at',new Date(Date.now()-23*3600000).toISOString()).select('id').maybeSingle();if(r.error||!r.data)throw Error('Only recent failed emails can be retried here. Inspect older or interrupted deliveries with the provider.');after(async()=>{await runJobs();});return NextResponse.json({ok:true});}catch(e){return NextResponse.json({error:(e as Error).message},{status:400});}}
