from pathlib import Path
import json, math
import numpy as np
import trimesh
from trimesh.visual.material import PBRMaterial
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
MODEL_DIR = ROOT/'assets/models/electrical'
TEXTURE_DIR = ROOT/'assets/textures/pbr'
COLLIDER_DIR = ROOT/'assets/colliders/electrical'
for d in (MODEL_DIR, TEXTURE_DIR, COLLIDER_DIR): d.mkdir(parents=True, exist_ok=True)

MATS = {
 'MAT_METAL_DARK': ([28, 43, 53, 255], .82, .25),
 'MAT_METAL_BRUSHED': ([94, 111, 121, 255], .9, .22),
 'MAT_METAL_COPPER': ([177, 91, 47, 255], .86, .25),
 'MAT_POLYMER_BLACK': ([21, 27, 32, 255], .04, .56),
 'MAT_POLYMER_BLUE': ([18, 62, 86, 255], .08, .42),
 'MAT_RUBBER': ([10, 13, 16, 255], .0, .82),
 'MAT_CERAMIC': ([219, 211, 181, 255], .02, .5),
 'MAT_GLASS': ([35, 72, 87, 130], .0, .1),
 'MAT_EMISSIVE_SCREEN': ([8, 32, 35, 255], .1, .22),
 'MAT_RED': ([150, 28, 31, 255], .1, .42),
 'MAT_BLACK': ([14, 17, 20, 255], .05, .62),
 'MAT_YELLOW': ([196, 157, 35, 255], .08, .46),
 'MAT_GREEN': ([33, 119, 78, 255], .08, .46),
 'MAT_BENCH_TOP': ([38, 54, 61, 255], .18, .5),
 'MAT_WHITE': ([210, 220, 224, 255], .02, .5),
 'MAT_ORANGE': ([215, 91, 34, 255], .06, .48),
 'MAT_LABEL': ([222, 232, 235, 255], .02, .68),
 'MAT_WARNING': ([236, 167, 38, 255], .05, .52),
 'MAT_STAINLESS': ([145, 158, 164, 255], .92, .18),
 'MAT_SCREEN_GLASS': ([18, 45, 57, 150], .02, .08),
}

def material(name):
    c,m,r=MATS[name]
    return PBRMaterial(name=name, baseColorFactor=c, metallicFactor=m, roughnessFactor=r)

def T(x=0,y=0,z=0):
    M=np.eye(4);M[:3,3]=[x,y,z];return M

def R(axis,deg):
    axis=np.array(axis,dtype=float);axis/=np.linalg.norm(axis)
    return trimesh.transformations.rotation_matrix(math.radians(deg),axis)

def add(scene, mesh, name, mat, transform=None):
    mesh.visual.material=material(mat)
    if transform is not None: mesh.apply_transform(transform)
    scene.add_geometry(mesh, node_name=name, geom_name=name)

def box(scene,name,size,pos,mat): add(scene,trimesh.creation.box(size),name,mat,T(*pos))
def cyl(scene,name,radius,height,pos,mat,axis='z',sections=32):
    mesh=trimesh.creation.cylinder(radius=radius,height=height,sections=sections)
    M=T(*pos)
    if axis=='x': M=M@R([0,1,0],90)
    elif axis=='y': M=M@R([1,0,0],90)
    add(scene,mesh,name,mat,M)
def sphere(scene,name,radius,pos,mat,sub=2): add(scene,trimesh.creation.icosphere(subdivisions=sub,radius=radius),name,mat,T(*pos))

