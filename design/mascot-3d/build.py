"""Rebuild the AI Receptionist mascot with Blender 5.1+. No external assets required.
Run: Blender --background --factory-startup --python design/mascot-3d/build.py
"""
import bpy, math, random, bisect, json
from mathutils import Vector
from pathlib import Path
BASE = Path(__file__).resolve().parent
ROOT = BASE.parent.parent
OUT = ROOT / 'public/mascot-3d'
OUT.mkdir(parents=True, exist_ok=True)
random.seed(917)
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
scene = bpy.context.scene
scene.render.engine='CYCLES'; scene.cycles.samples=48
scene.cycles.use_denoising=True
scene.render.resolution_x=1000; scene.render.resolution_y=1000; scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG'; scene.render.image_settings.color_mode='RGBA'
scene.render.film_transparent=True
scene.name='Idle'; scene.render.fps=24; scene.frame_start=1; scene.frame_end=97
scene.view_settings.view_transform='AgX'
scene.world.color=(.35,.35,.35)

def mat(name, color, rough=.6):
 m=bpy.data.materials.new(name); m.diffuse_color=(*color,1); m.use_nodes=True
 p=m.node_tree.nodes.get('Principled BSDF'); p.inputs['Base Color'].default_value=(*color,1); p.inputs['Roughness'].default_value=rough
 return m
sage=mat('Sage velvet • body',(.24,.42,.23),.85)
cream=mat('Warm ivory • eyes',(.94,.91,.73),.33)
pupil=mat('Deep forest • pupils',(.006,.012,.008),.19)
mouthmat=mat('Forest • smile',(.012,.070,.037),.88)
shine=mat('Softbox reflection',(.98,1,.91),.18)
furmats=[mat('Sage fibre %02d'%i,(.19+i*.019,.36+i*.024,.18+i*.018),.91) for i in range(7)]

def mesh(name,verts,faces,material):
 d=bpy.data.meshes.new(name); d.from_pydata(verts,[],faces); d.update()
 o=bpy.data.objects.new(name,d); scene.collection.objects.link(o)
 if material: d.materials.append(material)
 for p in d.polygons:p.use_smooth=True
 return o

def ball(name,loc,scale,material):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=48,ring_count=24,location=loc)
 o=bpy.context.object;o.name=name;o.scale=scale
 bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 o.data.materials.append(material)
 for p in o.data.polygons:p.use_smooth=True
 return o

# Superellipsoid: rounded square face, softly rounded depth.
sgn=lambda a: -1 if a<0 else 1
sp=lambda a,e:sgn(a)*abs(a)**e
verts=[];faces=[];NU=96;NV=48
for j in range(NV+1):
 v=-math.pi/2+math.pi*j/NV
 for i in range(NU):
  u=2*math.pi*i/NU
  verts.append((1.00*sp(math.cos(v),.65)*sp(math.cos(u),.65), .59*sp(math.cos(v),.65)*sp(math.sin(u),.65),1.45+.96*sp(math.sin(v),.65)))
for j in range(NV):
 for i in range(NU):
  a=j*NU+i;b=j*NU+(i+1)%NU;faces.append((a,b,b+NU,a+NU))
