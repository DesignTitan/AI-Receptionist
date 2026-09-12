"""Structural and live-deformation checks for the native guide groom (not visual approval)."""
from pathlib import Path
import bpy, numpy as np, json
BASE=Path(__file__).resolve().parent
bpy.ops.wm.open_mainfile(filepath=str(BASE/'mascot-groom-studio.blend'))
guides=[o for o in bpy.data.objects if o.type=='CURVES' and o.name not in ['TOPCOAT • live controls','UNDERCOAT • live controls']]
assert len(guides)==12
for o in guides:
 assert len(o.data.curves)>100 and o.data.surface is not None
 assert o.data.surface_uv_map=='GroomUV'
 assert len(o.data.attributes['surface_uv_coordinate'].data)==len(o.data.curves)
 assert o.hide_render and not o.modifiers
coat=bpy.data.objects['TOPCOAT • live controls'];tree=coat.modifiers[0].node_group
assert len([n for n in tree.nodes if n.bl_idname=='GeometryNodeObjectInfo'])==6
assert {n.node_tree.name for n in tree.nodes if n.bl_idname=='GeometryNodeGroup'}>={'Interpolate Hair Curves','Frizz Hair Curves','Set Hair Curve Profile'}
def evaluated_positions():
 bpy.context.view_layer.update()
 data=coat.evaluated_get(bpy.context.evaluated_depsgraph_get()).data
 arr=np.empty(len(data.points)*3,dtype=np.float32)
 data.attributes['position'].data.foreach_get('vector',arr)
 return arr.reshape(-1,3),len(data.curves)
before,count=evaluated_positions()
assert count>10000 and np.isfinite(before).all()
assert any(n.bl_idname=='GeometryNodeSampleCurve' for n in tree.nodes)
geometry=coat.evaluated_get(bpy.context.evaluated_depsgraph_get()).data
lengths=[]
for curve in list(geometry.curves)[::20]:
 coords=np.array([p.position[:] for p in curve.points])
 lengths.append(float(np.linalg.norm(np.diff(coords,axis=0),axis=1).sum()))
assert max(lengths)<.20, f'Groom fibers must stay local to their guides: {max(lengths)}'

guide=bpy.data.objects['Forehead • sculpt these guides'];data=guide.data
original=[]
for curve in list(data.curves)[:30]:
 for point in list(curve.points)[4:]:
  original.append((point,point.position.copy()));point.position.x+=.035
try:
 data.update_tag();guide.update_tag()
 after,_=evaluated_positions()
 delta=np.linalg.norm(after-before,axis=1)
 changed=int((delta>1e-5).sum())
 assert changed>30, 'Editing guides must change interpolated coat geometry'
finally:
 for point,pos in original:point.position=pos
 data.update_tag();guide.update_tag()
 restored,_=evaluated_positions()
 assert np.allclose(before,restored,atol=1e-6)
report={'regional_guide_objects':len(guides),'editable_guide_curves':sum(len(o.data.curves) for o in guides),'preview_topcoat_curves':count,'points_changed_by_guide_edit':changed,'sampled_fibre_length_range':[min(lengths),max(lengths)],'guide_edit_restores_exactly':True,'packed_assets':'Blender 5.1 bundled hair geometry nodes (CC0)','visual_approval':False}
(BASE/'groom-verification.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2))
