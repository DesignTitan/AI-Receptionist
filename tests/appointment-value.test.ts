import test from "node:test";
import assert from "node:assert/strict";
import { appointmentValue } from "../src/lib/platform/appointment-value.ts";
test("distinguishes revenue from contribution and includes plan costs",()=>{
  const v=appointmentValue({ticket:100,margin:60,missed:10,recovered:5,monthlyCost:199});
  assert.equal(v.revenueAtRisk,1000);assert.equal(v.recoveredRevenue,500);assert.equal(v.recoveredContribution,300);assert.equal(v.net,101);assert.equal(v.breakEven,4);
});
test("caps recovered bookings at missed bookings and handles zero contribution",()=>{
  const v=appointmentValue({ticket:0,margin:60,missed:2,recovered:10,monthlyCost:399});
  assert.equal(v.recovered,2);assert.equal(v.breakEven,null);assert.equal(v.net,-399);
});
test("does not hide losses or turn invalid inputs into NaN",()=>{
  assert.equal(appointmentValue({ticket:100,margin:50,missed:3,recovered:0,monthlyCost:749}).net,-749);
  const v=appointmentValue({ticket:NaN,margin:Infinity,missed:-2,recovered:NaN,monthlyCost:199});
  assert.equal(v.revenueAtRisk,0);assert.equal(v.net,-199);
});
