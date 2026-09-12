import {NextResponse} from 'next/server';
import {checkOrigin,owner} from '@/lib/platform/server';
import {serviceClient} from '@/lib/supabase';
import {applyBusinessPreferences,businessPreferences} from '@/lib/platform/business-preferences';
import {phoneSettingsRevision as revisionOf} from '@/lib/platform/phone-settings-revision';
export async function PATCH(request:Request){
 try{checkOrigin(request);}catch{return NextResponse.json({error:'Invalid request.'},{status:403});}
 const user=await owner();if(!user)return NextResponse.json({error:'Please sign in again.'},{status:401});
 try{
  const input=await request.json(),db=serviceClient();
  const {data:c,error}=await db.from('customers').select('id,business_name,config').eq('owner_id',user.id).maybeSingle();
  if(error||!c)return NextResponse.json({error:'Your business could not be loaded.'},{status:400});
  if(c.config.setupPending)return NextResponse.json({error:'Finish your initial business setup first.'},{status:409});
  if(input.revision!==revisionOf({business_name:c.business_name,config:c.config}))
   return NextResponse.json({error:'Your business changed in another window. Reload before saving to keep those changes.'},{status:409});
  const updated=applyBusinessPreferences(c,input.preferences);
  const saved=await db.from('customers').update(updated).eq('id',c.id).eq('owner_id',user.id)
   .eq('business_name',c.business_name).eq('config',JSON.stringify(c.config)).select('business_name,config').maybeSingle();
  if(saved.error||!saved.data)return NextResponse.json({error:'Your business changed while saving. Reload and try again.'},{status:409});
  return NextResponse.json({preferences:businessPreferences(saved.data),revision:revisionOf(saved.data)});
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:'We could not save your changes.'},{status:400});}
}
