"""Blender-only soft-fur look development. No GLB or Spline changes.
Run Blender --background --factory-startup --python design/mascot-3d/build-film.py
MASCOT_FINAL=1 renders the 1800px final; default is a 900px lighting draft.
"""
from pathlib import Path
import os
BASE=Path(__file__).resolve().parent
# Reuse the editable body/face construction, stopping before web texture generation.
source=(BASE/'build.py').read_text().split('# Bake fine fibre-colour')[0]
source=source.replace('y-=.205*cheeks*front','y-=.28*cheeks*front')
source=source.replace('((x-c)/.40)**2-((z-1.16)/.35)**2','((x-c)/.43)**2-((z-1.26)/.32)**2')
source=source.replace('(.215,.105,.219)','(.214,.115,.208)').replace('(.146,.036,.153)','(.165,.042,.169)')
source=source.replace("-.095,-.006","-.108,.008")
source=source.replace('eye.location=(x,-.614,1.52)', 'eye.location=(x,-.61,1.575)')
source=source.replace('.027 if side', '.055 if side').replace('else -.027', 'else -.055')
exec(compile(source,str(BASE/'build.py'),'exec'))
import numpy as np
from mathutils.kdtree import KDTree
FINAL=os.environ.get('MASCOT_FINAL')=='1'
RENDERS=BASE/'renders';RENDERS.mkdir(exist_ok=True)
scene.cycles.samples=512 if FINAL else 96
scene.cycles.adaptive_threshold=.008 if FINAL else .025
scene.cycles.max_bounces=12;scene.cycles.diffuse_bounces=6;scene.cycles.glossy_bounces=6;scene.cycles.transmission_bounces=8
scene.cycles.use_denoising=True
scene.render.resolution_x=1800 if FINAL else 900;scene.render.resolution_y=scene.render.resolution_x
scene.render.film_transparent=False
pref=bpy.context.preferences.addons['cycles'].preferences
pref.compute_device_type='METAL';pref.get_devices()
for device in pref.devices:device.use=device.type=='METAL'
scene.cycles.device='GPU'
scene.world.node_tree.nodes.get('Background').inputs['Color'].default_value=(.78,.84,.80,1)
scene.world.node_tree.nodes.get('Background').inputs['Strength'].default_value=.16
scene.view_settings.exposure=.20
# Skin only fills microscopic gaps; it is not a painted substitute for fur.
shader=sage.node_tree.nodes.get('Principled BSDF');shader.inputs['Base Color'].default_value=(.21,.35,.19,1)
shader.inputs['Subsurface Weight'].default_value=.08
pupil.node_tree.nodes.get('Principled BSDF').inputs['Roughness'].default_value=.08
cream.node_tree.nodes.get('Principled BSDF').inputs['Roughness'].default_value=.27
# Use actual softbox reflections rather than white geometry stuck on the eyes.
for obj in list(bpy.data.objects):
 if obj.name.startswith('Catchlight_'):bpy.data.objects.remove(obj,do_unlink=True)
