// Capture only anonymous local pages. Never reuse owner/staff cookies or submit forms.
import { chromium } from 'playwright-core';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { getPages } from '../dev/page-catalogue.mjs';
const origin = process.env.PREVIEW_ORIGIN || 'http://127.0.0.1:3101';
if (!['127.0.0.1', 'localhost'].includes(new URL(origin).hostname)) throw Error('Local preview only.');
const browser = await chromium.launch({channel:'chrome',headless:true});
const context = await browser.newContext({viewport:{width:1280,height:800},deviceScaleFactor:1,reducedMotion:'reduce'});
const page = await context.newPage();
const output = resolve('dev/thumbnails');
await mkdir(output,{recursive:true});
try {
 for (const entry of getPages().filter(p=>p.access==='public' && p.kind==='app')) {
  const response = await page.goto(origin+entry.href,{waitUntil:'networkidle',timeout:45000});
  if (!response?.ok() || new URL(page.url()).pathname.replace(/\/$/,'') !== new URL(origin+entry.href).pathname.replace(/\/$/,'')) {
   console.log(`Skipped ${entry.id}: unavailable or redirected`);continue;
  }
  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].filter(i=>i.getBoundingClientRect().top<800).map(i=>i.decode().catch(()=>{})));});
  await page.addStyleTag({content:'ai-dev-toolbar,nextjs-portal{display:none!important}html{scroll-padding-top:0!important}body{padding-top:0!important}'});
  await page.evaluate(()=>{scrollTo(0,0);document.querySelectorAll('video').forEach(v=>v.pause());});
  await page.waitForTimeout(600);
  await page.screenshot({path:resolve(output,`${entry.id}.jpg`),type:'jpeg',quality:83,animations:'disabled'});
  console.log(`Captured ${entry.id}`);
 }
} finally {await browser.close();}
