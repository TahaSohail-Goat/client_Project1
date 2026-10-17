import { useEffect, useRef, type RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { SSAOPass } from "three/addons/postprocessing/SSAOPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { HalfFloatType, Line, Mesh, MeshStandardMaterial, Object3D, Points, WebGLRenderTarget } from "three";

/** Three 0.180's normal override otherwise makes clear glass an opaque AO occluder. */
class ArchitecturalAO extends SSAOPass {
  private hidden:Object3D[]=[];
  _overrideVisibility() {
    this.scene.traverse(object=>{
      let ignore=object instanceof Points||object instanceof Line;
      if(object instanceof Mesh) {
        const materials=Array.isArray(object.material)?object.material:[object.material];
        ignore=materials.some(m=>m.transparent||m.alphaTest>0||
          (m instanceof MeshStandardMaterial&&m.emissiveIntensity>0&&m.emissive.getHex()>0));
      }
      if(ignore&&object.visible){object.visible=false;this.hidden.push(object);}
    });
  }
  _restoreVisibility(){this.hidden.forEach(object=>{object.visible=true;});this.hidden.length=0;}
}

/** Contact shading, filmic output and antialiasing, only when a frame is requested. */
export function ResidenceFinish({prepared,onFailure}:{prepared:RefObject<boolean>;onFailure:()=>void}) {
  const {gl,scene,camera,size,invalidate}=useThree();
  const finish=useRef<EffectComposer | null>(null);
  useEffect(()=>{
    let active=true;prepared.current=false;
    const compile=()=>gl.compileAsync(scene,camera).then(()=>{
      if(active){prepared.current=true;invalidate();}
    }).catch(()=>{if(active)onFailure();});
    if(size.width<768){
      void compile();
      return ()=>{active=false;prepared.current=false;};
    }
    const target=new WebGLRenderTarget(size.width,size.height,{type:HalfFloatType,samples:4});
    const composer=new EffectComposer(gl,target);
    // A fixed pixel budget prevents high-DPI screens allocating huge AO targets.
    composer.setPixelRatio(Math.min(gl.getPixelRatio(),1.25));
    composer.setSize(size.width,size.height);
    const render=new RenderPass(scene,camera);
    const ao=new ArchitecturalAO(scene,camera,size.width,size.height,16);
    ao.kernelRadius=.58;ao.minDistance=.00015;ao.maxDistance=.008;
    const output=new OutputPass();
    composer.addPass(render);composer.addPass(ao);composer.addPass(output);
    finish.current=composer;gl.shadowMap.needsUpdate=true;
    // Compile all rooms before the first camera move. Match the composer's
    // linear target so first-time interior materials do not stall on scroll.
    const previous=gl.getRenderTarget();gl.setRenderTarget(target);
    void compile();gl.setRenderTarget(previous);
    return ()=>{active=false;prepared.current=false;finish.current=null;ao.dispose();output.dispose();composer.dispose();};
  },[gl,scene,camera,size.width,size.height,invalidate,prepared,onFailure]);
  useFrame(()=>{
    if(!prepared.current)return;
    gl.info.autoReset=false;gl.info.reset();
    if(finish.current)finish.current.render();
    else gl.render(scene,camera);
    gl.domElement.dataset.calls=String(gl.info.render.calls);
    gl.domElement.dataset.triangles=String(gl.info.render.triangles);
  },1);
  return null;
}
