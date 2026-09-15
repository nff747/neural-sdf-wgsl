/**
 * WGSL Signed Distance Field (SDF) Primitives Library.
 * Implements exact Euclidean and analytical distance bounds for 3D shapes.
 */

export const sdfPrimitivesShader = /* wgsl */ `
// Sphere centered at origin with radius r
fn sdSphere(p: vec3<f32>, r: f32) -> f32 {
  return length(p) - r;
}

// Axis-aligned Box with half-extents b
fn sdBox(p: vec3<f32>, b: vec3<f32>) -> f32 {
  let q = abs(p) - b;
  return length(max(q, vec3<f32>(0.0))) + min(max(q.x, max(q.y, q.z)), 0.0);
}

// Rounded Box with half-extents b and corner radius r
fn sdRoundBox(p: vec3<f32>, b: vec3<f32>, r: f32) -> f32 {
  let q = abs(p) - b + vec3<f32>(r);
  return length(max(q, vec3<f32>(0.0))) + min(max(q.x, max(q.y, q.z)), 0.0) - r;
}

// Torus centered at origin with major radius t.x and minor ring radius t.y
fn sdTorus(p: vec3<f32>, t: vec2<f32>) -> f32 {
  let q = vec2<f32>(length(p.xz) - t.x, p.y);
  return length(q) - t.y;
}

// Vertical Cylinder along Y axis with height h and radius r
fn sdCylinder(p: vec3<f32>, h: f32, r: f32) -> f32 {
  let d = abs(vec2<f32>(length(p.xz), p.y)) - vec2<f32>(r, h * 0.5);
  return min(max(d.x, d.y), 0.0) + length(max(d, vec2<f32>(0.0)));
}

// Capsule between points a and b with radius r
fn sdCapsule(p: vec3<f32>, a: vec3<f32>, b: vec3<f32>, r: f32) -> f32 {
  let pa = p - a;
  let ba = b - a;
  let h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h) - r;
}

// Triply Periodic Minimal Surface (TPMS) Gyroid Lattice
fn sdGyroid(p: vec3<f32>, scale: f32, thickness: f32, bias: f32) -> f32 {
  let sp = p * scale;
  let g = abs(dot(sin(sp), cos(sp.zxy)) - bias) - thickness;
  return g / scale;
}

// Mandelbulb 3D Fractal Distance Estimator (Power 8)
fn sdMandelbulb(p: vec3<f32>, power: f32, maxIter: u32) -> f32 {
  var w = p;
  var m = dot(w, w);
  var dz = 1.0;

  for (var i = 0u; i < maxIter; i = i + 1u) {
    let m2 = m * m;
    let m4 = m2 * m2;
    dz = power * sqrt(m4 * m2 * m) * dz + 1.0;

    let r = length(w);
    let b = power * acos(clamp(w.y / r, -1.0, 1.0));
    let a = power * atan2(w.x, w.z);

    w = p + pow(r, power) * vec3<f32>(sin(b) * sin(a), cos(b), sin(b) * cos(a));
    m = dot(w, w);
    if (m > 4.0) {
      break;
    }
  }

  return 0.25 * log(m) * sqrt(m) / dz;
}
`;
