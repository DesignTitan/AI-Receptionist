"""Editable, surface-attached regional guide groom using Blender's bundled hair assets.
Blender 5.1: --background --factory-startup --python design/mascot-3d/build-groom-studio.py
MASCOT_FINAL=1 for the larger beauty render. No web assets are changed.
"""
from pathlib import Path
import bpy, math, random, bisect, os, json
import numpy as np
from mathutils import Vector
BASE=Path(__file__).resolve().parent
bpy.ops.wm.open_mainfile(filepath=str(BASE/'mascot-film.blend'))
scene=bpy.context.scene
random.seed(20260912)
body=bpy.data.objects['Mascot • seamless body']
root=body.parent
for obj in list(bpy.data.objects):
 if obj.type=='CURVES':bpy.data.objects.remove(obj,do_unlink=True)
# Reduce the projecting black discs and let the warm eye whites frame the pupils.
for side in ['L','R']:
 bpy.data.objects['Pupil_'+side].scale=(.85,1,.85)
 bpy.data.objects['Gaze_'+side].location.z=.020
 bpy.data.objects['Eye_'+side].location.z-=.10
# Lower the cheek pillows with the eyes, preserving the smile and outer silhouette.
for v in body.data.vertices:
 p=v.co
 if p.y<-.40:
  front=max(0,min(1,(-p.y-.4)/.20))
  old=sum(math.exp(-((p.x-c)/.43)**2-((p.z-1.26)/.32)**2) for c in [-.5,.5])
  new=sum(math.exp(-((p.x-c)/.43)**2-((p.z-1.16)/.32)**2) for c in [-.5,.5])
  p.y+=.24*(old-new)*front
body.data.update()
# A real scalp UV map attaches editable guides to the surface.
bpy.ops.object.select_all(action='DESELECT');body.select_set(True);bpy.context.view_layer.objects.active=body
bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.uv.smart_project(angle_limit=1.15,island_margin=.003)
bpy.ops.object.mode_set(mode='OBJECT')
body.data.uv_layers.active.name='GroomUV'
body.data.calc_loop_triangles()
tris=list(body.data.loop_triangles)
regions=['Crown','Forehead','Cheek L','Cheek R','Chin and point','Back and sides']
def region(p):
 if p.z>2.10:return 0
 if p.y<-.40:
  if p.z>1.38:return 1
  if p.z>.88 and abs(p.x)>.20:return 2 if p.x<0 else 3
  return 4
 return 5

def allowed(p):
 if p.y<-.4:
  if any(((p.x-x)/.225)**2+((p.z-1.475)/.22)**2<1 and p.y>-.72 for x in [-.33,.33]):return False
  if abs(p.x)<.225 and 1.27-.225*math.sqrt(max(0,1-(p.x/.225)**2))<p.z<1.29-.036*(1-(p.x/.225)**2):return False
 return True
# Point-domain masks remain editable in Blender. They are evaluated on the emitter.
for ri,name in enumerate(regions):
 a=body.data.attributes.new('coat_'+str(ri),'FLOAT','POINT')
 a.data.foreach_set('value',[float(region(v.co)==ri and allowed(v.co)) for v in body.data.vertices])
buckets=[[] for _ in regions];weights=[[] for _ in regions];areas=[0.]*len(regions)
for tri in tris:
 p=sum((body.data.vertices[i].co for i in tri.vertices),Vector())/3
 if not allowed(p):continue
 ri=region(p);areas[ri]+=tri.area;buckets[ri].append(tri);weights[ri].append(areas[ri])
uv=body.data.uv_layers.active.data

def sample(ri):
 while True:
  tri=buckets[ri][bisect.bisect_left(weights[ri],random.random()*areas[ri])]
  r=math.sqrt(random.random());s=random.random();w=(1-r,r*(1-s),r*s)
  vs=[body.data.vertices[i] for i in tri.vertices]
  p=sum((v.co*x for v,x in zip(vs,w)),Vector())
  n=sum((v.normal*x for v,x in zip(vs,w)),Vector()).normalized()
  if not allowed(p):continue
  tex=sum((uv[i].uv*x for i,x in zip(tri.loops,w)),Vector((0,0)))
  return p,n,tex

def direction(p,n,ri):
 f=Vector((.32*math.sin(p.z*11)+.38*p.x,.45,max(-1,min(1,(p.z-1.36)/.12))))
 if p.y<-.35:
  cx=-.5 if p.x<0 else .5
  radial=Vector(((p.x-cx)*2.2,.45,(p.z-1.16)*1.8-.06))
  blend=math.exp(-((p.z-1.16)/.27)**4)*min(1,abs(p.x)/.30)
  f=f.lerp(radial,blend)
 if p.x<-.65 and p.z<.7:f=Vector((-.6,0,-1))
 f-=n*f.dot(n)
 if f.length<.01:f=n.cross(Vector((1,0,0)))
 return f.normalized()
