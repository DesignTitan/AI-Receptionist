"""Render the selected lighting draft scene at final resolution without regenerating its groom."""
import bpy
from pathlib import Path
base=Path(__file__).resolve().parent
scene=bpy.context.scene
pref=bpy.context.preferences.addons['cycles'].preferences
pref.compute_device_type='METAL';pref.get_devices()
for device in pref.devices:device.use=device.type=='METAL'
scene.cycles.device='GPU'
scene.cycles.samples=512;scene.cycles.adaptive_threshold=.008
scene.render.resolution_x=1800;scene.render.resolution_y=1800
scene.render.filepath=str(base/'renders/soft-fur-final.png')
bpy.ops.wm.save_as_mainfile(filepath=str(base/'mascot-film.blend'),compress=True)
bpy.ops.render.render(write_still=True)
print('FINAL_RENDER_COMPLETE')
