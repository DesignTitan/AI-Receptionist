import test from 'node:test';
import assert from 'node:assert/strict';
import { purchaseReceipt, stripeReceiptUrl } from '../src/lib/platform/purchase-receipt.ts';
import { receiptEmail } from '../src/lib/platform/receipt-email.ts';
const expected = { customer:'cus_test',subscription:'sub_test',price:'price_setup',cents:8900 };
function invoice(setup=8900) { return {id:'in_test',number:'TEST-001',status:'paid',currency:'usd',billing_reason:'subscription_create',customer:'cus_test',subscription:'sub_test',amount_paid:39900+setup,total:39900+setup,status_transitions:{paid_at:1789142400},hosted_invoice_url:'https://invoice.stripe.com/i/test',lines:{has_more:false,data:[{amount:39900,quantity:1,price:{id:'price_monthly'}},{amount:setup,quantity:1,price:{id:'price_setup'}},{amount:0,quantity:1,price:{id:'price_metered'}}]}}; }
test('receipts preserve both original and current setup payments without duplicate zero-value usage',()=>{
 for(const cents of [8900,29900,49900]) {const r=purchaseReceipt(invoice(cents),{...expected,cents});assert.equal(r.amountPaid,39900+cents);assert.equal(r.rows.length,2);assert.equal(r.rows[1].cents,cents);}
});
test('tax and account credit reconcile to actual paid amount',()=>{
 const i=invoice();i.total+=2000;i.amount_paid=i.total-1000;const r=purchaseReceipt(i,expected);assert.equal(r.rows.reduce((sum,row)=>sum+row.cents,0),r.amountPaid);assert.equal(r.rows[2].cents,2000);assert.equal(r.rows[3].cents,-1000);
});
test('unpaid, wrong-owner, wrong-price and incomplete invoices cannot become receipts',()=>{
 for(const patch of [{status:'open'},{customer:'cus_other'},{subscription:'sub_other'},{amount_paid:NaN},{lines:{has_more:true,data:invoice().lines.data}},{total:-1}])assert.throws(()=>purchaseReceipt({...invoice(),...patch},expected));
 assert.throws(()=>purchaseReceipt(invoice(29900),expected));
});
test('receipt links only allow Stripe HTTPS invoice hosts',()=>{
 for(const url of ['javascript:alert(1)','https://invoice.stripe.com.evil.test/i','http://invoice.stripe.com/i','https://name@invoice.stripe.com/i'])assert.equal(stripeReceiptUrl(url),null);
 assert.equal(stripeReceiptUrl('https://invoice.stripe.com/i/test'),'https://invoice.stripe.com/i/test');
});
test('branded receipt uses actual paid total, escaped text and attached mascot',()=>{
 const email=receiptEmail({receipt:purchaseReceipt(invoice(29900),{...expected,cents:29900}),name:'<script> Owner',planName:'Busy desk',siteUrl:'https://example.test',setupPending:true,test:true});
 assert.match(email.html,/\$698/);assert.doesNotMatch(email.html,/\$488/);assert.match(email.html,/&lt;script&gt;/);assert.doesNotMatch(email.html,/<script>/);assert.match(email.html,/cid:brand-mascot/);assert.match(email.html,/https:\/\/example.test\/account\/setup/);assert.match(email.subject,/^\[Test\]/);assert.match(email.text,/No real charge/i);
});
