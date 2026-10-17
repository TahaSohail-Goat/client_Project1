/** Compact only the used geometry, keeping the authored UVs, baked AO and PBR materials.
 * Uses the explicitly declared meshoptimizer development dependency.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MeshoptSimplifier } from "meshoptimizer";

await MeshoptSimplifier.ready;
MeshoptSimplifier.useExperimentalFeatures=true;
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
const cache=path.join(root,"output/residence-source-assets");
const dest=path.join(root,"public/media/residence-realism");
const components={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT4:16};
const types={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array};
for(const name of ["mid_century_lounge_chair","potted_plant_01","potted_plant_04","island_tree_02","dining_chair_02","sofa"]) {
  const folder=path.join(cache,name);
  const data=JSON.parse(fs.readFileSync(path.join(folder,"source.gltf"),"utf8"));
  const buffers=data.buffers.map(b=>fs.readFileSync(path.join(folder,b.uri)));
  const read=index=>{
    const a=data.accessors[index],v=data.bufferViews[a.bufferView],C=types[a.componentType];
    const count=components[a.type],size=C.BYTES_PER_ELEMENT,stride=v.byteStride||count*size;
    const out=new C(a.count*count),b=buffers[v.buffer],offset=(v.byteOffset||0)+(a.byteOffset||0);
    if(stride===count*size&&(b.byteOffset+offset)%size===0)return new C(b.buffer,b.byteOffset+offset,a.count*count).slice();
    for(let i=0;i<a.count;i++)for(let j=0;j<count;j++){
      const temp=b.subarray(offset+i*stride+j*size,offset+i*stride+(j+1)*size);
      const aligned=new Uint8Array(size);aligned.set(temp);out[i*count+j]=new C(aligned.buffer)[0];
    }
    return out;
  };
  const views=[],accessors=[],chunks=[];
  let byteLength=0,triangles=0;
  const append=(array,type,componentType,normalized=false)=>{
    const padded=(byteLength+3)&~3;
    if(padded>byteLength)chunks.push(Buffer.alloc(padded-byteLength));
    const view=views.length;views.push({buffer:0,byteOffset:padded,byteLength:array.byteLength});
    chunks.push(Buffer.from(array.buffer,array.byteOffset,array.byteLength));byteLength=padded+array.byteLength;
    const count=array.length/components[type],index=accessors.length;
    const a={bufferView:view,componentType,count,type};
    if(normalized)a.normalized=true;
    if(type==="VEC3"&&componentType===5126){
      a.min=[Infinity,Infinity,Infinity];a.max=[-Infinity,-Infinity,-Infinity];
      for(let i=0;i<count;i++)for(let axis=0;axis<3;axis++){
        a.min[axis]=Math.min(a.min[axis],array[i*3+axis]);a.max[axis]=Math.max(a.max[axis],array[i*3+axis]);
      }
    }
    accessors.push(a);return index;
  };
  for(const mesh of data.meshes)for(const primitive of mesh.primitives) {
    let indices=new Uint32Array(read(primitive.indices));
    const positions=read(primitive.attributes.POSITION);
    const matName=data.materials?.[primitive.material]?.name||"";
    let target=indices.length;
    if(name==="island_tree_02")target=Math.min(indices.length,/leaf|leav/i.test(matName)?65000*3:/branch/i.test(matName)?6500*3:7000*3);
    if(name==="potted_plant_01")target=Math.min(indices.length,/leaf|leav/i.test(matName)?4000*3:600*3);
    if(target<indices.length){
      const error=name==="potted_plant_01"&&!/leaf|leav/i.test(matName)?.045:.012;
      [indices]=MeshoptSimplifier.simplify(indices,positions,3,target,error,["Prune"]);
    }
    if(name==="island_tree_02"&&/leaf|leav/i.test(matName)) {
      // At garden-view distances, fewer, larger leaf cards preserve canopy
      // coverage more effectively than thinning every leaf to a tiny triangle.
      const parent=new Uint32Array(positions.length/3);parent.forEach((_,i)=>parent[i]=i);
      const find=i=>{while(parent[i]!==i){parent[i]=parent[parent[i]];i=parent[i];}return i;};
      for(let i=0;i<indices.length;i+=3){const a=find(indices[i]);parent[find(indices[i+1])]=a;parent[find(indices[i+2])]=a;}
      const centers=new Map();
      for(const index of new Set(indices)){
        const group=find(index);if(!centers.has(group))centers.set(group,[0,0,0,0]);
        const c=centers.get(group);for(let axis=0;axis<3;axis++)c[axis]+=positions[index*3+axis];c[3]++;
      }
      for(const index of new Set(indices)){
        const c=centers.get(find(index));for(let axis=0;axis<3;axis++){
          const center=c[axis]/c[3];positions[index*3+axis]=center+(positions[index*3+axis]-center)*2.4;
        }
      }
    }
    // Remap source vertices to a dense local array; source masters never ship.
    const mapping=new Map(),old=[];
    const dense=new Uint32Array(indices.length);
    indices.forEach((index,i)=>{if(!mapping.has(index)){mapping.set(index,old.length);old.push(index);}dense[i]=mapping.get(index);});
    triangles+=dense.length/3;
    const attributes={};
    for(const [key,index] of Object.entries(primitive.attributes)) {
      const a=data.accessors[index],source=key==="POSITION"?positions:read(index),C=types[a.componentType],n=components[a.type];
      const output=new C(old.length*n);
      old.forEach((v,i)=>output.set(source.subarray(v*n,v*n+n),i*n));
      attributes[key]=append(output,a.type,a.componentType,a.normalized);
    }
    primitive.attributes=attributes;
    primitive.indices=append(dense,"SCALAR",5125);
    delete primitive.extensions;
  }
  data.bufferViews=views;data.accessors=accessors;data.buffers=[{uri:"scene.bin",byteLength}];
  data.asset.extras={source:name,localChanges:"Web geometry budget, compacted buffers and optimized textures; see ../ATTRIBUTION.txt"};
  const out=path.join(dest,name);fs.mkdirSync(out,{recursive:true});
  fs.writeFileSync(path.join(out,"scene.bin"),Buffer.concat(chunks));
  fs.writeFileSync(path.join(out,"scene.gltf"),JSON.stringify(data));
  console.log(name,Math.round(triangles),"triangles;",Math.round(byteLength/1024),"KiB geometry");
}