body=mesh('Mascot • seamless body',verts,faces,sage)
# A rounded taper joins the lower-left corner; retain a pointed speech-bubble tip.
start=Vector((-.66,-.05,.76));end=Vector((-1.04,-.20,.31));direction=end-start
bpy.ops.mesh.primitive_cone_add(vertices=48,radius1=.025,radius2=.29,depth=direction.length,location=(start+end)/2)
tail=bpy.context.object;tail.name='Speech-bubble point';tail.rotation_euler=direction.to_track_quat('-Z','Y').to_euler()
# Subtle cheeks blend into the main skin, rather than becoming separate facial balls.
cheeks=[ball('Cheek', (x,-.46,1.13),(.47,.17,.29),sage) for x in [-.52,.52]]
bpy.ops.object.select_all(action='DESELECT')
for o in [body,tail,*cheeks]:o.select_set(True)
bpy.context.view_layer.objects.active=body;bpy.ops.object.join()
rem=body.modifiers.new('Seamless silhouette','REMESH');rem.mode='VOXEL';rem.voxel_size=.025
bpy.ops.object.modifier_apply(modifier=rem.name)
sm=body.modifiers.new('Soft surface','SMOOTH');sm.factor=.75;sm.iterations=5;bpy.ops.object.modifier_apply(modifier=sm.name)
for p in body.data.polygons:p.use_smooth=True
# Root, gaze and eyelid controls are regular editable transforms and export as nodes.
root=bpy.data.objects.new('MascotRoot',None);scene.collection.objects.link(root);root.empty_display_type='CIRCLE';root.empty_display_size=1.3
body.parent=root
root['notes']='Idle loop frames 1–97, 24fps. Eye_L/Eye_R scale Z controls blink; Gaze_L/Gaze_R location X/Z controls gaze.'
web=[body,root];eyes=[]
for side,x in [('L',-.36),('R',.36)]:
 eye=bpy.data.objects.new('Eye_'+side,None);scene.collection.objects.link(eye);eye.location=(x,-.553,1.49);eye.parent=root
 white=ball('EyeWhite_'+side,(0,0,0),(.211,.112,.223),cream);white.parent=eye;white.location=(0,0,0)
 gaze=bpy.data.objects.new('Gaze_'+side,None);scene.collection.objects.link(gaze);gaze.parent=eye;gaze.location=(.018 if side=='L' else -.018,-.087,-.012)
 iris=ball('Pupil_'+side,(0,0,0),(.150,.050,.178),pupil);iris.parent=gaze;iris.location=(0,0,0)
 glint=ball('Catchlight_'+side,(0,0,0),(.034,.010,.034),shine);glint.parent=gaze;glint.location=(-.047,-.047,.079)
 web += [eye,white,gaze,iris,glint];eyes.append(eye)
# Filled smiling opening: curved upper lip and round lower lip, gently convex in depth.
vs=[];fs=[];cols=40;rows=10
for j in range(rows+1):
 t=j/rows
 for i in range(cols+1):
  x=-.205+.410*i/cols; q=x/.205
  top=1.185-.046*(1-q*q);bottom=1.185-.205*math.sqrt(max(0,1-q*q))
  z=top*(1-t)+bottom*t
  vs.append((x,-.522-.012*(1-q*q),z))
for j in range(rows):
 for i in range(cols):
  a=j*(cols+1)+i;fs.append((a,a+1,a+cols+2,a+cols+1))
mouth=mesh('Smile',vs,fs,mouthmat);mouth.parent=root;web.append(mouth)
solid=mouth.modifiers.new('Mouth depth','SOLIDIFY');solid.thickness=.012
# Recess the smile into the body, leaving green side walls and a dark interior.
outline=[]
for i in range(33):
 x=-.215+.43*i/32;q=x/.215;outline.append((x,1.19-.045*(1-q*q)))
for i in range(31,0,-1):
 x=-.215+.43*i/32;q=x/.215;outline.append((x,1.19-.22*math.sqrt(max(0,1-q*q))))
