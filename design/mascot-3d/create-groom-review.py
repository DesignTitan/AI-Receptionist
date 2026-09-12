"""Pack the original reference and the Cycles render beside the editable groom."""
import bpy
from pathlib import Path
BASE=Path(__file__).resolve().parent
bpy.ops.wm.open_mainfile(filepath=str(BASE/'mascot-groom-studio.blend'))
portrait=bpy.data.images.load(str(BASE/'renders/regional-groom.png'),check_existing=False);portrait.name='Regional groom • Cycles beauty';portrait.pack()
reference=bpy.data.images.load(str(BASE.parent.parent/'public/marketing/happy-mascot-pointed.png'),check_existing=False);reference.name='Original mascot • likeness reference';reference.pack()
for screen in bpy.data.screens:
 if screen.name.startswith('Layout'):
  for area in screen.areas:
   if area.type=='PROPERTIES':area.type='IMAGE_EDITOR';area.spaces.active.image=portrait
   elif area.type=='VIEW_3D':
    area.spaces.active.shading.type='SOLID';area.spaces.active.shading.color_type='MATERIAL'
    area.spaces.active.region_3d.view_perspective='CAMERA';area.spaces.active.region_3d.view_camera_zoom=0
    area.spaces.active.overlay.show_overlays=False
text=bpy.data.texts.new('START HERE • editable groom')
text.write('''REGIONAL GROOM STUDIO

Left: editable 3D model. Right: the packed Cycles beauty render.
The solid viewport is for editing, not final shading. F12 makes a new render;
choose Render Result in the image editor after rendering.
Choose Original mascot • likeness reference to compare with the target.

GROOM • editable regional guides contains crown, forehead, left/right cheek,
chin/point and back/side objects, plus a separate short undercoat for each.
Select a guide object and enter Sculpt mode to comb or change its length.
Enable overlays to see the selected guides while editing.
The TOPCOAT and UNDERCOAT modifier panels expose density, clumping,
frizz and fibre radius. Viewport density is 7% to keep editing responsive.
Guides are joined before generating the continuous coat.
Guide edits drive the coat live; they are not baked into a giant hair mesh.

The scene uses built-in Blender hair tools, with explicit nearest-guide
convergence for the topcoat. Cycles handles hair scattering and shadows.
All required node groups and both comparison images are embedded here.
No paid add-on, RenderMan installation or external texture is required.

This is a look-development scene, not visual approval or a finished animation rig.
The original still remains the likeness target. Website and Spline assets
are separate and were not overwritten. No dynamics or AE project is claimed.
''')
bpy.ops.wm.save_as_mainfile(filepath=str(BASE/'mascot-groom-review.blend'),compress=True)
print('GROOM_REVIEW_READY')
