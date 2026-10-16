import {
  BoxGeometry, BufferGeometry, CanvasTexture, CylinderGeometry, DoubleSide,
  Euler, Group, LatheGeometry, Material, Matrix4, Mesh, MeshStandardMaterial, Quaternion,
  RepeatWrapping, SphereGeometry, SRGBColorSpace, Texture, TorusGeometry, Vector2, Vector3,
} from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import type { Tuple3 } from "../../content/heroWalkthrough";

type Palette = Record<string, Material>;
const pi = Math.PI;

/** Seeded textures are original, tileable scene materials, generated once, locally. */
function drawnTexture(kind: "stone" | "rug" | "art" | "water") {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = kind === "art" ? 512 : 256;
  const ctx = canvas.getContext("2d")!;
  let seed = 928;
  const rand = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  ctx.fillStyle = { stone: "#d2c4ac", rug: "#b1a188", art: "#d7ccba", water: "#455e57" }[kind];
  ctx.fillRect(0,0,canvas.width,canvas.height);
  if (kind === "art") {
    ctx.fillStyle = "#a27957"; ctx.beginPath(); ctx.arc(240,220,144,0,pi*2); ctx.fill();
    ctx.fillStyle = "#4c584e"; ctx.fillRect(210,110,105,340);
    ctx.fillStyle = "#c3b290"; ctx.beginPath(); ctx.arc(130,355,110,0,pi*2); ctx.fill();
    ctx.strokeStyle = "#eee1c8"; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(66,400); ctx.bezierCurveTo(460,300,130,60,414,76); ctx.stroke();
  } else for (let i=0;i<10000;i++) {
    const x=rand()*256,y=rand()*256;
    ctx.fillStyle = rand()>.5 ? `rgba(52,42,25,${rand()*.1})` : `rgba(255,246,219,${rand()*.2})`;
    ctx.fillRect(x,y,kind === "stone" ? 2+rand()*32 : 1,kind === "rug" ? 5 : 1);
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace=SRGBColorSpace;
  texture.wrapS=texture.wrapT=RepeatWrapping;
  if(kind !== "art") texture.repeat.set(kind === "rug" ? 7 : 3,kind === "rug" ? 7 : 3);
  return texture;
}

export function residenceMaterials(maps: Texture[], anisotropy: number) {
  const textures = maps.map((map,i) => {
    const copy=map.clone(); copy.wrapS=copy.wrapT=RepeatWrapping;
    copy.repeat.set(i === 3 ? 38 : 1, i === 3 ? 38 : 2);
    if(i!==1 && i!==2) copy.colorSpace=SRGBColorSpace;
    copy.anisotropy=anisotropy; copy.needsUpdate=true; return copy;
  });
  const stoneMap=drawnTexture("stone"), rugMap=drawnTexture("rug"), artMap=drawnTexture("art");
  const mat = (color: string, roughness=.7, metalness=0) => new MeshStandardMaterial({ color,roughness,metalness });
  const materials: Palette = {
    stone: new MeshStandardMaterial({map:stoneMap,roughness:.72,bumpMap:stoneMap,bumpScale:.018}),
    plaster: mat("#dfd6c4",.91),
    timber: new MeshStandardMaterial({color:"#c9ad87",map:textures[0],normalMap:textures[1],roughnessMap:textures[2],roughness:.68}),
    bronze: mat("#65503b",.32,.75),
    dark: mat("#282c29",.5,.25),
    linen: new MeshStandardMaterial({color:"#e4dac5",map:rugMap,roughness:1}),
    cream: mat("#ded7c8",.93),
    olive: mat("#707963",.95),
    terracotta: mat("#996d50",.95),
    rug: new MeshStandardMaterial({map:rugMap,roughness:1}),
    art: new MeshStandardMaterial({map:artMap,roughness:.95}),
    glow: new MeshStandardMaterial({color:"#ffe6b7",emissive:"#ffd18a",emissiveIntensity:2.5}),
    white: mat("#ede4d4",.22),
    leaf: mat("#65704c",.9),
    leafDark: mat("#3f503d",.95),
    bark: mat("#5e5140",1),
    ground: new MeshStandardMaterial({color:"#78846a",map:textures[3],roughness:1}),
    water: new MeshStandardMaterial({color:"#476b67",roughness:.13,metalness:.5}),
    glass: new MeshStandardMaterial({color:"#a5b9b0",transparent:true,opacity:.13,roughness:.09,metalness:.45,depthWrite:false,side:DoubleSide}),
    mirror: mat("#b2b9ad",.05,.95),
  };
  (materials.timber as MeshStandardMaterial).normalScale.set(.12,.12);
  return { materials, dispose: () => {
    Object.values(materials).forEach(m=>m.dispose());
    [...textures,stoneMap,rugMap,artMap].forEach(t=>t.dispose());
  }};
}

/** Batch geometry by material AND storey: detailed architecture in ~80 draw calls.
 * Slabs are built around a real stair opening; there is no animated wall removal.
 */
export function buildResidence(m: Palette) {
  const root=new Group(); root.name="The Residence — original four-storey concept";
  const batches = new Map<string, BufferGeometry[]>();
  let zone="site";
  const add = (geometry: BufferGeometry, material: string, p: Tuple3, rotation: Tuple3=[0,0,0]) => {
    const matrix=new Matrix4(); const q=new Quaternion().setFromEuler(new Euler(...rotation));
    matrix.compose(new Vector3(...p),q,new Vector3(1,1,1));
    const g=geometry.index ? geometry.toNonIndexed() : geometry.clone();
    geometry.dispose(); g.applyMatrix4(matrix);
    // Rounded primitives have extra UV channels on some Three versions.
    for (const key of Object.keys(g.attributes)) if(!["position","normal","uv"].includes(key)) g.deleteAttribute(key);
    const key=`${zone}:${material}`;
    if(!batches.has(key)) batches.set(key,[]);
    batches.get(key)!.push(g);
  };
  const box=(p:Tuple3,s:Tuple3,mat="stone",r:Tuple3=[0,0,0])=>add(new BoxGeometry(...s),mat,p,r);
  const soft=(p:Tuple3,s:Tuple3,mat="linen",radius=.09,r:Tuple3=[0,0,0])=>add(new RoundedBoxGeometry(...s,2,radius),mat,p,r);
  const cylinder=(p:Tuple3,rt:number,rb:number,h:number,mat="bronze",r:Tuple3=[0,0,0])=>add(new CylinderGeometry(rt,rb,h,20),mat,p,r);
  const sphere=(p:Tuple3,s:Tuple3,mat="leaf",r:Tuple3=[0,0,0],distantLeaf=false)=>{
    const g=new SphereGeometry(1,distantLeaf?5:12,distantLeaf?3:7);g.scale(...s);add(g,mat,p,r);
  };
  const rod=(a:Tuple3,b:Tuple3,r=.018,mat="bronze")=>{
    const start=new Vector3(...a),end=new Vector3(...b),v=end.clone().sub(start);
    const g=new CylinderGeometry(r,r,v.length(),8);
    g.applyQuaternion(new Quaternion().setFromUnitVectors(new Vector3(0,1,0),v.normalize()));
    add(g,mat,start.add(end).multiplyScalar(.5).toArray() as Tuple3);
  };
  const pot=(x:number,y:number,z:number,scale=1)=>{
    cylinder([x,y+.22*scale,z],.24*scale,.17*scale,.44*scale,"terracotta");
    for(let i=0;i<9;i++) {
      const a=i*2.4, top:Tuple3=[x+Math.cos(a)*.32*scale,y+(.6+(i%3)*.15)*scale,z+Math.sin(a)*.32*scale];
      rod([x,y+.4*scale,z],top,.008*scale,"leafDark");
      sphere(top,[.15*scale,.31*scale,.1*scale],i%2 ? "leaf":"leafDark");
    }
  };
  const book=(x:number,y:number,z:number,i:number)=>box([x,y,z],[.07,.27+(i%3)*.035,.22],i%3===0?"olive":i%3===1?"terracotta":"cream",[0,0,(i%4-1)*.025]);
  const art=(x:number,y:number,z:number,w=2,h=1.4)=>{
    box([x,y,z],[w+.1,h+.1,.06],"bronze");box([x,y,z+.036],[w,h,.008],"art");
  };
  const lamp=(x:number,y:number,z:number)=>{
    cylinder([x,y+.02,z],.23,.25,.04,"bronze");cylinder([x,y+.8,z],.015,.015,1.6);
    cylinder([x,y+1.52,z],.26,.4,.42,"linen");cylinder([x,y+1.31,z],.32,.32,.016,"glow");
  };
  const table=(x:number,y:number,z:number,w=1.5,d=.8)=>{
    soft([x,y+.42,z],[w,.1,d],"stone",.04);
    [-.3,.3].forEach(t=>box([x+w*t,y+.21,z],[.12,.4,d*.62],"timber"));
    cylinder([x+.18,y+.5,z],.16,.12,.08,"bronze");
    box([x-.32,y+.5,z-.05],[.32,.035,.26],"terracotta");box([x-.29,y+.53,z-.05],[.3,.025,.24],"cream");
  };
  const sofa=(x:number,y:number,z:number,w=3,rotation=0)=>{
    // Build in local coordinates so the sofa can sit against any facade.
    const local=(dx:number,dy:number,dz:number):Tuple3=>[x+dx*Math.cos(rotation)+dz*Math.sin(rotation),y+dy,z-dx*Math.sin(rotation)+dz*Math.cos(rotation)];
    const r:Tuple3=[0,rotation,0];
    soft(local(0,.27,0),[w,.32,.96],"timber",.07,r);
    soft(local(0,.72,-.44),[w,.72,.24],"linen",.1,r);
    [-1,1].forEach(sign=>soft(local(sign*(w/2-.12),.55,0),[.25,.6,1.05],"linen",.1,r));
    for(let i=0;i<3;i++) {
      soft(local((i-1)*(w-.5)/3,.53,.05),[(w-.5)/3-.025,.24,.8],"cream",.08,r);
      soft(local((i-1)*(w-.5)/3,.87,-.25),[.49,.46,.14],i===1?"olive":"linen",.06,[.15,rotation,.06*(i-1)]);
    }
  };
  const chair=(x:number,y:number,z:number,rotation=0)=>{
    cylinder([x,y+.26,z],.13,.27,.5,"bronze");
    soft([x,y+.5,z],[.6,.13,.62],"olive",.1,[0,rotation,0]);
    soft([x-Math.sin(rotation)*.24,y+.84,z-Math.cos(rotation)*.24],[.6,.66,.14],"olive",.08,[0,rotation,0]);
  };
  const pendant=(x:number,y:number,z:number,r=.66)=>{
    for(let i=0;i<3;i++) {
      const a=i*pi*2/3;rod([x,y+.65,z],[x+Math.cos(a)*r,y,z+Math.sin(a)*r],.006,"dark");
    }
    add(new TorusGeometry(r,.035,8,48),"bronze",[x,y,z],[pi/2,0,0]);
    add(new TorusGeometry(r,.018,8,48),"glow",[x,y-.035,z],[pi/2,0,0]);
  };
  const bed=(x:number,y:number,z:number,w=2.5)=>{
    soft([x,y+.21,z],[w+.2,.34,2.5],"timber",.06);
    soft([x,y+.5,z],[w,.3,2.38],"cream",.1);
    soft([x,y+.64,z+.28],[w+.02,.17,1.68],"linen",.08);
    soft([x,y+.74,z+.75],[w+.03,.08,.55],"olive",.025);
    soft([x,y+1,z-1.25],[w+1.6,1.7,.14],"linen",.05);
    [-.64,.64].forEach(dx=>soft([x+dx,y+.78,z-.73],[.92,.2,.53],"cream",.09,[.1,0,dx*.04]));
    [-1,1].forEach(sign=>{
      box([x+sign*(w/2+.48),y+.4,z-.85],[.7,.64,.65],"timber");
      cylinder([x+sign*(w/2+.48),y+.88,z-.85],.11,.14,.3,"bronze");
      sphere([x+sign*(w/2+.48),y+1.12,z-.85],[.19,.19,.19],"glow");
    });
  };
  const shelves=(x:number,y:number,z:number,w:number)=>{
    box([x,y+1.48,z],[w,2.96,.14],"timber");
    for(let j=0;j<5;j++) {
      box([x,y+.12+j*.6,z+.17],[w,.055,.42],"timber");
      box([x,y+.09+j*.6,z+.37],[w-.1,.012,.012],"glow");
      for(let i=0;i<9;i++) book(x-w*.42+i*.12,y+.31+j*.6,z+.12,i+j);
      if(j%2===0) cylinder([x+w*.27,y+.29+j*.6,z+.14],.12,.16,.3,"cream");
    }
    [-.5,0,.5].forEach(dx=>box([x+dx*w,y+1.5,z+.15],[.05,3,.4],"timber"));
  };

  // Landscape: mineral forecourt, reflecting pool, individual stepping stones.
  box([0,-.35,0],[160,.3,160],"ground");
  box([0,-.14,1],[19,.22,17],"stone");
  box([9,-.03,1],[3,.14,10],"dark");box([9,.05,1],[2.75,.025,9.75],"water");
  for(let i=0;i<9;i++) box([0,-.01,7+i*.93],[2.7,.16,.69],"stone");
  for(let i=0;i<5;i++) box([0,-.12,6.3+i*.25],[3.4+i*.2,.12,.22],"stone");
  for(let i=0;i<9;i++) {
    const x=i%2===0 ? -10-(i%3)*2.4 : 13+(i%3)*2.8;
    const z=-9+Math.floor(i/2)*6;
    cylinder([x,1.5,z],.1,.21,3.4,"bark");
    for(let j=0;j<7;j++) {
      const a=j*2.4;const end:Tuple3=[x+Math.cos(a)*1.4,3+(j%3)*.8,z+Math.sin(a)*1.4];
      rod([x,1.7,z],end,.06,"bark");
      for(let k=0;k<105;k++) {
        const b=k*2.4+j;
        const radius=Math.sqrt((k%29)/29)*1.0;
        sphere([end[0]+Math.cos(b)*radius,end[1]+Math.sin(k*1.8)*.65,end[2]+Math.sin(b)*radius], [.075,.19,.025],k%3?"leafDark":"leaf",[k*.73,b,k*.31],true);
      }
    }
  }
  [-7.9,7.8].forEach(x=>{
    box([x,.2,7],[1.5,.55,3],"dark");
    for(let i=0;i<5;i++) pot(x,.48,6+i*.55,.8);
    cylinder([x,1.0,8.9],.045,.045,1.5,"dark");sphere([x,1.77,8.9],[.07,.07,.07],"glow");
  });

  for(let floor=0;floor<4;floor++) {
    zone=`level-${floor}`;
    const y=floor*3.5;
    // Floor plate split around the genuine 3.9m x 6m open stairwell.
    if(floor===0)box([0,y-.14,0],[14,.28,11]);
    else {
      box([3,y-.14,0],[8,.28,11]);
      box([-6.05,y-.14,0],[1.9,.28,11]);
      box([-3.1,y-.14,-4.25],[4,.28,2.5]);
      box([-3.1,y-.14,4.25],[4,.28,2.5]);
      box([-3.1,y-.1,2.73],[4,.2,.55]);
    }
    // Solid rear, side piers, slim edges and warm soffits.
    box([0,y+1.6,-5.5],[14,3.2,.22],"plaster");
    [-6.94,6.94].forEach(x=>{
      box([x,y+1.6,-3.8],[.22,3.2,3.4],"stone");
      box([x,y+1.62,5.2],[.26,3.24,.6],"stone");
      box([x,y+1.6,.9],[.035,3.2,6.5],"glass");
      [-1.8,1.7,4.65].forEach(z=>box([x,y+1.6,z],[.07,3.2,.065],"bronze"));
    });
    // Split soffits leave the stairwell open; the upper terrace stays uncovered.
    box([3,y+3.19,floor===3 ? -2.35 : 0],[8,.14,floor===3 ? 6.3 : 11],"timber");
    box([-6.05,y+3.19,0],[1.9,.14,11],"timber");
    box([-3.1,y+3.19,-4.25],[4,.14,2.5],"timber");
    box([-3.1,y+3.19,4.25],[4,.14,2.5],"timber");
    // Front terrace projects from the same structure, with a framed entrance.
    box([0,y-.08,5.8],[14.5,.2,1]);
    box([-5.8,y+1.6,5.5],[2.4,3.2,.24],"stone");
    box([1.75,y+1.6,5.49],[.25,3.2,.22],"stone");
    if(floor<3) {
      // Door opening x[-1.35,1.35]; glass leaves slide away before crossing.
      box([-2.95,y+1.55,5.45],[3.1,3.1,.026],"glass");
      box([4.35,y+1.55,5.45],[5.05,3.1,.026],"glass");
      [-4.5,-1.4,1.4,3.5,5.65].forEach(x=>box([x,y+1.55,5.46],[.045,3.1,.065],"bronze"));
      if(floor>0) {
        box([2,y+.56,6.22],[9.4,1.12,.022],"glass");
        box([2,y+1.13,6.22],[9.4,.035,.04],"bronze");
        [-2.7,2,6.7].forEach(x=>box([x,y+.56,6.22],[.035,1.12,.04],"bronze"));
      }
    }
    // Facade stone joints, vertical oak fins, reflected cove light.
    for(let i=0;i<6;i++) box([-5.8,y+.3+i*.5,5.63],[2.36,.007,.008],"bronze");
    for(let i=0;i<14;i++) box([-4.45+i*.13,y+1.6,5.56],[.035,3.1,.09],"timber");
    box([3,y+3.08,4.7],[7.2,.025,.028],"glow");
    box([6.65,y+3.08,0],[.025,.025,8.9],"glow");
    box([-6.65,y+3.08,0],[.025,.025,8.9],"glow");
    // Limestone tile joints; all four rooms share the same material grammar.
    for(let i=0;i<8;i++) box([3,y+.008,-4.8+i*1.4],[7.8,.004,.008],"cream");
    for(let i=0;i<5;i++) box([-.6+i*1.7,y+.008,0],[.008,.004,10.7],"cream");
    // Stair opening guards are open at both actual landings.
    box([-1.1,y+.53,-.35],[.025,1.06,4.5],"glass");
    box([-1.1,y+1.08,-.35],[.035,.035,4.5],"bronze");
    for(let j=0;j<3;j++) box([-1.1,y+.5,-2.6+j*2.25],[.035,1,.035],"bronze");
    if(floor<3) {
      const n=12, rise=1.75/n, run=4.9/n;
      for(let i=0;i<n;i++) {
        box([-4.22,y+(i+1)*rise-.06,2.45-(i+.5)*run],[1.55,.12,run+.025],"timber");
        box([-2.12,y+1.75+(i+1)*rise-.06,-2.45+(i+.5)*run],[1.55,.12,run+.025],"timber");
        if(i%3===0) {
          rod([-4.98,y+(i+1)*rise,2.45-(i+.5)*run],[-4.98,y+(i+1)*rise+1,2.45-(i+.5)*run],.013);
          rod([-1.36,y+1.75+(i+1)*rise,-2.45+(i+.5)*run],[-1.36,y+2.75+(i+1)*rise,-2.45+(i+.5)*run],.013);
        }
      }
      box([-3.17,y+1.69,-2.85],[3.65,.12,.8],"timber");
      rod([-4.98,y+1.15,2.45],[-4.98,y+2.75,-2.45],.025);
      rod([-1.36,y+2.9,-2.45],[-1.36,y+4.5,2.45],.025);
      rod([-4.22,y+.02,2.45],[-4.22,y+1.7,-2.45],.065,"dark");
      rod([-2.12,y+1.77,-2.45],[-2.12,y+3.45,2.45],.065,"dark");
    }
    pot(6,y,4.7,1.2);
    // A sculptural light floats inside each double-flight stair volume.
    pendant(-3.2,y+2.85,-.2,.35);

    if(floor===0) {
      // Formal living is to the right, dining/kitchen to the rear; no route furniture.
      soft([4.15,y+.025,1.2],[4.4,.035,3.5],"rug",.03);
      sofa(4.1,y,.0,3.5);table(4.1,y,1.55,1.8,.85);
      chair(2.55,y,2.8,pi*.8);chair(5.7,y,2.7,-pi*.8);lamp(6.2,y,.3);
      art(4.0,y+1.95,-1.1,2.7,1.3);
      box([4.1,y+1.55,-1.18],[4.7,3.1,.16],"plaster");
      // Open room divider: low joinery, planted niche, no full wall across sightline.
      box([4.1,y+.45,-1.25],[4.7,.9,.22],"timber");
      box([3.6,y+.82,-3.6],[2.6,.1,1.25],"timber");
      [-.9,.9].forEach(dx=>[-.85,.85].forEach(dz=>chair(3.6+dx,y,-3.6+dz,dz>0?0:pi)));
      [-.85,.85].forEach(dx=>cylinder([3.6+dx,y+.4,-3.6],.08,.1,.8,"dark"));
      [-.8,0,.8].forEach(dx=>cylinder([3.6+dx,y+.89,-3.6],.2,.18,.018,"white"));
      pendant(3.6,y+2.5,-3.6,.62);
      box([3.65,y+.45,-5.03],[5.6,.9,.72],"timber");box([3.65,y+.94,-5.03],[5.7,.08,.8],"stone");
      for(let i=0;i<7;i++) box([1.22+i*.8,y+.48,-4.65],[.012,.8,.012],"bronze");
      box([2.6,y+.99,-5],[.7,.015,.45],"dark");
      rod([5,y+1,-5.15],[5,y+1.3,-5.15],.019);rod([5,y+1.3,-5.15],[5,y+1.3,-4.95],.019);
      box([3.7,y+2.2,-5.28],[5.7,.055,.35],"timber");
      box([3.7,y+2.16,-5.1],[5.5,.015,.02],"glow");
      for(let i=0;i<5;i++) book(2+i*.13,y+2.4,-5.25,i);
      pot(5.8,y+.99,-5,.55);
      box([0,y+2.95,6],[3.6,.17,1.5],"dark");box([0,y+2.85,6.4],[2.9,.025,.03],"glow");
    }
    if(floor===1) {
      soft([4.2,y+.025,.6],[4.3,.04,3.2],"rug",.03);
      sofa(4.2,y,-.45,3.6);table(4.2,y,1.05,1.5,.85);chair(2.7,y,2.2,pi*.8);lamp(6.3,y,-.3);
      shelves(-.05,y,-5.28,1.8);
      box([4.2,y+.45,-1.5],[4.6,.9,.32],"timber");
      pot(2.2,y+.9,-1.5,.55);pot(6.1,y+.9,-1.5,.55);
      art(4.15,y+2.4,-5.34,2.8,.8);
      bed(4.15,y,-3.8,2.25);pendant(4.2,y+2.7,-3.5,.7);
      pot(1.65,y,-4.8,.9);
      art(-.2,y+1.9,-5.34,1.5,1.9);
      chair(4.1,y,5.65,pi);table(5.2,y,5.7,.65,.6);
    }
    if(floor===2) {
      soft([4,y+.025,.5],[4.8,.04,3.8],"rug",.03);
      bed(4.0,y,.15,2.65);pendant(4,y+2.8,1.1,.85);
      lamp(6.3,y,2.5);chair(6.0,y,3.6,-.5);table(5.0,y,3.8,.7,.7);
      // Separate dressing alcove and bathroom, visible beyond the suite.
      box([1.9,y+1.45,-5.29],[2.25,2.9,.16],"timber");
      [-1.1,1.1].forEach(dx=>box([1.9+dx,y+1.45,-5.04],[.06,2.9,.56],"timber"));
      box([1.9,y+2.8,-5.02],[2.25,.06,.56],"timber");
      rod([.85,y+2.5,-5.0],[2.95,y+2.5,-5.0],.018);
      for(let i=0;i<8;i++) {
        const x=1.1+i*.23;
        rod([x,y+2.5,-5],[x,y+2.32,-5],.008);
        soft([x,y+1.88,-5],[.12,.85,.38],i%2?"cream":"olive",.025);
      }
      box([1.9,y+.3,-5],[2.2,.55,.52],"timber");
      box([3.4,y+.5,-4.1],[.16,1,2.5],"stone");
      const tubProfile=[new Vector2(.0,0),new Vector2(.6,0),new Vector2(.77,.18),new Vector2(.81,.48),new Vector2(.78,.62),new Vector2(.7,.62),new Vector2(.64,.23),new Vector2(.28,.14)];
      const tub=new LatheGeometry(tubProfile,36);tub.scale(1.25,1,.75);add(tub,"white",[5.1,y+.1,-3.8]);
      cylinder([5.1,y+.32,-3.8],.6,.6,.012,"water");
      rod([6,y,-3.6],[6,y+.95,-3.6],.03);rod([6,y+.95,-3.6],[5.65,y+.95,-3.6],.03);
      box([5.1,y+.82,-5.1],[2.6,.14,.65],"timber");
      cylinder([4.7,y+.98,-5.08],.22,.16,.18,"white");
      box([5.1,y+1.95,-5.34],[2.6,1.3,.03],"mirror");
      art(4,y+2.15,-1.5,2.8,1.2);
      box([4,y+1.55,-1.58],[3,3.1,.16],"plaster");
    }
    if(floor===3) {
      // Habitable third floor + terrace on its front half. No fifth floor.
      shelves(4.3,y,-5.28,4.7);
      box([3.5,y+.77,-3.35],[2.8,.09,1.1],"timber");
      [-1,1].forEach(sign=>box([3.5+sign*1.1,y+.38,-3.35],[.07,.74,.8],"bronze"));
      chair(3.5,y,-4.15,pi);box([3.5,y+.85,-3.35],[.52,.035,.37],"dark");
      box([3.5,y+1.07,-3.57],[.52,.38,.025],"dark",[-.15,0,0]);
      lamp(5.7,y,-3.4);pendant(3.5,y+2.65,-3.2,.65);
      // Setback glazed wall and open sliding passage to sky lounge.
      box([4.8,y+1.56,.8],[4.1,3.1,.025],"glass");
      [2.75,6.85].forEach(x=>box([x,y+1.56,.8],[.06,3.1,.06],"bronze"));
      soft([4.3,y+.025,3.3],[4.3,.04,3.3],"rug",.03);
      sofa(4.3,y,2.05,3.5);table(4.3,y,3.45,1.8,.9);chair(2.6,y,4.7,pi*.8);
      for(let i=0;i<13;i++) box([1.6+i*.42,y+3.35,3.4],[.1,.16,4.7],"timber");
      [1.5,6.8].forEach(x=>box([x,y+1.64,5.6],[.085,3.28,.085],"bronze"));
      box([0,y+.56,6.22],[13.5,1.12,.022],"glass");box([0,y+1.13,6.22],[13.5,.035,.04],"bronze");
      box([-4.2,y+.28,4.6],[4.4,.55,1.15],"stone");
      for(let i=0;i<6;i++) pot(-6+i*.7,y+.55,4.6,.85);
      pot(6,y,1.3,1.2);
    }
  }
  zone="crown";
  // Flat roof ends the third storey; skylight over the connecting stair.
  box([3,13.95,-2.45],[8.3,.25,6.5],"stone");
  box([-6.05,13.95,-2.45],[2.1,.25,6.5],"stone");
  box([-3.1,13.95,-4.5],[4,.25,2.4],"stone");
  box([-3.1,14.09,-.1],[4,.06,6.2],"glass");
  for(let i=0;i<6;i++) box([-4.9+i*.68,14.14,-.4],[.035,.06,4.7],"bronze");
  box([-5.8,13.96,3],[2.4,.28,5.4],"stone");

  for(const [key,geometries] of batches) {
    const name=key.split(":")[1];
    const merged=mergeGeometries(geometries,false)!;
    const mesh=new Mesh(merged,m[name]); mesh.name=key;
    mesh.castShadow=!["glass","glow","ground","water","art"].includes(name);
    mesh.receiveShadow=!["glass","glow"].includes(name);
    root.add(mesh);geometries.forEach(g=>g.dispose());
  }
  return { root, dispose:()=>root.traverse(node=>{if(node instanceof Mesh) node.geometry.dispose();}) };
}
