import test from 'node:test';import assert from 'node:assert/strict';
import{validateFixedPrice,validateUsagePrice,validateMeter,validateWebhook,validatePortal,STRIPE_EVENTS}from'../src/lib/platform/stripe-catalogue.ts';
test('reject catalogue drift that changes customer prices or usage',()=>{
 const fixed={livemode:false,active:true,currency:'usd',unit_amount:29900,recurring:null};
 assert.doesNotThrow(()=>validateFixedPrice(fixed,29900,false,'test'));assert.throws(()=>validateFixedPrice({...fixed,unit_amount:100000},29900,false,'test'));
 const usage={livemode:false,active:true,currency:'usd',billing_scheme:'tiered',tiers_mode:'graduated',recurring:{interval:'month',interval_count:1,usage_type:'metered',meter:'m'},tiers:[{up_to:300,unit_amount:0},{up_to:null,unit_amount:49}]};
 assert.doesNotThrow(()=>validateUsagePrice(usage,'front','m','test'));assert.throws(()=>validateUsagePrice({...usage,tiers:[{up_to:300,unit_amount:0},{up_to:null,unit_amount:99}]},'front','m','test'));
 const meter={status:'active',event_name:'receptionist_minutes_v2',default_aggregation:{formula:'sum'},customer_mapping:{type:'by_id',event_payload_key:'stripe_customer_id'},value_settings:{event_payload_key:'value'}};
 assert.doesNotThrow(()=>validateMeter(meter));assert.throws(()=>validateMeter({...meter,default_aggregation:{formula:'count'}}));
});
test('reject disabled payment updates and unapproved automatic plan changes',()=>{
 const site='https://example.test',hook={url:site+'/api/webhooks/stripe',status:'enabled',enabled_events:STRIPE_EVENTS};
 assert.doesNotThrow(()=>validateWebhook(hook,hook.url));assert.throws(()=>validateWebhook({...hook,enabled_events:[]},hook.url));
 const portal={active:true,default_return_url:site+'/account',features:{payment_method_update:{enabled:true},invoice_history:{enabled:true},subscription_cancel:{enabled:true,mode:'at_period_end'},subscription_update:{enabled:false}}};
 assert.doesNotThrow(()=>validatePortal(portal,site));assert.throws(()=>validatePortal({...portal,features:{...portal.features,subscription_update:{enabled:true}}},site));
});