assets=Path(bpy.app.binary_path).parent/'../Resources/5.1/datafiles/assets/nodes/procedural_hair_node_assets.blend'
wanted=['Interpolate Hair Curves','Clump Hair Curves','Frizz Hair Curves','Set Hair Curve Profile']
with bpy.data.libraries.load(str(assets.resolve()),link=False) as (a,b):b.node_groups=[n for n in a.node_groups if n in wanted]
material=bpy.data.materials['Mint plush • Principled Hair scattering']
bs=next(n for n in material.node_tree.nodes if n.bl_idname=='ShaderNodeBsdfHairPrincipled')
bs.inputs['Roughness'].default_value=.40;bs.inputs['Radial Roughness'].default_value=.55
ramp=next(n for n in material.node_tree.nodes if n.bl_idname=='ShaderNodeValToRGB')
ramp.color_ramp.elements[0].color=(.075,.175,.083,1);ramp.color_ramp.elements[1].color=(.115,.24,.126,1)
collection=bpy.data.collections.new('GROOM • editable regional guides');scene.collection.children.link(collection)

def socket(node,identifier):return next(s for s in node.inputs if s.identifier==identifier)
def groom(ri,undercoat=False):
 name=regions[ri]+(' • undercoat' if undercoat else ' • sculpt these guides')
 count=max(120,int(areas[ri]*(220 if undercoat else 2400)))
 steps=10;positions=[];texcoords=[]
 for i in range(count):
  p,n,tex=sample(ri);d=direction(p,n,ri);side=n.cross(d).normalized()
  length=(.020 if undercoat else [.052,.050,.052,.052,.045,.058][ri])
  length*=(1+.06*math.sin(p.x*4+p.z*3))*random.uniform(.80,1.18)
  if p.y<-.55 and 1.25<p.z<1.62 and any(((p.x-x)/.23)**2+((p.z-1.475)/.23)**2<1.4 for x in [-.33,.33]):length*=.45
  bend=random.uniform(-.08,.08)
  for k in range(steps):
   t=k/(steps-1)
   # Lift at the root, then arc into a groomed tuft rather than lie on the skin.
   q=p+n*length*(1.05*t-.32*t*t)+d*length*((.58+.08*math.sin(p.x*17+p.z*13))*t*t)+side*length*bend*math.sin(t*math.pi)*t
   positions.extend(q)
  texcoords.extend(tex)
 data=bpy.data.hair_curves.new(name);data.add_curves([steps]*count)
 data.attributes['position'].data.foreach_set('vector',positions)
 attr=data.attributes.new('surface_uv_coordinate','FLOAT2','CURVE');attr.data.foreach_set('vector',texcoords)
 radius=data.attributes.new('radius','FLOAT','POINT');radius.data.foreach_set('value',[.001]*count*steps)
 data.surface=body;data.surface_uv_map='GroomUV';data.set_types(type='CATMULL_ROM');data.materials.append(material)
 obj=bpy.data.objects.new(name,data);collection.objects.link(obj);obj.parent=root
 obj['How to groom']='Select this object and enter Sculpt mode. Comb the guides; the modifier interpolates the coat. Regional density is a named attribute on the body.'
 ng=bpy.data.node_groups.new(name+' • Hair controls','GeometryNodeTree');ng.is_modifier=True
 ng.interface.new_socket(name='Geometry',in_out='INPUT',socket_type='NodeSocketGeometry');ng.interface.new_socket(name='Geometry',in_out='OUTPUT',socket_type='NodeSocketGeometry')
 controls=[('Density',50000 if undercoat else 65000,0,200000),('Clumping',.05 if undercoat else .88,0,1),('Frizz',.0002 if undercoat else .00035,0,.02),('Fibre radius',.00055 if undercoat else .00075,.0001,.004)]
 for title,value,lo,hi in controls:
  s=ng.interface.new_socket(name=title,in_out='INPUT',socket_type='NodeSocketFloat');s.default_value=value;s.min_value=lo;s.max_value=hi
 nodes=ng.nodes;links=ng.links
 inp=nodes.new('NodeGroupInput');inp.location=(-700,100)
 inter=nodes.new('GeometryNodeGroup');inter.node_tree=bpy.data.node_groups['Interpolate Hair Curves'];inter.location=(-450,100)
 socket(inter,'Input_2').default_value=body;socket(inter,'Input_17').default_value=.07;socket(inter,'Input_16').default_value=ri+100*undercoat
 links.new(inp.outputs['Geometry'],socket(inter,'Input_0'));links.new(inp.outputs['Density'],socket(inter,'Input_15'))
 uvnode=nodes.new('GeometryNodeInputNamedAttribute');uvnode.data_type='FLOAT_VECTOR';uvnode.inputs['Name'].default_value='GroomUV';uvnode.location=(-700,-300)
 links.new(uvnode.outputs['Attribute'],socket(inter,'Input_18'))
 mask=nodes.new('GeometryNodeInputNamedAttribute');mask.data_type='FLOAT';mask.inputs['Name'].default_value='coat_'+str(ri);mask.location=(-700,-500)
 links.new(mask.outputs['Attribute'],socket(inter,'Input_14'))
 clump=nodes.new('GeometryNodeGroup');clump.node_tree=bpy.data.node_groups['Clump Hair Curves'];clump.location=(-100,100)
 links.new(inter.outputs['Geometry'],clump.inputs['Geometry']);links.new(inter.outputs['Guide Index'],clump.inputs['Guide Index']);links.new(inp.outputs['Clumping'],clump.inputs['Factor'])
 clump.inputs['Shape'].default_value=.65;clump.inputs['Tip Spread'].default_value=.0007;clump.inputs['Preserve Length'].default_value=True
 frizz=nodes.new('GeometryNodeGroup');frizz.node_tree=bpy.data.node_groups['Frizz Hair Curves'];frizz.location=(150,100)
 links.new(clump.outputs['Geometry'],frizz.inputs['Geometry']);links.new(inp.outputs['Frizz'],frizz.inputs['Distance']);frizz.inputs['Preserve Length'].default_value=True
 profile=nodes.new('GeometryNodeGroup');profile.node_tree=bpy.data.node_groups['Set Hair Curve Profile'];profile.location=(400,100)
 links.new(frizz.outputs['Geometry'],profile.inputs['Geometry']);links.new(inp.outputs['Fibre radius'],profile.inputs['Radius']);profile.inputs['Shape'].default_value=.65
 matnode=nodes.new('GeometryNodeSetMaterial');matnode.inputs['Material'].default_value=material;matnode.location=(650,100);links.new(profile.outputs['Geometry'],matnode.inputs['Geometry'])
 out=nodes.new('NodeGroupOutput');out.location=(850,100);links.new(matnode.outputs['Geometry'],out.inputs['Geometry'])
 modifier=obj.modifiers.new('LIVE COAT • density, clump, frizz, radius','NODES');modifier.node_group=ng
 print('REGION',name,'guides',count,'area',areas[ri],flush=True)
 return obj