nc=len(outline);cv=[(x,y,z) for y in [-.83,-.49] for x,z in outline]
cf=[tuple(reversed(range(nc))),tuple(range(nc,nc*2))]+[(i,(i+1)%nc,(i+1)%nc+nc,i+nc) for i in range(nc)]
cutter=mesh('Smile carving tool',cv,cf,None)
bpy.ops.object.select_all(action='DESELECT');cutter.select_set(True);bpy.context.view_layer.objects.active=cutter
bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.mesh.normals_make_consistent(inside=False);bpy.ops.object.mode_set(mode='OBJECT')
bpy.context.view_layer.objects.active=body
cut=body.modifiers.new('Smile recess','BOOLEAN');cut.operation='DIFFERENCE';cut.object=cutter
bpy.ops.object.modifier_apply(modifier=cut.name);bpy.data.objects.remove(cutter,do_unlink=True)
# Bake fine fibre-colour variation into a portable skin texture.
bpy.ops.object.select_all(action='DESELECT');body.select_set(True);bpy.context.view_layer.objects.active=body
bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.uv.smart_project(island_margin=.015);bpy.ops.object.mode_set(mode='OBJECT')
tex=bpy.data.images.new('Sage fuzz • baked colour',width=1024,height=1024)
nodes=sage.node_tree.nodes;links=sage.node_tree.links
img=nodes.new('ShaderNodeTexImage');img.image=tex;nodes.active=img
noise=nodes.new('ShaderNodeTexNoise');noise.inputs['Scale'].default_value=240;noise.inputs['Detail'].default_value=2
coord=nodes.new('ShaderNodeTexCoord');links.new(coord.outputs['Generated'],noise.inputs['Vector'])
ramp=nodes.new('ShaderNodeValToRGB');ramp.color_ramp.elements[0].position=.24;ramp.color_ramp.elements[0].color=(.12,.27,.115,1)
ramp.color_ramp.elements[1].position=.76;ramp.color_ramp.elements[1].color=(.36,.54,.32,1);links.new(noise.outputs['Fac'],ramp.inputs['Fac'])
emit=nodes.new('ShaderNodeEmission');links.new(ramp.outputs['Color'],emit.inputs['Color']);output=nodes.get('Material Output');links.new(emit.outputs[0],output.inputs['Surface'])
bpy.ops.object.bake(type='EMIT',margin=8)
tex.pack();pbr=nodes.get('Principled BSDF');links.new(img.outputs['Color'],pbr.inputs['Base Color']);links.new(pbr.outputs[0],output.inputs['Surface'])
# Sample actual seamless surface by triangle area for even groom density.
body.data.calc_loop_triangles();tris=list(body.data.loop_triangles);cum=[];total=0
for tri in tris:total+=tri.area;cum.append(total)

def samples(count):
 result=[]
 while len(result)<count:
  tri=tris[bisect.bisect_left(cum,random.random()*total)]
  a,b,c=[body.data.vertices[n] for n in tri.vertices]
  r=math.sqrt(random.random());s=random.random();w=(1-r,r*(1-s),r*s)
  p=a.co*w[0]+b.co*w[1]+c.co*w[2];n=(a.normal*w[0]+b.normal*w[1]+c.normal*w[2]).normalized()
  if p.y<-.40:
   # Keep eye whites and smile uncovered, gently groom around these boundaries.
   if any(((p.x-x)/.238)**2+((p.z-1.49)/.252)**2<1 for x in [-.36,.36]):continue
   if abs(p.x)<.216 and 1.185-.216*math.sqrt(max(0,1-(p.x/.216)**2))<p.z<1.233-.042*(1-(p.x/.216)**2):continue
  direction=(n*.50+Vector((random.uniform(-.23,.23),random.uniform(-.12,.12),-.72))).normalized()
  length=random.uniform(.035,.065)
  result.append((p,n,direction,length,random.randrange(7)))
 return result
strands=samples(110000)
# Editable curve groom for high-quality Blender rendering.
curve=bpy.data.curves.new('Groom • 110,000 tapered fibres','CURVE');curve.dimensions='3D';curve.resolution_u=1;curve.bevel_depth=.00165;curve.bevel_resolution=0;curve.resolution_u=1
for m in furmats:curve.materials.append(m)
for p,n,d,l,mi in strands:
 s=curve.splines.new('POLY');s.points.add(2);s.material_index=mi
 for point,pos,radius in zip(s.points,[p,p+n*l*.45,p+d*l],[1,.66,.06]):point.co=(*pos,1);point.radius=radius
fur=bpy.data.objects.new('Fur • render groom',curve);scene.collection.objects.link(fur);fur.parent=root
# Runtime fur uses tapered crossed ribbons, so GLB has actual silhouette fibres.
fv=[];ff=[];fm=[]
for p,n,d,l,mi in strands[:40000]:
 tangent=n.cross(Vector((0,0,1)))
 if tangent.length<.01:tangent=n.cross(Vector((1,0,0)))
 tangent.normalize();other=n.cross(tangent).normalized();tip=p+d*l
 for t in [tangent,other]:
  width=.0038;k=len(fv);fv.extend([p-t*width,p+t*width,tip]);ff.append((k,k+1,k+2));fm.append(mi)
