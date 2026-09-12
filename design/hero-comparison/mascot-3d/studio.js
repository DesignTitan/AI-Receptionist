import * as THREE from 'three';
import { GLTFLoader } from './vendor/GLTFLoader.js';
import { OrbitControls } from './vendor/OrbitControls.js';

const stage=document.querySelector('#stage'),status=document.querySelector('#status');
const buttons=Object.fromEntries(['blink','hello','follow','motion'].map(id=>[id,document.getElementById(id)]));
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let renderer, controls, mixer, model, eyeL, eyeR, gazeL, gazeR;
let running=!reduced.matches, following=!reduced.matches, blinkAt=-100, helloAt=-100, elapsed=0, loaded=false;
let active=true, disposed=false, presentation='live';
const pointer=new THREE.Vector2(), gaze=new THREE.Vector2();
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(36,1,.1,40);camera.position.set(0,1.55,4.5);
const pivot=new THREE.Group();scene.add(pivot);
scene.add(new THREE.HemisphereLight(0xfaffee,0x567a65,1.5));
const key=new THREE.DirectionalLight(0xfff5df,2.0);key.position.set(-3,4,4);key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.camera.left=-2.5;key.shadow.camera.right=2.5;key.shadow.camera.top=3;key.shadow.camera.bottom=-2;key.shadow.normalBias=.008;key.shadow.bias=-.0001;key.target.position.set(0,1.4,0);scene.add(key.target);scene.add(key);
const fill=new THREE.DirectionalLight(0xe4f0ff,.7);fill.position.set(3,2,2);scene.add(fill);
const rim=new THREE.DirectionalLight(0xd9ffe0,1.5);rim.position.set(1,4,-3);scene.add(rim);
function state(){buttons.motion.textContent=running?'Pause motion':'Play motion';buttons.motion.setAttribute('aria-pressed',String(running));buttons.follow.setAttribute('aria-pressed',String(following));}
function resize(){if(!renderer)return;const {width,height}=stage.getBoundingClientRect();renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();}
function fail(){status.textContent='The interactive model could not load. The rendered character is shown instead; you can still download the GLB.';document.querySelector('#fallback').hidden=false;document.querySelector('.hint').textContent='Rendered preview';}
try{
 renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.setClearColor(0,0);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;
 renderer.domElement.setAttribute('aria-label','Interactive 3D mascot. Drag to rotate, or choose a viewing angle below.');renderer.domElement.tabIndex=0;stage.prepend(renderer.domElement);
 controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,1.36,0);renderer.domElement.style.touchAction='pan-y';controls.enableDamping=true;controls.enablePan=false;controls.minDistance=3.5;controls.maxDistance=8;controls.minPolarAngle=.3;controls.maxPolarAngle=Math.PI-.3;controls.update();resize();
 new GLTFLoader().load('/mascot-3d/mascot.glb',gltf=>{
  if(disposed)return;
  model=gltf.scene;model.traverse(o=>{if(o.isMesh){o.castShadow=o.name!=='Fur_Web';o.receiveShadow=o.name!=='Fur_Web';}});pivot.add(model);eyeL=model.getObjectByName('Eye_L');eyeR=model.getObjectByName('Eye_R');gazeL=model.getObjectByName('Gaze_L');gazeR=model.getObjectByName('Gaze_R');
  [gazeL,gazeR].forEach(o=>{if(o)o.userData.rest=o.position.clone();});
  mixer=new THREE.AnimationMixer(model);gltf.animations.forEach(clip=>mixer.clipAction(clip).play());
  document.querySelector('#fallback').hidden=presentation==='live';Object.values(buttons).forEach(b=>b.disabled=false);loaded=true;
  status.textContent='Ready · Real 3D model · Idle + blink animation';
  window.mascotStudio={get state(){return{loaded,running,following,presentation,animations:gltf.animations.map(a=>a.name),eyeScale:eyeL?.scale.y,rotation:pivot.rotation.z,gaze:gaze.toArray(),camera:camera.position.toArray(),triangles:renderer.info.render.triangles};}};
 },undefined,fail);
}catch(e){fail();}
const observer=new ResizeObserver(resize);observer.observe(stage);
const visibility=new IntersectionObserver(entries=>active=entries[0].isIntersecting);visibility.observe(stage);
function move(e){const r=stage.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,1-(e.clientY-r.top)/r.height*2);}
function leave(){pointer.set(0,0);}
stage.addEventListener('pointermove',move);stage.addEventListener('pointerleave',leave);
buttons.blink.addEventListener('click',()=>{blinkAt=elapsed;status.textContent='Blinking';});
buttons.hello.addEventListener('click',()=>{helloAt=elapsed;status.textContent='Hello!';});
buttons.follow.addEventListener('click',()=>{following=!following;state();});
buttons.motion.addEventListener('click',()=>{running=!running;state();});
function preference(){running=!reduced.matches;following=!reduced.matches;state();}
reduced.addEventListener('change',preference);state();
document.querySelector('#view').addEventListener('change',e=>{const angle={front:0,left:-Math.PI/2,back:Math.PI,right:Math.PI/2}[e.target.value];camera.position.set(Math.sin(angle)*4.5,1.55,Math.cos(angle)*4.5);controls?.update();});
const clock=new THREE.Timer();clock.connect(document);
renderer?.setAnimationLoop(()=>{
 clock.update();const dt=Math.min(clock.getDelta(),.05);elapsed+=dt;
 if(!active||document.hidden||presentation!=='live')return;
 if(loaded){
  if(running)mixer.update(dt);
  else{eyeL.scale.y=1;eyeR.scale.y=1;}
  const b=elapsed-blinkAt;
  if(b>=0&&b<.32){const amount=Math.sin(b/.32*Math.PI);eyeL.scale.y=eyeR.scale.y=1-.95*amount;}
  else if(!running){eyeL.scale.y=eyeR.scale.y=1;}
  const h=elapsed-helloAt;
  pivot.rotation.z=h<1.25?Math.sin(h/1.25*Math.PI*4)*.12*Math.sin(h/1.25*Math.PI):0;
  pivot.position.y=h<1.25?Math.sin(h/1.25*Math.PI)*.12:0;
  gaze.lerp(following?pointer:new THREE.Vector2(),1-Math.exp(-dt*8));
  [gazeL,gazeR].forEach(o=>{if(o){o.position.copy(o.userData.rest);o.position.x+=gaze.x*.031;o.position.y+=gaze.y*.026;}});
 }
 controls?.update();renderer.render(scene,camera);
});
window.addEventListener('pagehide',()=>{disposed=true;clock.dispose();renderer?.setAnimationLoop(null);observer.disconnect();visibility.disconnect();controls?.dispose();mixer?.stopAllAction();if(model)mixer?.uncacheRoot(model);scene.traverse(o=>{o.geometry?.dispose();if(o.material){for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();}});renderer?.dispose();reduced.removeEventListener('change',preference);stage.removeEventListener('pointermove',move);stage.removeEventListener('pointerleave',leave);},{once:true});

for(const button of document.querySelectorAll('[data-presentation]'))button.addEventListener('click',()=>{
 presentation=button.dataset.presentation;
 for(const item of document.querySelectorAll('[data-presentation]'))item.setAttribute('aria-pressed',String(item===button));
 const still=document.querySelector('#fallback');
 still.src=presentation==='reference'?'/marketing/happy-mascot-pointed.png':'/mascot-3d/portrait.png';
 still.alt=presentation==='reference'?'Original generated mascot reference':'Current Blender render of the 3D mascot';
 still.hidden=presentation==='live'&&loaded;
 if(renderer)renderer.domElement.hidden=presentation!=='live';
 document.querySelector('.character-controls').hidden=presentation!=='live';
 document.querySelector('.stage-label').textContent={live:'Interactive character',blender:'Blender · rendered still',reference:'Original · generated reference'}[presentation];
 document.querySelector('.hint').textContent=presentation==='live'?'Drag to rotate · Scroll to zoom':'Still image · Switch to Live 3D to interact';
 status.textContent={live:'Ready · Real 3D model · Idle + blink animation',blender:'Full curve groom rendered in Blender. This is a still image.',reference:'Original character used for shape, expression and colour matching.'}[presentation];
});