def screw(scene,name,pos,axis='z',seg=16):
    cyl(scene,f'{name}_MAT_STAINLESS',.028,.018,pos,'MAT_STAINLESS',axis,max(8,seg//2))

def label_plate(scene,name,size,pos,mat='MAT_LABEL'):
    box(scene,f'{name}_{mat}',size,pos,mat)

def add_premium_details(scene, asset, lod, seg):
    if lod > 1:
        return
    if asset == 'workbench':
        box(scene,'BENCH_EDGE_TRIM_MAT_STAINLESS',(4.82,.065,.06),(0,2.095,1.07),'MAT_STAINLESS')
        box(scene,'BENCH_ANTISTATIC_MAT_RUBBER',(2.25,.018,1.1),(0,2.105,.08),'MAT_RUBBER')
        for i,x in enumerate(np.linspace(-1.05,1.05,11 if lod==0 else 6)):
            label_plate(scene,f'BENCH_RULER_TICK_{i}',(.012,.012,.16),(x,2.121,.70),'MAT_LABEL')
        for i,(x,z) in enumerate([(-2.25,-.94),(2.25,-.94),(-2.25,.94),(2.25,.94)]): screw(scene,f'BENCH_FASTENER_{i}',(x,2.105,z),'y',seg)
        if lod==0:
            box(scene,'BENCH_POWER_STRIP_MAT_POLYMER_BLACK',(1.28,.12,.22),(1.45,2.20,-.72),'MAT_POLYMER_BLACK')
            for i,x in enumerate(np.linspace(.98,1.92,4)): cyl(scene,f'BENCH_SOCKET_{i}_MAT_BLACK',.055,.025,(x,2.27,-.72),'MAT_BLACK','y',seg)
    elif asset == 'power_supply':
        for i,(x,y) in enumerate([(-.65,.20),(.65,.20),(-.65,.79),(.65,.79)]): screw(scene,f'PSU_FRONT_SCREW_{i}',(x,y,.662),'z',seg)
        label_plate(scene,'PSU_VOLTAGE_LABEL',(.26,.055,.014),(.34,.82,.666))
        label_plate(scene,'PSU_CURRENT_LABEL',(.26,.055,.014),(.61,.82,.666))
        label_plate(scene,'PSU_WARNING_LABEL',(.33,.14,.016),(-.54,.38,.666),'MAT_WARNING')
        box(scene,'PSU_SCREEN_GLASS_MAT_SCREEN_GLASS',(.72,.26,.012),(-.28,.65,.674),'MAT_SCREEN_GLASS')
        ticks=13 if lod==0 else 7
        for group,cx in enumerate((.34,.61)):
            for i,a in enumerate(np.linspace(-2.25,.25,ticks)):
                x=cx+math.cos(a)*.175;y=.63+math.sin(a)*.175
                label_plate(scene,f'PSU_SCALE_{group}_{i}',(.012,.036,.012),(x,y,.675),'MAT_LABEL')
        if lod==0:
            for row in range(3):
                for col in range(8): box(scene,f'PSU_SIDEVENT_{row}_{col}_MAT_BLACK',(.018,.07,.055),(-.782,.30+row*.16,-.42+col*.12),'MAT_BLACK')
    elif asset == 'multimeter':
        for i,a in enumerate(np.linspace(-2.45,.55,17 if lod==0 else 9)):
            x=math.cos(a)*.31;y=.67+math.sin(a)*.31
            label_plate(scene,f'DMM_DIAL_TICK_{i}',(.012,.045,.012),(x,y,.267),'MAT_LABEL')
        for i,(x,mat) in enumerate([(-.22,'MAT_BLACK'),(0,'MAT_LABEL'),(.22,'MAT_RED')]):
            label_plate(scene,f'DMM_PORT_LABEL_{i}',(.14,.045,.012),(x,.34,.266),mat)
        for i,(x,y) in enumerate([(-.32,.32),(.32,.32),(-.32,1.25),(.32,1.25)]): screw(scene,f'DMM_FACE_SCREW_{i}',(x,y,.268),'z',seg)
        box(scene,'DMM_SCREEN_GLASS_MAT_SCREEN_GLASS',(.61,.34,.012),(0,1.10,.215),'MAT_SCREEN_GLASS')
        if lod==0:
            for side in (-1,1):
                for i in range(6): box(scene,f'DMM_GRIP_{side}_{i}_MAT_RUBBER',(.035,.105,.035),(side*.46,.42+i*.15,.12),'MAT_RUBBER')
    elif asset == 'resistor_module':
        label_plate(scene,'RES_VALUE_LABEL',(.48,.10,.014),(0,.22,.405))
        label_plate(scene,'RES_HOT_WARNING',(.25,.10,.014),(.47,.22,.405),'MAT_WARNING')
        for i,(x,z) in enumerate([(-.61,-.29),(.61,-.29),(-.61,.29),(.61,.29)]): screw(scene,f'RES_PREMIUM_SCREW_{i}',(x,.25,z),'y',seg)
    elif asset == 'toggle_switch':
        label_plate(scene,'SW_ON_LABEL',(.16,.055,.012),(-.17,.20,.25),'MAT_LABEL')
        label_plate(scene,'SW_OFF_LABEL',(.16,.055,.012),(.17,.20,.25),'MAT_LABEL')
        for i,x in enumerate((-.23,.23)): screw(scene,f'SW_SCREW_{i}',(x,.20,-.18),'y',seg)
    elif asset == 'lamp_load':
        label_plate(scene,'LAMP_RATING_LABEL',(.32,.09,.012),(0,.205,.315),'MAT_LABEL')
        for i,a in enumerate(np.linspace(0,2*math.pi,8 if lod==0 else 4,endpoint=False)):
            x=math.cos(a)*.215;z=math.sin(a)*.215
            box(scene,f'LAMP_SOCKET_RIB_{i}_MAT_METAL_BRUSHED',(.035,.22,.025),(x,.36,z),'MAT_METAL_BRUSHED')
    elif asset in ('ammeter','voltmeter'):
        prefix='AMM' if asset=='ammeter' else 'VOL'
        box(scene,f'{prefix}_FACE_BEZEL_MAT_STAINLESS',(.94,.61,.014),(0,.42,.226),'MAT_STAINLESS')
        box(scene,f'{prefix}_FACE_INSET_MAT_WHITE',(.88,.55,.012),(0,.42,.239),'MAT_WHITE')
        for i,x in enumerate(np.linspace(-.34,.34,9 if lod==0 else 5)): label_plate(scene,f'{prefix}_PRECISE_TICK_{i}',(.01,.105,.012),(x,.49,.249),'MAT_BLACK')
        for i,(x,y) in enumerate([(-.40,.18),(.40,.18),(-.40,.67),(.40,.67)]): screw(scene,f'{prefix}_FACE_SCREW_{i}',(x,y,.252),'z',seg)
    elif asset == 'fuse_module':
        label_plate(scene,'FUSE_CAUTION_LABEL',(.34,.09,.012),(0,.205,.286),'MAT_WARNING')
        for i,x in enumerate((-.41,.41)):
            box(scene,f'FUSE_CLIP_{i}_MAT_STAINLESS',(.09,.16,.18),(x,.35,0),'MAT_STAINLESS')
            screw(scene,f'FUSE_CLIP_SCREW_{i}',(x,.205,.21),'y',seg)
    elif asset == 'rheostat':
        label_plate(scene,'RHEO_SCALE_LABEL',(.45,.075,.012),(0,.83,.21),'MAT_LABEL')
        for i,x in enumerate(np.linspace(-.34,.34,11 if lod==0 else 6)): label_plate(scene,f'RHEO_SCALE_TICK_{i}',(.012,.055,.012),(x,.79,.26),'MAT_LABEL')
        label_plate(scene,'RHEO_HOT_LABEL',(.22,.08,.012),(.48,.20,.36),'MAT_WARNING')
    elif asset == 'diode_module':
        label_plate(scene,'DIODE_ANODE_LABEL',(.20,.07,.012),(-.30,.18,.285),'MAT_LABEL')
        label_plate(scene,'DIODE_CATHODE_LABEL',(.20,.07,.012),(.30,.18,.285),'MAT_LABEL')
        box(scene,'DIODE_POLARITY_BAND_MAT_WHITE',(.035,.26,.26),(.16,.42,0),'MAT_WHITE')
    elif asset == 'led_module':
        label_plate(scene,'LED_ANODE_LABEL',(.18,.07,.012),(-.22,.18,.305),'MAT_RED')
        label_plate(scene,'LED_CATHODE_LABEL',(.18,.07,.012),(.22,.18,.305),'MAT_BLACK')
        if lod==0:
            cyl(scene,'LED_INTERNAL_ANODE_MAT_METAL_COPPER',.018,.24,(-.045,.39,0),'MAT_METAL_COPPER','y',seg)
            cyl(scene,'LED_INTERNAL_CATHODE_MAT_METAL_COPPER',.018,.18,(.045,.36,0),'MAT_METAL_COPPER','y',seg)

def export_lods(asset, builder, scales=(64,32,16)):
    info=[]
    for level,seg in enumerate(scales):
        s=builder(seg,level)
        add_premium_details(s, asset, level, seg)
        path=MODEL_DIR/f'{asset}_lod{level}.glb'
        s.export(path)
        info.append({'level':level,'url':f'assets/models/electrical/{path.name}','distance':[0,7,14][level],'bytes':path.stat().st_size})
    return info

def workbench(seg,lod):
    s=trimesh.Scene()
    box(s,'BENCH_TOP_MAT_BENCH_TOP',(4.8,.18,2.15),(0,2.0,0),'MAT_BENCH_TOP')
    box(s,'BENCH_BACK_MAT_METAL_DARK',(4.8,1.45,.12),(0,2.78,-1.0),'MAT_METAL_DARK')
    for x in (-2.12,2.12):
      for z in (-.82,.82): box(s,f'LEG_{x}_{z}_MAT_METAL_DARK',(.18,1.95,.18),(x,1.0,z),'MAT_METAL_DARK')
    box(s,'LOWER_SHELF_MAT_METAL_DARK',(4.3,.12,1.75),(0,.52,0),'MAT_METAL_DARK')
    if lod<2:
      for i,x in enumerate(np.linspace(-2.1,2.1,15 if lod==0 else 9)):
        box(s,f'BACK_SLOT_{i}_MAT_METAL_BRUSHED',(.06,.72,.035),(x,2.82,-.925),'MAT_METAL_BRUSHED')
      for x in (-1.65,0,1.65):
        box(s,f'DRAWER_{x}_MAT_POLYMER_BLUE',(1.35,.38,.72),(x,1.72,.63),'MAT_POLYMER_BLUE')
        cyl(s,f'DRAWER_HANDLE_{x}_MAT_METAL_BRUSHED',.035,.62,(x,1.72,1.01),'MAT_METAL_BRUSHED','x',seg)
    return s

def power_supply(seg,lod):
    s=trimesh.Scene()
    box(s,'PSU_BODY_MAT_METAL_DARK',(1.55,.86,1.15),(0,.48,0),'MAT_METAL_DARK')
    box(s,'PSU_FRONT_MAT_POLYMER_BLUE',(1.48,.74,.07),(0,.48,.61),'MAT_POLYMER_BLUE')
    box(s,'PSU_SCREEN_MAT_EMISSIVE_SCREEN',(.68,.22,.025),(-.28,.65,.655),'MAT_EMISSIVE_SCREEN')
    for i,x in enumerate((.34,.61)):
      cyl(s,f'KNOB_{"VOLTAGE" if i==0 else "CURRENT"}_MAT_POLYMER_BLACK',.13,.10,(x,.63,.69),'MAT_POLYMER_BLACK','z',seg)
      cyl(s,f'KNOB_RING_{i}_MAT_METAL_BRUSHED',.15,.035,(x,.63,.645),'MAT_METAL_BRUSHED','z',seg)
    for x,mat,label in ((-.38,'MAT_RED','POS'),(-.08,'MAT_BLACK','NEG')):
      cyl(s,f'OUTPUT_{label}_MAT_METAL_BRUSHED',.085,.13,(x,.28,.69),'MAT_METAL_BRUSHED','z',seg)
      cyl(s,f'OUTPUT_{label}_INSULATOR_{mat}',.13,.055,(x,.28,.635),mat,'z',seg)
    box(s,'POWER_BUTTON_MAT_GREEN',(.13,.13,.04),(.63,.28,.65),'MAT_GREEN')
    for x in (-.58,.58): box(s,f'FOOT_{x}_MAT_RUBBER',(.25,.08,.18),(x,.04,.35),'MAT_RUBBER')
    if lod<2:
      for i in range(7 if lod==0 else 4): box(s,f'VENT_{i}_MAT_BLACK',(.07,.28,.018),(-.45+i*.15,.47,-.584),'MAT_BLACK')
      cyl(s,'HANDLE_LEFT_MAT_METAL_BRUSHED',.035,.68,(-.58,1.02,0),'MAT_METAL_BRUSHED','z',seg)
      cyl(s,'HANDLE_RIGHT_MAT_METAL_BRUSHED',.035,.68,(.58,1.02,0),'MAT_METAL_BRUSHED','z',seg)
      cyl(s,'HANDLE_TOP_MAT_METAL_BRUSHED',.035,1.16,(0,1.35,0),'MAT_METAL_BRUSHED','x',seg)
    return s

def multimeter(seg,lod):
    s=trimesh.Scene()
    box(s,'DMM_RUBBER_SHELL_MAT_RUBBER',(.92,1.42,.30),(0,.72,0),'MAT_RUBBER')
    box(s,'DMM_BODY_MAT_YELLOW',(.78,1.26,.32),(0,.74,.02),'MAT_YELLOW')
    box(s,'DMM_SCREEN_MAT_EMISSIVE_SCREEN',(.57,.30,.025),(0,1.10,.19),'MAT_EMISSIVE_SCREEN')
    cyl(s,'DMM_DIAL_MAT_POLYMER_BLACK',.235,.08,(0,.67,.21),'MAT_POLYMER_BLACK','z',seg)
    cyl(s,'DMM_DIAL_POINTER_MAT_WHITE',.035,.10,(0,.80,.265),'MAT_WHITE','z',seg)
    for i,x in enumerate((-.22,0,.22)): cyl(s,f'DMM_PORT_{i}_MAT_{"BLACK" if i==0 else "RED"}',.075,.08,(x,.22,.21),'MAT_BLACK' if i==0 else 'MAT_RED','z',seg)
    if lod<2:
      for i,x in enumerate((-.22,.22)): box(s,f'DMM_BUTTON_{i}_MAT_POLYMER_BLACK',(.15,.08,.035),(x,.88,.20),'MAT_POLYMER_BLACK')
      box(s,'DMM_STAND_MAT_POLYMER_BLACK',(.62,.12,.44),(0,.44,-.25),'MAT_POLYMER_BLACK')
    return s

def resistor_module(seg,lod):
    s=trimesh.Scene()
    box(s,'RES_BASE_MAT_POLYMER_BLACK',(1.45,.23,.80),(0,.13,0),'MAT_POLYMER_BLACK')
    cyl(s,'RES_BODY_MAT_CERAMIC',.19,.72,(0,.48,0),'MAT_CERAMIC','x',seg)
    for i,(x,mat) in enumerate(((-.24,'MAT_RED'),(-.12,'MAT_BLACK'),(.04,'MAT_ORANGE'),(.23,'MAT_YELLOW'))):
      cyl(s,f'RES_BAND_{i}_{mat}',.196,.055,(x,.48,0),mat,'x',seg)
    for x in (-.53,.53):
      cyl(s,f'RES_LEAD_{x}_MAT_METAL_BRUSHED',.028,.32,(x,.48,0),'MAT_METAL_BRUSHED','x',seg)
      cyl(s,f'RES_TERMINAL_{x}_MAT_METAL_COPPER',.075,.10,(x,.24,.26),'MAT_METAL_COPPER','y',seg)
    if lod==0:
      for i in range(4): cyl(s,f'RES_SCREW_{i}_MAT_METAL_BRUSHED',.025,.02,((-1 if i%2==0 else 1)*.61,.25,(-1 if i<2 else 1)*.29),'MAT_METAL_BRUSHED','y',seg)
    return s

def toggle_switch(seg,lod):
    s=trimesh.Scene()
    box(s,'SW_BASE_MAT_POLYMER_BLACK',(.58,.18,.48),(0,.10,0),'MAT_POLYMER_BLACK')
    cyl(s,'SW_COLLAR_MAT_METAL_BRUSHED',.13,.16,(0,.26,0),'MAT_METAL_BRUSHED','y',seg)
    cyl(s,'SW_LEVER_MAT_METAL_BRUSHED',.055,.52,(0,.55,0),'MAT_METAL_BRUSHED','y',seg)
    sphere(s,'SW_TIP_MAT_POLYMER_BLUE',.09,(0,.83,0),'MAT_POLYMER_BLUE',1 if lod==2 else 2)
    for x in (-.18,.18): cyl(s,f'SW_TERM_{x}_MAT_METAL_COPPER',.035,.18,(x,-.04,0),'MAT_METAL_COPPER','y',seg)
    return s

def lamp_load(seg,lod):
    s=trimesh.Scene()
    box(s,'LAMP_BASE_MAT_POLYMER_BLACK',(.70,.18,.62),(0,.10,0),'MAT_POLYMER_BLACK')
    cyl(s,'LAMP_SOCKET_MAT_METAL_BRUSHED',.20,.28,(0,.30,0),'MAT_METAL_BRUSHED','y',seg)
    sphere(s,'LAMP_BULB_MAT_GLASS',.32,(0,.73,0),'MAT_GLASS',2 if lod<2 else 1)
    cyl(s,'LAMP_FILAMENT_MAT_EMISSIVE_SCREEN',.018,.30,(0,.69,0),'MAT_EMISSIVE_SCREEN','x',max(8,seg//2))
    for x in (-.24,.24): cyl(s,f'LAMP_TERM_{x}_MAT_METAL_COPPER',.035,.15,(x,.06,.22),'MAT_METAL_COPPER','y',seg)
    return s


def panel_meter(seg,lod,kind='ammeter'):
    s=trimesh.Scene()
    accent='MAT_RED' if kind=='ammeter' else 'MAT_POLYMER_BLUE'
    prefix='AMM' if kind=='ammeter' else 'VOL'
    box(s,f'{prefix}_BODY_MAT_METAL_DARK',(1.02,.72,.38),(0,.38,0),'MAT_METAL_DARK')
    box(s,f'{prefix}_FACE_MAT_WHITE',(.88,.55,.035),(0,.42,.205),'MAT_WHITE')
    box(s,f'{prefix}_SCREEN_MAT_EMISSIVE_SCREEN',(.58,.22,.025),(0,.47,.23),'MAT_EMISSIVE_SCREEN')
    box(s,f'{prefix}_LABEL_{accent}',(.22,.07,.025),(0,.66,.235),accent)
    for x,mat,label in ((-.25,'MAT_BLACK','COM'),(.25,'MAT_RED','INPUT')):
        cyl(s,f'{prefix}_PORT_{label}_MAT_METAL_BRUSHED',.065,.08,(x,.16,.24),'MAT_METAL_BRUSHED','z',seg)
        cyl(s,f'{prefix}_PORT_{label}_INS_{mat}',.10,.04,(x,.16,.20),mat,'z',seg)
    if lod<2:
        for i,x in enumerate(np.linspace(-.34,.34,5)):
            box(s,f'{prefix}_TICK_{i}_MAT_BLACK',(.012,.09,.016),(x,.50,.237),'MAT_BLACK')
        box(s,f'{prefix}_FOOT_L_MAT_RUBBER',(.17,.06,.18),(-.34,.03,.03),'MAT_RUBBER')
        box(s,f'{prefix}_FOOT_R_MAT_RUBBER',(.17,.06,.18),(.34,.03,.03),'MAT_RUBBER')
    return s

def ammeter(seg,lod): return panel_meter(seg,lod,'ammeter')
def voltmeter(seg,lod): return panel_meter(seg,lod,'voltmeter')

def fuse_module(seg,lod):
    s=trimesh.Scene()
    box(s,'FUSE_BASE_MAT_POLYMER_BLACK',(1.02,.20,.54),(0,.10,0),'MAT_POLYMER_BLACK')
    cyl(s,'FUSE_GLASS_MAT_GLASS',.095,.58,(0,.35,0),'MAT_GLASS','x',seg)
    cyl(s,'FUSE_WIRE_MAT_METAL_COPPER',.018,.48,(0,.35,0),'MAT_METAL_COPPER','x',max(8,seg//2))
    for x in (-.34,.34):
        cyl(s,f'FUSE_CAP_{x}_MAT_METAL_BRUSHED',.105,.12,(x,.35,0),'MAT_METAL_BRUSHED','x',seg)
        cyl(s,f'FUSE_TERM_{x}_MAT_METAL_COPPER',.055,.11,(x,.14,.20),'MAT_METAL_COPPER','y',seg)
    if lod==0:
        box(s,'FUSE_LABEL_MAT_WHITE',(.32,.07,.018),(0,.19,.285),'MAT_WHITE')
    return s

def rheostat(seg,lod):
    s=trimesh.Scene()
    box(s,'RHEO_BASE_MAT_POLYMER_BLACK',(1.35,.22,.70),(0,.11,0),'MAT_POLYMER_BLACK')
    cyl(s,'RHEO_CORE_MAT_CERAMIC',.15,.76,(0,.46,0),'MAT_CERAMIC','x',seg)
    turns=18 if lod==0 else (10 if lod==1 else 6)
    for i,x in enumerate(np.linspace(-.34,.34,turns)):
        cyl(s,f'RHEO_WIRE_{i}_MAT_METAL_COPPER',.156,.022,(x,.46,0),'MAT_METAL_COPPER','x',max(8,seg//2))
    box(s,'RHEO_RAIL_MAT_METAL_BRUSHED',(.86,.05,.08),(0,.76,0),'MAT_METAL_BRUSHED')
    box(s,'RHEO_SLIDER_MAT_ORANGE',(.16,.18,.24),(-.12,.78,0),'MAT_ORANGE')
    for x in (-.52,.52): cyl(s,f'RHEO_TERM_{x}_MAT_METAL_COPPER',.06,.12,(x,.16,.25),'MAT_METAL_COPPER','y',seg)
    return s

def diode_module(seg,lod):
    s=trimesh.Scene()
    box(s,'DIODE_BASE_MAT_POLYMER_BLACK',(1.05,.20,.55),(0,.10,0),'MAT_POLYMER_BLACK')
    cyl(s,'DIODE_BODY_MAT_BLACK',.13,.44,(0,.38,0),'MAT_BLACK','x',seg)
    cyl(s,'DIODE_CATHODE_BAND_MAT_WHITE',.135,.055,(.13,.38,0),'MAT_WHITE','x',seg)
    for x in (-.35,.35):
        cyl(s,f'DIODE_LEAD_{x}_MAT_METAL_BRUSHED',.024,.25,(x,.38,0),'MAT_METAL_BRUSHED','x',seg)
        cyl(s,f'DIODE_TERM_{x}_MAT_METAL_COPPER',.055,.11,(x,.14,.21),'MAT_METAL_COPPER','y',seg)
    return s

def led_module(seg,lod):
    s=trimesh.Scene()
    box(s,'LED_BASE_MAT_POLYMER_BLACK',(.78,.20,.58),(0,.10,0),'MAT_POLYMER_BLACK')
    cyl(s,'LED_RIM_MAT_METAL_BRUSHED',.18,.10,(0,.28,0),'MAT_METAL_BRUSHED','y',seg)
    sphere(s,'LED_LENS_MAT_GLASS',.20,(0,.48,0),'MAT_GLASS',2 if lod<2 else 1)
    cyl(s,'LED_EMITTER_MAT_RED',.065,.10,(0,.43,0),'MAT_RED','y',seg)
    for x in (-.22,.22): cyl(s,f'LED_TERM_{x}_MAT_METAL_COPPER',.055,.11,(x,.13,.22),'MAT_METAL_COPPER','y',seg)
    return s

assets={
 'workbench': export_lods('workbench',workbench),
 'power-supply': export_lods('power_supply',power_supply),
 'multimeter': export_lods('multimeter',multimeter),
 'resistor-module': export_lods('resistor_module',resistor_module),
 'toggle-switch': export_lods('toggle_switch',toggle_switch),
 'lamp-load': export_lods('lamp_load',lamp_load),
 'ammeter': export_lods('ammeter',ammeter),
 'voltmeter': export_lods('voltmeter',voltmeter),
 'fuse-module': export_lods('fuse_module',fuse_module),
 'rheostat': export_lods('rheostat',rheostat),
 'diode-module': export_lods('diode_module',diode_module),
 'led-module': export_lods('led_module',led_module),
}

# Procedural PBR texture maps.
rng=np.random.default_rng(42)
def save_noise(name, base, strength=20, brushed=False):
    w=h=256
    arr=np.zeros((h,w,3),dtype=np.uint8)
    noise=rng.normal(0,strength,(h,w))
    if brushed:
        noise=Image.fromarray(np.uint8(np.clip(noise+128,0,255))).filter(ImageFilter.GaussianBlur((0.8))).resize((w,h))
        noise=np.asarray(noise,dtype=float)-128
    for c,v in enumerate(base): arr[:,:,c]=np.clip(v+noise,0,255)
    Image.fromarray(arr,'RGB').save(TEXTURE_DIR/f'{name}_basecolor.png',optimize=True)

def save_gray(name,value,variation=12,linear=False):
    arr=np.clip(value+rng.normal(0,variation,(256,256)),0,255).astype(np.uint8)
    if linear:
      for x in range(256): arr[:,x]=np.clip(arr[:,x]+10*math.sin(x*.45),0,255)
    Image.fromarray(arr,'L').save(TEXTURE_DIR/f'{name}_roughness.png',optimize=True)

def save_normal(name,amount=12):
    n=rng.normal(0,amount,(256,256,2))
    arr=np.zeros((256,256,3),dtype=np.uint8);arr[:,:,0]=np.clip(128+n[:,:,0],0,255);arr[:,:,1]=np.clip(128+n[:,:,1],0,255);arr[:,:,2]=255
    Image.fromarray(arr,'RGB').save(TEXTURE_DIR/f'{name}_normal.png',optimize=True)

for name,base,rough,var,brush in [
 ('brushed-metal',(92,105,112),70,8,True),('rubber',(20,22,24),220,6,False),('ceramic',(218,211,185),130,8,False),('bench-top',(42,55,61),150,14,False)]:
    save_noise(name,base,8 if brush else var,brush)
    save_gray(name,rough,6 if brush else 10,brush)
    save_normal(name,5 if brush else 10)

colliders={
 'workbench':[{'shape':'box','size':[4.8,.18,2.15],'position':[0,2,0]},{'shape':'box','size':[4.8,1.45,.12],'position':[0,2.78,-1]}],
 'power-supply':[{'shape':'box','size':[1.55,.86,1.15],'position':[0,.48,0]}],
 'multimeter':[{'shape':'box','size':[.92,1.42,.32],'position':[0,.72,0]}],
 'resistor-module':[{'shape':'box','size':[1.45,.7,.8],'position':[0,.35,0]}],
 'toggle-switch':[{'shape':'box','size':[.58,.9,.48],'position':[0,.4,0]}],
 'lamp-load':[{'shape':'box','size':[.7,1.1,.62],'position':[0,.5,0]}],
 'ammeter':[{'shape':'box','size':[1.02,.72,.38],'position':[0,.38,0]}],
 'voltmeter':[{'shape':'box','size':[1.02,.72,.38],'position':[0,.38,0]}],
 'fuse-module':[{'shape':'box','size':[1.02,.58,.54],'position':[0,.29,0]}],
 'rheostat':[{'shape':'box','size':[1.35,.95,.70],'position':[0,.46,0]}],
 'diode-module':[{'shape':'box','size':[1.05,.62,.55],'position':[0,.31,0]}],
 'led-module':[{'shape':'box','size':[.78,.75,.58],'position':[0,.36,0]}],
}
for name,data in colliders.items():
    (COLLIDER_DIR/f'{name}.json').write_text(json.dumps({'asset':name,'units':'meters','colliders':data},indent=2),encoding='utf8')

manifest={
 'version':'1.2.0','generatedBy':'tools/generate_asset_pack.py','units':'meters','upAxis':'Y','forwardAxis':'-Z',
 'artGrade':'premium-procedural-v2','rules':{'format':'GLB 2.0','transforms':'applied','pivots':'interaction-ready','materials':'PBR slots by stable names','lods':'0 high, 1 medium, 2 low','surfaceDetail':'fasteners, bezels, labels, scales, vents and polarity marks'},
 'textures':{
   'MAT_METAL_BRUSHED':{'baseColor':'assets/textures/pbr/brushed-metal_basecolor.png','roughness':'assets/textures/pbr/brushed-metal_roughness.png','normal':'assets/textures/pbr/brushed-metal_normal.png','repeat':[5,5]},
   'MAT_RUBBER':{'baseColor':'assets/textures/pbr/rubber_basecolor.png','roughness':'assets/textures/pbr/rubber_roughness.png','normal':'assets/textures/pbr/rubber_normal.png','repeat':[4,4]},
   'MAT_CERAMIC':{'baseColor':'assets/textures/pbr/ceramic_basecolor.png','roughness':'assets/textures/pbr/ceramic_roughness.png','normal':'assets/textures/pbr/ceramic_normal.png','repeat':[3,3]},
   'MAT_BENCH_TOP':{'baseColor':'assets/textures/pbr/bench-top_basecolor.png','roughness':'assets/textures/pbr/bench-top_roughness.png','normal':'assets/textures/pbr/bench-top_normal.png','repeat':[6,3]},
 },
 'assets':{}
}
for key,lods in assets.items():
    manifest['assets'][key]={'category':'environment' if key=='workbench' else 'equipment','lods':lods,'collider':f'assets/colliders/electrical/{key}.json','fallback':'procedural','status':'runtime-ready','surfaceDetails': True}
(MODEL_DIR/'manifest.json').write_text(json.dumps(manifest,indent=2,ensure_ascii=False),encoding='utf8')
print(json.dumps({k:[x['bytes'] for x in v] for k,v in assets.items()},indent=2))
