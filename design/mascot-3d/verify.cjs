// Run against the existing workspace preview: node design/mascot-3d/verify.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright-core');
const root=path.resolve(__dirname,'../..');
const file=fs.readFileSync(path.join(root,'public/mascot-3d/mascot.glb'));
assert.equal(file.toString('ascii',0,4),'glTF');assert.equal(file.readUInt32LE(4),2);assert.equal(file.readUInt32LE(8),file.length);
const gltf=JSON.parse(file.toString('utf8',20,20+file.readUInt32LE(12)));
for(const control of ['MascotRoot','Eye_L','Eye_R','Gaze_L','Gaze_R'])assert.ok(gltf.nodes.some(n=>n.name===control),control);
assert.ok(gltf.nodes.some(n=>n.name==='Fur_Web'));
assert.deepEqual(gltf.animations.map(a=>a.name),['Idle']);
assert.ok(gltf.animations[0].channels.length>=4);
assert.ok(gltf.images.every(i=>i.bufferView!==undefined),'Textures are embedded');
for(const a of gltf.accessors){for(const x of [...a.min??[],...a.max??[]])assert.ok(Number.isFinite(x));}
const url='http://127.0.0.1:3101/__dev/design/mascot-3d/index.html';
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const p=await browser.newPage({viewport:{width:1440,height:1060}});const errors=[];
  p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(['error','warning'].includes(m.type()))errors.push(m.text())});
  await p.goto(url);await p.waitForFunction(()=>window.mascotStudio?.state.loaded);
  assert.equal(await p.locator('canvas').count(),1);
  for(const [name,mode] of [['Blender render','blender'],['Original character','reference']]){
   await p.getByRole('button',{name,exact:true}).click();
   assert.equal(await p.evaluate(()=>window.mascotStudio.state.presentation),mode);
   assert.equal(await p.locator('#fallback').isVisible(),true);
   assert.equal(await p.locator('canvas').isVisible(),false);
  }
  await p.getByRole('button',{name:'Live 3D',exact:true}).click();
  assert.equal(await p.locator('canvas').isVisible(),true);
  assert.equal(await p.locator('#fallback').isVisible(),false);

  await p.getByRole('button',{name:'Pause motion',exact:true}).click();
  assert.equal(await p.evaluate(()=>window.mascotStudio.state.running),false);
  await p.getByRole('button',{name:'Blink',exact:true}).click();
  await p.waitForFunction(()=>window.mascotStudio.state.eyeScale<.5);
  await p.waitForFunction(()=>window.mascotStudio.state.eyeScale===1);
  await p.getByRole('button',{name:'Say hello',exact:true}).click();
  await p.waitForFunction(()=>Math.abs(window.mascotStudio.state.rotation)>.025);
  await p.waitForFunction(()=>window.mascotStudio.state.rotation===0);
  const box=await p.locator('canvas').boundingBox();await p.mouse.move(box.x+box.width*.8,box.y+box.height*.3);
  await p.waitForFunction(()=>window.mascotStudio.state.gaze[0]>.2);
  await p.getByRole('button',{name:'Follow my cursor',exact:true}).click();
  assert.equal(await p.evaluate(()=>window.mascotStudio.state.following),false);
  for(const view of ['left','back','right','front']){
   await p.getByLabel('Viewing angle',{exact:true}).selectOption(view);
   await p.screenshot({path:`/tmp/mascot-${view}.png`});
  }
  await p.locator('#stage').screenshot({path:path.join(root,'dev/thumbnails/mascot-studio.jpg'),type:'jpeg',quality:88});
  await p.mouse.move(box.x+box.width/2,box.y+box.height/2);await p.mouse.down();await p.mouse.move(box.x+box.width/2+140,box.y+box.height/2,{steps:10});await p.mouse.up();
  assert.ok(Math.abs((await p.evaluate(()=>window.mascotStudio.state.camera))[0])>.2,'Drag rotates camera');
  await p.setViewportSize({width:390,height:844});await p.screenshot({path:'/tmp/mascot-mobile.png'});
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'No horizontal overflow');
  const quiet=await browser.newPage({reducedMotion:'reduce'});await quiet.goto(url);await quiet.waitForFunction(()=>window.mascotStudio?.state.loaded);
  assert.equal(await quiet.evaluate(()=>window.mascotStudio.state.running),false);assert.equal(await quiet.evaluate(()=>window.mascotStudio.state.following),false);
  const failed=await browser.newPage();await failed.route('**/mascot.glb',r=>r.abort());await failed.goto(url);await failed.getByRole('status').filter({hasText:'could not load'}).waitFor();assert.equal(await failed.locator('#fallback').isVisible(),true);
  assert.deepEqual(errors,[]);
  console.log(JSON.stringify({result:'pass',runtimeBytes:file.length,animations:gltf.animations.map(a=>a.name),checks:['render/reference comparison','embedded textures','exported controls','blink and reset','greeting and reset','gaze toggle','front/back/sides','drag rotation','mobile width','reduced motion','load failure fallback','no console errors']},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