mouthmat.node_tree.nodes.get('Principled BSDF').inputs['Base Color'].default_value=(.004,.025,.008,1)
# Film hair material: anisotropic reflection + transmission and multiple scattering via Cycles.
hair=bpy.data.materials.new('Mint plush • Principled Hair scattering');hair.use_nodes=True
hair.diffuse_color=(.35,.52,.31,1)
ns=hair.node_tree.nodes;ns.clear();lk=hair.node_tree.links
out=ns.new('ShaderNodeOutputMaterial');bs=ns.new('ShaderNodeBsdfHairPrincipled');bs.model='CHIANG';bs.parametrization='COLOR'
bs.inputs['Roughness'].default_value=.48;bs.inputs['Radial Roughness'].default_value=.58
bs.inputs['Random Roughness'].default_value=.13;bs.inputs['IOR'].default_value=1.46
info=ns.new('ShaderNodeHairInfo');ramp=ns.new('ShaderNodeValToRGB')
ramp.color_ramp.elements[0].color=(.09,.19,.105,1);ramp.color_ramp.elements[1].color=(.12,.235,.145,1)
lk.new(info.outputs['Random'],ramp.inputs['Fac']);lk.new(ramp.outputs['Color'],bs.inputs['Color']);lk.new(bs.outputs[0],out.inputs['Surface'])
# Surface-area samples, with eye/mouth exclusion based on the sculpted face.
body.data.calc_loop_triangles();tris=list(body.data.loop_triangles);cum=[];total=0
for tri in tris:total+=tri.area;cum.append(total)
def sample():
 while True:
  tri=tris[bisect.bisect_left(cum,random.random()*total)];a,b,c=[body.data.vertices[i] for i in tri.vertices]
  r=math.sqrt(random.random());s=random.random();w=(1-r,r*(1-s),r*s)
  p=a.co*w[0]+b.co*w[1]+c.co*w[2];n=(a.normal*w[0]+b.normal*w[1]+c.normal*w[2]).normalized()
  if p.y<-.40:
   if any(((p.x-x)/.205)**2+((p.z-1.575)/.205)**2<1 and p.y>-.71 for x in [-.33,.33]):continue
   if abs(p.x)<.215 and 1.27-.215*math.sqrt(max(0,1-(p.x/.215)**2))<p.z<1.28-.036*(1-(p.x/.215)**2):continue
  return p,n

def flow(p,n):
 f=Vector((.17*math.sin(p.x*5),0,-1))
 if p.y<-.35 and .83<p.z<1.48:
  center=Vector((-.50 if p.x<0 else .50,p.y,1.24))
  f=Vector(((p.x-center.x)*1.2,0,(p.z-center.z)*.7-.65))
 # Project the groom along the surface while keeping a lifted root.
 f=f-n*f.dot(n)
 if f.length<.01:f=n.cross(Vector((1,0,0)))
 return f.normalized()
guides=[];tree=KDTree(16000)
for i in range(16000):
 p,n=sample();d=flow(p,n);length=random.uniform(.038,.062)
 guides.append((p,n,d,length));tree.insert(p,i)
tree.balance()
COUNT=420000;STEPS=7
positions=np.empty((COUNT*STEPS,3),dtype=np.float32);radii=np.empty(COUNT*STEPS,dtype=np.float32)
for i in range(COUNT):
 p,n=sample();_,gi,_=tree.find(p);gp,gn,gd,gl=guides[gi]
 d=flow(p,n);length=gl*random.uniform(.80,1.15);undercoat=random.random()<.28
 if undercoat:length*=.50
 jitter=random.uniform(-1,1);side=n.cross(d).normalized();width=random.uniform(.00085,.00125)
 for k in range(STEPS):
  t=k/(STEPS-1)
  own=p+n*length*(.70*t-.20*t*t)+d*length*(.65*t*t)
  guide=gp+gn*gl*(.70*t-.20*t*t)+gd*gl*.65*t*t
  # Gentle convergence: tiny layered tufts, not wet spikes or uniform grass.
  pos=own.lerp(guide,.40*t*t if not undercoat else .10*t*t)
  pos+=side*math.sin(t*math.pi*1.4+jitter)*length*.025*t
  positions[i*STEPS+k]=pos
  radii[i*STEPS+k]=width*(1-t)**.75+.000015
