"""Run in Blender with mascot-film.blend loaded. Checks the actual render scene."""
import bpy
from pathlib import Path
s=bpy.context.scene
assert s.render.engine=='CYCLES'
fur=bpy.data.objects['Fur • layered film groom']
assert fur.type=='CURVES'
assert len(fur.data.curves)==420000
radius=fur.data.attributes['radius']
assert radius.data[0].value>radius.data[6].value>0
hair=fur.data.materials[0]
assert any(n.bl_idname=='ShaderNodeBsdfHairPrincipled' for n in hair.node_tree.nodes)
assert not any(o.name=='Fur_Web' for o in s.objects)
assert not any(o.name.startswith('Catchlight_') for o in s.objects)
assert s.cycles.max_bounces>=12
assert len([o for o in s.objects if o.type=='LIGHT' and o.data.type=='AREA'])==4
assert s.camera is not None
assert Path(s.render.filepath).exists()
print('PASS: native tapered hair, dedicated hair shader, Cycles, studio lights, camera and saved render.')
