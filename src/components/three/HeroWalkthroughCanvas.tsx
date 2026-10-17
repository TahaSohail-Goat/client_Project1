import { useEffect, useMemo, useRef, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment } from "@react-three/drei/core/Environment";
import { useTexture } from "@react-three/drei/core/Texture";
import { AgXToneMapping, Group, MathUtils, MeshStandardMaterial, PCFSoftShadowMap, PerspectiveCamera, Vector3 } from "three";
import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js";
import { cameraBeats, sampleCamera, chapterAt, residenceChapters, residenceCallouts, type Tuple3 } from "../../content/heroWalkthrough";
import { buildResidence } from "./ResidenceModel";
import { residenceMaterials, residenceTextureUrls } from "./ResidenceMaterials";
import { useResidenceAssets } from "./ResidenceAssets";
import { ResidenceFinish } from "./ResidenceFinish";

type Props = {
  progress: RefObject<number>;
  redraw: RefObject<(() => void) | null>;
  overlay: RefObject<HTMLDivElement | null>;
  onReady: () => void;
  onFailure: () => void;
};
const smooth = (p: number) => { const x=MathUtils.clamp(p,0,1);return x*x*(3-2*x); };
RectAreaLightUniformsLib.init();
function Walkthrough({progress,redraw,overlay,onReady,onFailure}:Props) {
  const { camera,gl,invalidate,size }=useThree();
  const sliding=useRef<Group>(null);
  const lastChapter=useRef(-1);
  const ready=useRef(false), readyFrame=useRef(0);
  const prepared=useRef(false);
  const point=useMemo(()=>new Vector3(),[]);
  const assets=useResidenceAssets();
  const maps=useTexture(residenceTextureUrls);
  const surfaces=useMemo(()=>residenceMaterials(maps,Math.min(8,gl.capabilities.getMaxAnisotropy())),[maps,gl]);
  const residence=useMemo(()=>buildResidence(surfaces.materials,assets.library),[surfaces,assets]);
  useEffect(()=>()=>{residence.dispose();surfaces.dispose();assets.dispose();},[residence,surfaces,assets]);
  useEffect(()=>{
    redraw.current=invalidate;
    gl.shadowMap.autoUpdate=false;gl.shadowMap.needsUpdate=true;
    const lost=(event:Event)=>{event.preventDefault();onFailure();};
    gl.domElement.addEventListener("webglcontextlost",lost);invalidate();
    return ()=>{redraw.current=null;cancelAnimationFrame(readyFrame.current);ready.current=false;gl.domElement.removeEventListener("webglcontextlost",lost);};
  },[redraw,invalidate,gl,onFailure]);
  useEffect(()=>{gl.shadowMap.needsUpdate=true;invalidate();},[size.width,size.height,gl,invalidate]);
  useFrame(()=>{
    const p=progress.current,pose=sampleCamera(p);
    const mobile=size.width<768;
    // Move the EXTERIOR camera back in portrait; retain eye-height interior routing.
    const exterior = 1-smooth(p/.17) + smooth((p-.85)/.12);
    const widen=mobile ? .3*exterior : 0;
    if(mobile)pose.target[1]-=2.3*exterior;
    pose.position=pose.position.map((v,i)=>pose.target[i]+(v-pose.target[i])*(1+widen)) as Tuple3;
    const c=camera as PerspectiveCamera;
    c.position.fromArray(pose.position);c.lookAt(...pose.target);
    c.fov=pose.fov+(mobile?14-4*exterior:0);c.updateProjectionMatrix();c.updateMatrixWorld();
    if(sliding.current) sliding.current.position.x=-2.9*smooth((p-.145)/.052);
    const data=gl.domElement.dataset;
    data.camera=c.position.toArray().map(v=>v.toFixed(3)).join(",");
    data.progress=p.toFixed(4);
    const hud=overlay.current;
    if(hud) {
      const chapter=chapterAt(p), index=residenceChapters.indexOf(chapter);
      const changed=lastChapter.current!==index;
      if(changed) {
        lastChapter.current=index;
        hud.querySelector("[data-residence-title]")!.textContent=chapter.title;
        hud.querySelector("[data-residence-subtitle]")!.textContent=chapter.subtitle;
        hud.querySelectorAll<HTMLElement>("[data-residence-title], [data-residence-subtitle]").forEach(el=>{
          el.getAnimations().forEach(animation=>animation.cancel());
          el.animate([{opacity:0,transform:"translateY(7px)"},{opacity:1,transform:"translateY(0)"}],{duration:320,easing:"cubic-bezier(.2,.65,.3,1)"});
        });
        hud.querySelector("[data-residence-index]")!.textContent=`0${index+1} — 08`;
        hud.querySelector("[data-residence-level]")!.textContent=chapter.level<0?"EXTERIOR":`LEVEL 0${chapter.level}`;
        hud.dataset.level=String(chapter.level);hud.dataset.chapter=String(index);
        hud.querySelectorAll<HTMLElement>("[data-level]").forEach(el=>{el.dataset.active=String(Number(el.dataset.level)===chapter.level);});
      }
      (hud.querySelector("[data-residence-progress]") as HTMLElement).style.transform=`scaleX(${p})`;
      residenceCallouts.forEach((callout,i)=>{
        const el=hud.querySelector(`[data-callout="${i}"]`)!;
        point.fromArray(callout.anchor).project(c);
        const x=(point.x*.5+.5)*size.width,y=(-point.y*.5+.5)*size.height;
        const visible=p>callout.from&&p<callout.to&&Math.abs(point.x)<.97&&Math.abs(point.y)<.82&&point.z<1;
        const alpha=visible?Math.min(smooth((p-callout.from)/.008),smooth((callout.to-p)/.008)):0;
        el.setAttribute("opacity",String(alpha));
        if(!visible)return;
        const right=x<size.width*.58;
        const tx=MathUtils.clamp(x+(right?45:-45),24,size.width-(mobile?170:205));
        const ty=MathUtils.clamp(y-38,140,size.height-215);
        const circle=el.querySelector("circle")!,path=el.querySelector("path")!,text=el.querySelector("text")!;
        circle.setAttribute("cx",String(x));circle.setAttribute("cy",String(y));
        path.setAttribute("d",`M${x} ${y} L${tx-10} ${ty+8} H${tx+(mobile?145:175)}`);
        text.setAttribute("x",String(tx));text.setAttribute("y",String(ty));
      });
    }
    if(prepared.current&&!ready.current){gl.shadowMap.needsUpdate=true;ready.current=true;readyFrame.current=requestAnimationFrame(onReady);}
  });
  const m=surfaces.materials;
  return <>
    <color attach="background" args={["#bfc6bf"]}/>
    <fog attach="fog" args={["#8a9488",180,800]}/>
    <Environment files="/media/residence-realism/garden-sky.hdr" background backgroundBlurriness={0} backgroundIntensity={1.2} environmentIntensity={.55}/>
    <hemisphereLight args={["#dbe4ec","#74674f",.4]}/>
    <directionalLight position={[-18,26,18]} color="#ffe5c4" intensity={2.5} castShadow
      shadow-mapSize={[size.width<768?1024:2048,size.width<768?1024:2048]}
      shadow-camera-left={-22} shadow-camera-right={22} shadow-camera-top={22} shadow-camera-bottom={-14}
      shadow-camera-near={1} shadow-camera-far={75} shadow-normalBias={.035} shadow-bias={-.0002}
      target-position={[0,5,0]}/>
    {/* A single broad window-side fill approximates bounced daylight across
        the four levels without compiling eight lights into every material. */}
    <rectAreaLight position={[9,7,0]} rotation={[0,Math.PI/2,0]} width={10} height={15} intensity={3.2} color="#ffead2"/>
    <primitive object={residence.root}/>
    <ResidenceFinish prepared={prepared} onFailure={onFailure}/>
    <group ref={sliding}>
      <mesh position={[0,1.55,5.45]} material={m.glass}><boxGeometry args={[2.75,3.1,.025]}/></mesh>
      {[-1.37,1.37].map(x=><mesh key={x} position={[x,1.55,5.46]} material={m.bronze}><boxGeometry args={[.045,3.1,.065]}/></mesh>)}
      <mesh position={[1.15,1.2,5.5]} material={m.bronze}><boxGeometry args={[.025,.65,.08]}/></mesh>
    </group>
    {/* Upper terrace door leaves are set open; all floor paths use real openings. */}
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.51,0]} receiveShadow material={m.ground as MeshStandardMaterial}>
      <planeGeometry args={[2000,2000]} onUpdate={geometry=>{
        const uv=geometry.getAttribute("uv"),position=geometry.getAttribute("position");
        for(let i=0;i<uv.count;i++)uv.setXY(i,position.getX(i),position.getY(i));
        uv.needsUpdate=true;
      }}/>
    </mesh>
  </>;
}
export default function HeroWalkthroughCanvas(props:Props) {
  return <Canvas camera={{position:cameraBeats[0].position,fov:43,near:.06,far:1000}}
    frameloop="demand" shadows dpr={[1,1.5]} gl={{antialias:true,alpha:false,powerPreference:"high-performance"}}
    onCreated={({gl})=>{gl.toneMapping=AgXToneMapping;gl.toneMappingExposure=1.05;gl.shadowMap.type=PCFSoftShadowMap;}}>
    <Walkthrough {...props}/>
  </Canvas>;
}