objects=[]
for ri in range(6):objects.extend([groom(ri),groom(ri,True)])
# Join the authored regions BEFORE interpolation: roots and clumps stay continuous
# across cheeks/crown rather than producing the seam of independent hair patches.
mask=body.data.attributes.new('coat_all','FLOAT','POINT')
mask.data.foreach_set('value',[float(allowed(v.co)) for v in body.data.vertices])
for undercoat in [False,True]:
 sources=objects[1::2] if undercoat else objects[0::2]
 ng=sources[0].modifiers[0].node_group.copy()
 ng.name='UNDERCOAT • live controls' if undercoat else 'TOPCOAT • live controls'
 for obj in sources:obj.modifiers.clear();obj.hide_render=True
 for node in ng.nodes:
  if node.bl_idname=='GeometryNodeInputNamedAttribute' and node.data_type=='FLOAT':node.inputs['Name'].default_value='coat_all'
 inter=next(n for n in ng.nodes if n.bl_idname=='GeometryNodeGroup' and n.node_tree.name=='Interpolate Hair Curves')
 join=ng.nodes.new('GeometryNodeJoinGeometry');join.location=(-950,100)
 for i,obj in enumerate(sources):
  info=ng.nodes.new('GeometryNodeObjectInfo');info.inputs['Object'].default_value=obj;info.location=(-1200,100-i*180)
  ng.links.new(info.outputs['Geometry'],join.inputs['Geometry'])
 ng.links.new(join.outputs['Geometry'],socket(inter,'Input_0'))
 if not undercoat:
  # Explicitly converge child fibers on the authored guide, not a child-index map.
  nodes=ng.nodes;links=ng.links
  roots=nodes.new('GeometryNodeGroup');roots.node_tree=bpy.data.node_groups['Curve Root'];roots.location=(-950,-1100)
  separate=nodes.new('GeometryNodeCurveToPoints');separate.mode='COUNT';separate.inputs['Count'].default_value=1;separate.location=(-700,-1000)
  links.new(join.outputs['Geometry'],separate.inputs['Curve'])
  nearest=nodes.new('GeometryNodeSampleNearest');nearest.domain='POINT';nearest.location=(-440,-900)
  links.new(separate.outputs['Points'],nearest.inputs['Geometry']);links.new(roots.outputs['Root Position'],nearest.inputs['Sample Position'])
  sample=nodes.new('GeometryNodeSampleCurve');sample.use_all_curves=False;sample.location=(-160,-800)
  links.new(join.outputs['Geometry'],sample.inputs['Curves']);links.new(nearest.outputs['Index'],sample.inputs['Curve Index'])
  param=nodes.new('GeometryNodeSplineParameter');param.location=(-440,-1150);links.new(param.outputs['Factor'],sample.inputs['Factor'])
  power=nodes.new('ShaderNodeMath');power.operation='POWER';power.inputs[1].default_value=1.4;power.location=(-150,-1100);links.new(param.outputs['Factor'],power.inputs[0])
  multiply=nodes.new('ShaderNodeMath');multiply.operation='MULTIPLY';multiply.location=(40,-1100)
  inputs=next(n for n in nodes if n.bl_idname=='NodeGroupInput')
  links.new(power.outputs[0],multiply.inputs[0]);links.new(inputs.outputs['Clumping'],multiply.inputs[1])
  position=nodes.new('GeometryNodeInputPosition');position.location=(-150,-1400)
  mix=nodes.new('ShaderNodeMix');mix.data_type='VECTOR';mix.location=(260,-800)
  links.new(multiply.outputs[0],mix.inputs[0]);links.new(position.outputs['Position'],mix.inputs[4]);links.new(sample.outputs['Position'],mix.inputs[5])
  setpos=nodes.new('GeometryNodeSetPosition');setpos.label='Tuft tips follow authored guides';setpos.location=(530,-700)
  links.new(inter.outputs['Geometry'],setpos.inputs['Geometry']);links.new(mix.outputs[1],setpos.inputs['Position'])
  frizz=next(n for n in nodes if n.bl_idname=='GeometryNodeGroup' and n.node_tree.name=='Frizz Hair Curves')
  links.new(setpos.outputs['Geometry'],frizz.inputs['Geometry'])
  oldclump=next(n for n in nodes if n.bl_idname=='GeometryNodeGroup' and n.node_tree.name=='Clump Hair Curves');nodes.remove(oldclump)
 data=bpy.data.hair_curves.new(ng.name)
 output=bpy.data.objects.new(ng.name,data);scene.collection.objects.link(output);output.parent=root
 mod=output.modifiers.new('LIVE COAT • controls','NODES');mod.node_group=ng
 output['How to groom']='Edit the regional guide objects in the GROOM collection. This modifier joins them before interpolation, avoiding regional seams.'
