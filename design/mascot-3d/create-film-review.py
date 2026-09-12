"""Run in Blender with mascot-film.blend loaded after rendering the final portrait."""
import bpy
from pathlib import Path
base=Path(__file__).resolve().parent
image=bpy.data.images.load(str(base/'renders/soft-fur-final.png'),check_existing=False)
image.name='Soft fur • full Cycles render';image.pack()
reference=bpy.data.images.load(str(base.parent.parent/'public/marketing/happy-mascot-pointed.png'),check_existing=False)
reference.name='Original character • likeness target';reference.pack()
for screen in bpy.data.screens:
 if screen.name.startswith('Layout'):
  for area in screen.areas:
   if area.type=='PROPERTIES':
    area.type='IMAGE_EDITOR';area.spaces.active.image=image
   elif area.type=='VIEW_3D':
    area.spaces.active.shading.type='SOLID';area.spaces.active.shading.color_type='MATERIAL'
    area.spaces.active.region_3d.view_perspective='CAMERA';area.spaces.active.region_3d.view_camera_zoom=0
    area.spaces.active.overlay.show_overlays=False
  for area in screen.areas:
   if area.type=='IMAGE_EDITOR':
    for region in area.regions:
     if region.type=='WINDOW':
      with bpy.context.temp_override(area=area,region=region):bpy.ops.image.view_all(fit_view=True)
t=bpy.data.texts.new('READ ME • soft fur studio')
t.write('Left: editable model in solid modelling view. Right: full Cycles render with native hair scattering. The modelling view does not represent final lighting. F12 renders a new frame; choose Render Result in the right image selector. The original generated character is packed here too as Original character • likeness target. No Spline or browser GLB was changed in this pass.\n')
bpy.ops.wm.save_as_mainfile(filepath=str(base/'mascot-film-review.blend'),compress=True)
print('FILM_REVIEW_READY')