curves=bpy.data.hair_curves.new('Native hair • 420,000 soft fibres');curves.add_curves([STEPS]*COUNT)
curves.attributes['position'].data.foreach_set('vector',positions.ravel())
rad=curves.attributes.new('radius','FLOAT','POINT');rad.data.foreach_set('value',radii)
curves.set_types(type='CATMULL_ROM');curves.materials.append(hair)
fur=bpy.data.objects.new('Fur • layered film groom',curves);scene.collection.objects.link(fur);fur.parent=root
curves.surface=body
fur['groom']='Directional guides, layered undercoat, fine tapered tips, subtle clumping and length variation.'
# Neutral studio, directional soft key and weaker fill preserve cheek modelling.
def area(name,loc,power,size,color):
 d=bpy.data.lights.new(name,'AREA');d.energy=power;d.shape='DISK';d.size=size;d.color=color;d.specular_factor=.08 if 'silk' in name else 0
 o=bpy.data.objects.new(name,d);scene.collection.objects.link(o);o.location=loc;o.rotation_euler=(Vector((0,0,1.4))-o.location).to_track_quat('-Z','Y').to_euler()
area('Key • silk softbox',(-3,-4,5),750,3.5,(1,.97,.92))
area('Fill • white bounce',(3,-4,2),150,5,(.92,.97,1))
area('Rim • soft fur separation',(1,2,4),180,4,(.93,1,.95))
bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,.14));floor=bpy.context.object;floor.name='Warm white studio';floor.data.materials.append(mat('Studio white',(.90,.92,.90),.8))
floor_mat=floor.data.materials[0].node_tree.nodes.get('Principled BSDF')
floor.visible_glossy=False
scene.render.film_transparent=True;floor.is_shadow_catcher=True
nt=bpy.data.node_groups.new('White studio composite','CompositorNodeTree');scene.compositing_node_group=nt
nt.interface.new_socket(name='Image',in_out='OUTPUT',socket_type='NodeSocketColor')
rl=nt.nodes.new('CompositorNodeRLayers');over=nt.nodes.new('CompositorNodeAlphaOver');over.inputs['Background'].default_value=(5,5,5,1)
nt.links.new(rl.outputs['Image'],over.inputs['Foreground']);comp=nt.nodes.new('NodeGroupOutput');nt.links.new(over.outputs[0],comp.inputs[0])
area('Eye glint',(-1.7,-4,3.5),35,.65,(1,1,.94))
bpy.data.lights['Eye glint'].specular_factor=1
for obj in scene.objects:
 if obj.type=='LIGHT':obj.visible_glossy=False
glintmat=bpy.data.materials.new('Reflected eye softbox');glintmat.use_nodes=True
gn=glintmat.node_tree.nodes;gn.clear();ge=gn.new('ShaderNodeEmission');ge.inputs['Color'].default_value=(1,1,.94,1);ge.inputs['Strength'].default_value=30
go=gn.new('ShaderNodeOutputMaterial');glintmat.node_tree.links.new(ge.outputs[0],go.inputs[0])
glintbox=ball('Eye reflection softbox',(-1.4,-4,3.1),(.40,.02,.40),glintmat)
glintbox.visible_camera=False;glintbox.visible_diffuse=False;glintbox.visible_shadow=False
d=bpy.data.cameras.new('Film portrait');cam=bpy.data.objects.new('Film portrait',d);scene.collection.objects.link(cam)
cam.location=(0,-8,1.72);cam.rotation_euler=(Vector((0,0,1.40))-cam.location).to_track_quat('-Z','Y').to_euler();d.type='ORTHO';d.ortho_scale=2.82;scene.camera=cam
scene.frame_set(1);scene.render.filepath=str(RENDERS/('soft-fur-final.png' if FINAL else 'soft-fur-draft.png'))
scene['lookdev_notes']='Native Cycles hair, Chiang scattering, 420k fine clumped strands, area-light self-shadowing. See FUR-RESEARCH.md.'
bpy.ops.object.select_all(action='DESELECT');body.select_set(True);bpy.context.view_layer.objects.active=body
bpy.ops.wm.save_as_mainfile(filepath=str(BASE/'mascot-film.blend'),compress=True)
bpy.ops.render.render(write_still=True)
print('FILM_RENDER_COMPLETE',scene.render.filepath)
