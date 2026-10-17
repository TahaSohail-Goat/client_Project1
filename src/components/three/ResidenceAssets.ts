import { useMemo } from "react";
import { useGLTF } from "@react-three/drei/core/Gltf";
import { Box3, Color, Group, Light, Material, Mesh, MeshPhysicalMaterial, MeshStandardMaterial, Vector3 } from "three";

export type ResidenceAsset = { object: Group; size: Vector3 };
export type ResidenceLibrary = Record<"sofa"|"chair"|"plant"|"accent"|"tree"|"dining",ResidenceAsset>;
const keys=["sofa","chair","plant","accent","tree","dining"] as const;
const models=["sofa","mid_century_lounge_chair","potted_plant_01","potted_plant_04","island_tree_02","dining_chair_02"];
const urls=models.map(name=>`/media/residence-realism/${name}/scene.gltf`);

/** Authored geometry and baked material occlusion, reused across the same house. */
export function useResidenceAssets() {
  const loaded=useGLTF(urls);
  return useMemo(()=>{
    const owned=new Set<Material>();
    const library={} as ResidenceLibrary;
    loaded.forEach((gltf,index)=>{
      const object=new Group();const asset=gltf.scene.clone(true);object.add(asset);
      const lights:Light[]=[];
      const clones=new Map<Material,Material>();
      asset.traverse(node=>{
        if(node instanceof Light)lights.push(node);
        if(!(node instanceof Mesh))return;
        const prepare=(source:Material)=>{
          if(clones.has(source))return clones.get(source)!;
          const material=source.clone();clones.set(source,material);owned.add(material);
          if(material instanceof MeshStandardMaterial) {
            material.envMapIntensity=.65;
            // Authored foliage uses opacity maps. Cutouts write depth and retain
            // leaf silhouettes when many copies share one static batch.
            if(material.transparent&&/leav|leaf/i.test(material.name)) {
              material.transparent=false;material.alphaTest=.35;material.depthWrite=true;
            }
            if(index===0&&material.name.includes("fabric")) {
              material.color.set("#aa9b80");material.roughness=.88;
              if(material instanceof MeshPhysicalMaterial) {
                material.sheen=.7;material.sheenColor=new Color("#d4c6ae");
                material.sheenRoughness=.85;material.specularIntensity=.25;
              }
            }
          }
          return material;
        };
        node.material=Array.isArray(node.material)?node.material.map(prepare):prepare(node.material);
      });
      lights.forEach(light=>light.removeFromParent());
      object.updateMatrixWorld(true);
      const bounds=new Box3().setFromObject(object),size=bounds.getSize(new Vector3()),center=bounds.getCenter(new Vector3());
      asset.position.sub(new Vector3(center.x,bounds.min.y,center.z));
      object.updateMatrixWorld(true);
      library[keys[index]]={object,size};
    });
    return {library,dispose:()=>owned.forEach(material=>material.dispose())};
  },[loaded]);
}
