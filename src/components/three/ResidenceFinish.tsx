import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { SSAOPass } from "three/addons/postprocessing/SSAOPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { HalfFloatType, WebGLRenderTarget } from "three";

/** Contact shading, filmic output and antialiasing, only when a frame is requested. */
export function ResidenceFinish() {
  const {gl,scene,camera,size,invalidate}=useThree();
  const finish=useRef<EffectComposer | null>(null);
  useEffect(()=>{
    if(size.width<768)return;
    const target=new WebGLRenderTarget(size.width,size.height,{type:HalfFloatType,samples:4});
    const composer=new EffectComposer(gl,target);
    // A fixed pixel budget prevents high-DPI screens allocating huge AO targets.
    composer.setPixelRatio(Math.min(gl.getPixelRatio(),1.25));
    composer.setSize(size.width,size.height);
    const render=new RenderPass(scene,camera);
    const ao=new SSAOPass(scene,camera,size.width,size.height,12);
    ao.kernelRadius=.3;ao.minDistance=.0003;ao.maxDistance=.006;
    const output=new OutputPass();
    composer.addPass(render);composer.addPass(ao);composer.addPass(output);
    finish.current=composer;gl.shadowMap.needsUpdate=true;invalidate();
    return ()=>{finish.current=null;ao.dispose();output.dispose();composer.dispose();};
  },[gl,scene,camera,size.width,size.height,invalidate]);
  useFrame(()=>{
    gl.info.autoReset=false;gl.info.reset();
    if(finish.current)finish.current.render();
    else gl.render(scene,camera);
    gl.domElement.dataset.calls=String(gl.info.render.calls);
    gl.domElement.dataset.triangles=String(gl.info.render.triangles);
  },1);
  return null;
}
