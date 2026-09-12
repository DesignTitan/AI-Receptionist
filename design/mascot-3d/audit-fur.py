"""Controlled close-up render checks. Run with mascot-film.blend loaded."""
import bpy,math
from pathlib import Path
from mathutils import Vector
base=Path(__file__).resolve().parent
out=base/'renders/audit';out.mkdir(exist_ok=True)
s=bpy.context.scene
pref=bpy.context.preferences.addons['cycles'].preferences;pref.compute_device_type='METAL';pref.get_devices()
for d in pref.devices:d.use=d.type=='METAL'
s.cycles.device='GPU';s.cycles.samples=512;s.cycles.adaptive_threshold=.003
s.render.resolution_x=650;s.render.resolution_y=650
s.camera.data.ortho_scale=.65;s.camera.location=(0,-8,2.10)
s.camera.rotation_euler=(Vector((0,0,2.08))-s.camera.location).to_track_quat('-Z','Y').to_euler()
for mode in ['previous','light-response','unfiltered']:
 for obj in s.objects:
  if obj.type=='LIGHT':obj.visible_glossy=mode!='previous';obj.data.specular_factor=1 if mode!='previous' else (.08 if 'silk' in obj.name else 0)
 s.cycles.use_denoising=mode!='unfiltered'
 s.render.filepath=str(out/(mode+'.png'));bpy.ops.render.render(write_still=True)
 print('AUDIT',mode,flush=True)
