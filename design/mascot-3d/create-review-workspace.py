import bpy
from pathlib import Path
root=Path(__file__).resolve().parents[2]
portrait=root/'public/mascot-3d/portrait.png'
image=bpy.data.images.load(str(portrait),check_existing=False)
image.name='Mascot • latest full render';image.pack()
for screen in bpy.data.screens:
 if screen.name.startswith('Layout'):
  for area in screen.areas:
   if area.type=='PROPERTIES':
    area.type='IMAGE_EDITOR';area.spaces.active.image=image
   elif area.type=='VIEW_3D':
    area.spaces.active.shading.type='MATERIAL'
    area.spaces.active.region_3d.view_perspective='CAMERA'
    area.spaces.active.overlay.show_overlays=False
    area.spaces.active.region_3d.view_camera_zoom=0
  for area in screen.areas:
   if area.type=='IMAGE_EDITOR':
    for region in area.regions:
     if region.type=='WINDOW':
      try:
       with bpy.context.temp_override(area=area,region=region):bpy.ops.image.view_all(fit_view=True)
      except Exception as e:print('FIT',str(e))
text=bpy.data.texts.get('READ ME • mascot workspace') or bpy.data.texts.new('READ ME • mascot workspace')
text.clear();text.write('Left: editable 3D mascot. Right: packed full-quality Blender render. The right panel is a still reference, not a live render. Press F12 to render an updated frame; choose Render Result in the image selector to inspect it. Source master stays in mascot-master.blend. This review copy preserves the same model and animation.\n')
bpy.ops.wm.save_as_mainfile(filepath=str(root/'design/mascot-3d/mascot-review.blend'))
print('REVIEW_WORKSPACE_SAVED')
