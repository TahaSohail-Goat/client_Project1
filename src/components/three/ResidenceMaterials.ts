import {
  CanvasTexture, DoubleSide, Material, MeshPhysicalMaterial, MeshStandardMaterial,
  RepeatWrapping, SRGBColorSpace, Texture,
} from "three";

export const residenceTextureUrls=[
  ...["limestone","oak","linen","grass"].flatMap(name=>["color","normal","roughness"].map(channel=>`/media/residence-realism/${name}-${channel}.webp`)),
  "/media/hero-study/plastered_wall_04.jpg",
];
export type ResidencePalette=Record<string,Material>;

/** The maps tile in metres through geometry UVs, rather than stretching per object. */
export function residenceMaterials(maps:Texture[],anisotropy:number) {
  const owned:Texture[]=[];
  const map=(i:number,repeat=1,color=false)=>{
    const t=maps[i].clone();t.wrapS=t.wrapT=RepeatWrapping;t.repeat.set(repeat,repeat);
    if(color)t.colorSpace=SRGBColorSpace;
    t.anisotropy=anisotropy;t.needsUpdate=true;owned.push(t);return t;
  };
  const surface=(offset:number,color:string,roughness:number,repeat=1)=>{
    const material=new MeshStandardMaterial({color,map:map(offset,repeat,true),normalMap:map(offset+1,repeat),roughnessMap:map(offset+2,repeat),roughness});
    material.normalScale.set(.2,.2);material.envMapIntensity=.5;return material;
  };
  const plain=(color:string,roughness=.7,metalness=0)=>new MeshStandardMaterial({color,roughness,metalness});
  const stone=surface(0,"#e4dac6",.66,.5);
  const timber=surface(3,"#e4d1ae",.7,.7);timber.normalScale.set(.12,.12);
  const fabric=(color:string)=>{
    const mat=new MeshPhysicalMaterial({color,roughness:.96,normalMap:map(7,3.5),roughnessMap:map(8,3.5),sheen:.7,sheenColor:"#d3c8b4",sheenRoughness:.92,specularIntensity:.18});
    mat.normalScale.set(.18,.18);return mat;
  };
  const plaster=new MeshStandardMaterial({color:"#e5dfd1",map:map(12,.65,true),roughness:.98,bumpMap:map(12,.65),bumpScale:.012});
  const rug=surface(6,"#b6aa93",.98,2.5);rug.normalScale.set(.35,.35);
  const ground=surface(9,"#8da56c",1,.4);ground.normalScale.set(.5,.5);
  const curtain=new MeshPhysicalMaterial({color:"#e9e1cf",roughness:1,transparent:true,opacity:.42,side:DoubleSide,depthWrite:false,sheen:1,sheenColor:"#e8dcc6",sheenRoughness:1,normalMap:map(7,4)});
  const materials:ResidencePalette={
    stone,plaster,timber,ground,rug,curtain,ceiling:plain("#eee9de",.98),
    linen:fabric("#c9bea8"),cream:fabric("#e6dece"),olive:fabric("#717560"),
    bronze:plain("#78644e",.34,.8),dark:plain("#272d2a",.53,.3),
    terracotta:plain("#8b6b51",.86),white:plain("#e6e2d7",.28),
    leaf:plain("#4b6137",.95),leafDark:plain("#354b30",.95),bark:plain("#645747",.96),
    glow:new MeshStandardMaterial({color:"#ffdeb0",emissive:"#ffd4a0",emissiveIntensity:1.4}),
    glass:new MeshPhysicalMaterial({color:"#d6e0dc",transparent:true,opacity:.075,roughness:.085,metalness:0,ior:1.52,clearcoat:.8,clearcoatRoughness:.06,envMapIntensity:.7,depthWrite:false,side:DoubleSide}),
    water:new MeshPhysicalMaterial({color:"#354f49",roughness:.2,metalness:.22,clearcoat:1,clearcoatRoughness:.13,envMapIntensity:.85}),
    mirror:plain("#c6c9bf",.07,1),
  };
  // Original abstract artwork; the house remains independent of client project photos.
  const canvas=document.createElement("canvas");canvas.width=canvas.height=512;
  const c=canvas.getContext("2d")!;
  c.fillStyle="#d5cbb7";c.fillRect(0,0,512,512);
  c.fillStyle="#a88462";c.beginPath();c.arc(240,220,144,0,Math.PI*2);c.fill();
  c.fillStyle="#4e5b4d";c.fillRect(210,110,105,340);
  c.fillStyle="#c3b28d";c.beginPath();c.arc(130,355,110,0,Math.PI*2);c.fill();
  c.strokeStyle="#e9dfc9";c.lineWidth=3;c.beginPath();c.moveTo(66,400);c.bezierCurveTo(460,300,130,60,414,76);c.stroke();
  const art=new CanvasTexture(canvas);art.colorSpace=SRGBColorSpace;owned.push(art);
  materials.art=new MeshStandardMaterial({map:art,roughness:1});
  return {materials,dispose:()=>{Object.values(materials).forEach(m=>m.dispose());owned.forEach(t=>t.dispose());}};
}