scene.compositing_node_group.nodes.get('Alpha Over').inputs['Background'].default_value=(50,50,50,1)
# Hair must receive glossy light. Never disable the response globally to fix eyes.
for obj in scene.objects:
 if obj.type=='LIGHT':obj.visible_glossy=True;obj.data.specular_factor=1
pupil=bpy.data.materials['Deep forest • pupils'].node_tree.nodes.get('Principled BSDF')
pupil.inputs['Specular IOR Level'].default_value=.045;pupil.inputs['Roughness'].default_value=.16
glintmat=bpy.data.materials.new('Eye sparkle • art-directed');glintmat.use_nodes=True
pn=glintmat.node_tree.nodes.get('Principled BSDF');pn.inputs['Base Color'].default_value=(.95,1,.86,1);pn.inputs['Emission Color'].default_value=(.95,1,.86,1);pn.inputs['Emission Strength'].default_value=2
for side in ['L','R']:
 bpy.ops.mesh.primitive_uv_sphere_add(segments=24,ring_count=12)
 glint=bpy.context.object;glint.name='Eye sparkle '+side;glint.parent=bpy.data.objects['Gaze_'+side];glint.location=(-.041,-.046,.059);glint.scale=(.027,.008,.027);glint.data.materials.append(glintmat)
 for poly in glint.data.polygons:poly.use_smooth=True
pref=bpy.context.preferences.addons['cycles'].preferences;pref.compute_device_type='METAL';pref.get_devices()
for device in pref.devices:device.use=device.type=='METAL'
scene.cycles.device='GPU';scene.cycles.samples=384 if os.getenv('MASCOT_FINAL') else 96
scene.cycles.adaptive_threshold=.008 if os.getenv('MASCOT_FINAL') else .025
scene.render.resolution_x=1600 if os.getenv('MASCOT_FINAL') else 1000;scene.render.resolution_y=scene.render.resolution_x
scene.render.filepath=str(BASE/'renders/regional-groom.png')
scene['lookdev_notes']='Native editable regional guides + Blender hair assets. Groom quality and reference likeness require visual review; not an approved final character.'
bpy.ops.object.select_all(action='DESELECT');objects[2].select_set(True);bpy.context.view_layer.objects.active=objects[2]
bpy.ops.wm.save_as_mainfile(filepath=str(BASE/'mascot-groom-studio.blend'),compress=True)
bpy.ops.render.render(write_still=True)
print('REGIONAL_RENDER_COMPLETE',flush=True)
