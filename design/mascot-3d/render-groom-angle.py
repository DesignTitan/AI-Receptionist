"""A three-quarter check of the real volume; leaves the source scene unchanged."""
import bpy
from pathlib import Path
from mathutils import Vector
BASE=Path(__file__).resolve().parent
bpy.ops.wm.open_mainfile(filepath=str(BASE/'mascot-groom-studio.blend'))
s=bpy.context.scene
prefs=bpy.context.preferences.addons['cycles'].preferences;prefs.compute_device_type='METAL';prefs.get_devices()
for d in prefs.devices:d.use=d.type=='METAL'
s.cycles.device='GPU';s.cycles.samples=128;s.cycles.adaptive_threshold=.015
s.camera.location=(3,-8,2.35);s.camera.rotation_euler=(Vector((0,0,1.4))-s.camera.location).to_track_quat('-Z','Y').to_euler();s.camera.data.ortho_scale=2.95
s.render.resolution_x=1000;s.render.resolution_y=1000;s.render.filepath=str(BASE/'renders/regional-groom-angle.png')
bpy.ops.render.render(write_still=True)
