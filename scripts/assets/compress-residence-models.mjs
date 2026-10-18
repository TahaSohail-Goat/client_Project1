import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MeshoptEncoder, MeshoptDecoder } from "meshoptimizer";

// Lossless delivery compression. Check every decoded view before replacing files.
await Promise.all([MeshoptEncoder.ready, MeshoptDecoder.ready]);
const root = fileURLToPath(new URL("../../public/media/residence-realism/", import.meta.url));
const components = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 };
const bytes = { 5121: 1, 5123: 2, 5125: 4, 5126: 4 };
for (const entry of await fs.readdir(root, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const folder = path.join(root, entry.name);
  const filename = path.join(folder, "scene.gltf");
  const model = JSON.parse(await fs.readFile(filename, "utf8"));
  if (model.extensionsRequired?.includes("EXT_meshopt_compression")) continue;
  if (model.buffers.length !== 1) throw new Error(`Unexpected buffers: ${entry.name}`);
  const source = await fs.readFile(path.join(folder, model.buffers[0].uri));
  const chunks = [];
  let offset = 0;
  for (const [index, view] of model.bufferViews.entries()) {
    const accessors = model.accessors.filter(a => a.bufferView === index);
    if (accessors.length !== 1 || accessors[0].byteOffset || view.byteStride)
      throw new Error(`Expected packed accessor: ${entry.name}/${index}`);
    const accessor = accessors[0];
    const stride = components[accessor.type] * bytes[accessor.componentType];
    const mode = accessor.type === "SCALAR" ? "INDICES" : "ATTRIBUTES";
    const raw = source.subarray(view.byteOffset ?? 0, (view.byteOffset ?? 0) + view.byteLength);
    if (raw.length !== accessor.count * stride) throw new Error("Invalid view length");
    const compressed = MeshoptEncoder.encodeGltfBuffer(raw, accessor.count, stride, mode);
    const decoded = new Uint8Array(raw.length);
    MeshoptDecoder.decodeGltfBuffer(decoded, accessor.count, stride, compressed, mode);
    if (!Buffer.from(decoded).equals(raw)) throw new Error("Lossless round-trip failed");
    view.buffer = 1;
    view.extensions = { ...view.extensions, EXT_meshopt_compression: {
      buffer: 0, byteOffset: offset, byteLength: compressed.length,
      byteStride: stride, count: accessor.count, mode,
    } };
    chunks.push(compressed);
    offset += compressed.length;
  }
  model.buffers = [
    { uri: "scene.bin", byteLength: offset },
    { byteLength: source.length, extensions: { EXT_meshopt_compression: { fallback: true } } },
  ];
  model.extensionsUsed = [...new Set([...(model.extensionsUsed ?? []), "EXT_meshopt_compression"])];
  model.extensionsRequired = [...new Set([...(model.extensionsRequired ?? []), "EXT_meshopt_compression"])];
  // Preserve an ignored local source copy for future asset preparation.
  const archive = fileURLToPath(new URL(`../../.local/uncompressed-models/${entry.name}/`, import.meta.url));
  await fs.mkdir(archive, { recursive: true });
  await fs.copyFile(filename, path.join(archive, "scene.gltf"));
  await fs.writeFile(path.join(archive, "scene.bin"), source);
  await fs.writeFile(path.join(folder, "scene.bin"), Buffer.concat(chunks));
  await fs.writeFile(filename, JSON.stringify(model) + "\n");
  console.log(`${entry.name}: ${source.length} -> ${offset} bytes (${Math.round((1 - offset / source.length) * 100)}% smaller)`);
}
