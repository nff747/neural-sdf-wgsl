/**
 * WGSL Signed Distance Field (SDF) CSG & Deformation Operators.
 * Implements smooth polynomial Booleans and spatial non-linear warps.
 */

export const sdfOperatorsShader = /* wgsl */ `
// Boolean Union
fn opUnion(d1: f32, d2: f32) -> f32 {
  return min(d1, d2);
}

// Boolean Intersection
fn opIntersection(d1: f32, d2: f32) -> f32 {
  return max(d1, d2);
}

// Boolean Subtraction (d2 minus d1)
fn opSubtraction(d1: f32, d2: f32) -> f32 {
  return max(-d1, d2);
}

// Polynomial Smooth Minimum (Smooth Union) with blend radius k
fn opSmoothUnion(d1: f32, d2: f32, k: f32) -> f32 {
  let h = clamp(0.5 + 0.5 * (d2 - d1) / k, 0.0, 1.0);
  return mix(d2, d1, h) - k * h * (1.0 - h);
}

// Polynomial Smooth Intersection with blend radius k
fn opSmoothIntersection(d1: f32, d2: f32, k: f32) -> f32 {
  let h = clamp(0.5 - 0.5 * (d2 - d1) / k, 0.0, 1.0);
  return mix(d2, d1, h) + k * h * (1.0 - h);
}

// Polynomial Smooth Subtraction (d2 minus d1) with blend radius k
fn opSmoothSubtraction(d1: f32, d2: f32, k: f32) -> f32 {
  let h = clamp(0.5 - 0.5 * (d2 + d1) / k, 0.0, 1.0);
  return mix(d2, -d1, h) + k * h * (1.0 - h);
}

// Spatial Twist along the Y axis with rate k (rad/m)
fn opTwist(p: vec3<f32>, k: f32) -> vec3<f32> {
  let c = cos(k * p.y);
  let s = sin(k * p.y);
  let m = mat2x2<f32>(c, -s, s, c);
  return vec3<f32>(m * p.xz, p.y).xzy;
}

// Spatial Cheap Bend along X axis
fn opBend(p: vec3<f32>, k: f32) -> vec3<f32> {
  let c = cos(k * p.x);
  let s = sin(k * p.x);
  let m = mat2x2<f32>(c, -s, s, c);
  return vec3<f32>(m * p.xy, p.z);
}

// Infinite Domain Repetition with spacing period c
fn opRepetition(p: vec3<f32>, c: vec3<f32>) -> vec3<f32> {
  return (p + 0.5 * c) % c - 0.5 * c;
}

// Elongation: stretch primitive along axes by extent h
fn opElongate(p: vec3<f32>, h: vec3<f32>) -> vec3<f32> {
  return p - clamp(p, -h, h);
}
`;