webfur=mesh('Fur_Web',fv,ff,None)
for m in furmats:m.use_backface_culling=False;webfur.data.materials.append(m)
for poly,mi in zip(webfur.data.polygons,fm):poly.material_index=mi
webfur.parent=root;webfur.hide_render=True;webfur.hide_set(True);web.append(webfur)
# Combined idle + blink clip baked as standard object animation, portable across tools.
for frame in range(1,98):
 phase=(frame-1)/96*2*math.pi
 root.location.z=.035*math.sin(phase);root.rotation_euler.y=.025*math.sin(phase)
 root.keyframe_insert(data_path='location',frame=frame);root.keyframe_insert(data_path='rotation_euler',frame=frame)
 blink=max(0,1-abs(frame-53)/3)
 for eye in eyes:
  eye.scale.z=1-.95*blink;eye.keyframe_insert(data_path='scale',frame=frame)
scene.frame_set(1)
# Studio lights and camera stay outside the exported character.
def area(name,loc,power,size,color):
 d=bpy.data.lights.new(name,'AREA');d.energy=power;d.shape='DISK';d.size=size;d.color=color
 o=bpy.data.objects.new(name,d);scene.collection.objects.link(o);o.location=loc;o.rotation_euler=(Vector((0,0,1.4))-o.location).to_track_quat('-Z','Y').to_euler()
area('Key • large softbox',(-3,-4,5),450,4,(1,.96,.86))
area('Fill • cool', (3,-2,3),180,3,(.85,.94,1))
area('Rim', (0,2,4),480,3,(.91,1,.90))
d=bpy.data.cameras.new('Portrait');cam=bpy.data.objects.new('Portrait',d);scene.collection.objects.link(cam);cam.location=(0,-7,2.05);cam.rotation_euler=(Vector((0,0,1.40))-cam.location).to_track_quat('-Z','Y').to_euler();d.type='ORTHO';d.ortho_scale=2.85;scene.camera=cam
# Select exactly the export hierarchy; no stage, lights or render curves.
bpy.ops.object.select_all(action='DESELECT');webfur.hide_set(False)
for o in web:o.select_set(True)
bpy.context.view_layer.objects.active=body
bpy.ops.export_scene.gltf(filepath=str(OUT/'mascot.glb'),export_format='GLB',use_selection=True,export_animations=True,export_animation_mode='SCENE',export_anim_scene_split_object=False,export_nla_strips_merged_animation_name='Idle',export_extras=True)
webfur.hide_set(True)
# Useful viewport startup: material mode, camera framed, master body selected.
bpy.ops.object.select_all(action='DESELECT');body.select_set(True);bpy.context.view_layer.objects.active=body
for screen in bpy.data.screens:
 for ar in screen.areas:
  if ar.type=='VIEW_3D':ar.spaces.active.region_3d.view_perspective='CAMERA'
bpy.ops.wm.save_as_mainfile(filepath=str(BASE/'mascot-master.blend'))
scene.render.filepath=str(OUT/'portrait.png');bpy.ops.render.render(write_still=True)
manifest={'name':'AI Receptionist mascot','version':1,'status':'First editable 3D prototype; likeness review pending','source':'design/mascot-3d/mascot-master.blend','generator':'design/mascot-3d/build.py','reference':'public/marketing/happy-mascot-pointed.png','runtime':'public/mascot-3d/mascot.glb','renderGroomStrands':110000,'runtimeFurStrands':40000,'runtimeTriangles':sum(len(o.data.polygons) if o==webfur else sum(len(p.vertices)-2 for p in o.data.polygons) for o in web if o.type=='MESH'),'animation':{'name':'Idle','durationSeconds':4,'fps':24,'includes':['bob','tilt','blink']},'controls':['MascotRoot','Eye_L','Eye_R','Gaze_L','Gaze_R'],'limits':['Object-control rig, not a skinned skeleton','Browser fur approximates the master curve groom','After Effects import not yet verified']}
(BASE/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print('MASCOT_COMPLETE',json.dumps(manifest))
