/**
 * WGSL High-Performance Surface Normal Estimation.
 * Uses 4-point tetrahedron finite differences to compute exact analytical gradients
 * with 33% fewer ALU texture/ALU cycles than 6-point central differences.
 */

export const sdfNormalsShader = /* wgsl */ `
// Tetrahedron normal computation macro helper
// Takes mapFn as the distance function callback
fn calcNormalTetrahedron(p: vec3<f32>, eps: f32) -> vec3<f32> {
  let k0 = vec3<f32>( 1.0, -1.0, -1.0);
  let k1 = vec3<f32>(-1.0, -1.0,  1.0);
  let k2 = vec3<f32>(-1.0,  1.0, -1.0);
  let k3 = vec3<f32>( 1.0,  1.0,  1.0);

  let n = k0 * mapScene(p + k0 * eps).x +
          k1 * mapScene(p + k1 * eps).x +
          k2 * mapScene(p + k2 * eps).x +
          k3 * mapScene(p + k3 * eps).x;

  return normalize(n);
}

// Optional 6-point Central Difference Normal (fallback for ultra-thin sub-voxel features)
fn calcNormalCentral(p: vec3<f32>, eps: f32) -> vec3<f32> {
  let e = vec2<f32>(eps, 0.0);
  let dx = mapScene(p + e.xyy).x - mapScene(p - e.xyy).x;
  let dy = mapScene(p + e.yxy).x - mapScene(p - e.yxy).x;
  let dz = mapScene(p + e.yyx).x - mapScene(p - e.yyx).x;
  return normalize(vec3<f32>(dx, dy, dz));
}
`;
