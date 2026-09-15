/**
 * Zero-allocation mathematical utilities for SDF distance evaluation,
 * smooth polynomial blends, and numerical gradients.
 */

export class SDFMath {
  public static sdSphere(
    px: number, py: number, pz: number,
    cx: number, cy: number, cz: number,
    r: number
  ): number {
    const dx = px - cx;
    const dy = py - cy;
    const dz = pz - cz;
    return Math.hypot(dx, dy, dz) - r;
  }

  public static sdBox(
    px: number, py: number, pz: number,
    bx: number, by: number, bz: number
  ): number {
    const qx = Math.abs(px) - bx;
    const qy = Math.abs(py) - by;
    const qz = Math.abs(pz) - bz;

    const outX = Math.max(qx, 0.0);
    const outY = Math.max(qy, 0.0);
    const outZ = Math.max(qz, 0.0);
    const outsideDist = Math.hypot(outX, outY, outZ);

    const insideDist = Math.min(Math.max(qx, Math.max(qy, qz)), 0.0);
    return outsideDist + insideDist;
  }

  public static sdTorus(
    px: number, py: number, pz: number,
    majorR: number, minorR: number
  ): number {
    const qx = Math.hypot(px, pz) - majorR;
    const qy = py;
    return Math.hypot(qx, qy) - minorR;
  }

  public static sdGyroid(
    px: number, py: number, pz: number,
    scale: number, thickness: number, bias: number = 0.0
  ): number {
    const sx = px * scale;
    const sy = py * scale;
    const sz = pz * scale;
    const g = Math.abs((Math.sin(sx) * Math.cos(sy) + Math.sin(sy) * Math.cos(sz) + Math.sin(sz) * Math.cos(sx)) - bias) - thickness;
    return g / scale;
  }

  public static opSmoothUnion(d1: number, d2: number, k: number): number {
    if (k <= 1e-6) return Math.min(d1, d2);
    const h = Math.max(0.0, Math.min(1.0, 0.5 + 0.5 * (d2 - d1) / k));
    return (d2 * (1.0 - h) + d1 * h) - k * h * (1.0 - h);
  }

  public static opSmoothIntersection(d1: number, d2: number, k: number): number {
    if (k <= 1e-6) return Math.max(d1, d2);
    const h = Math.max(0.0, Math.min(1.0, 0.5 - 0.5 * (d2 - d1) / k));
    return (d2 * (1.0 - h) + d1 * h) + k * h * (1.0 - h);
  }

  public static opSmoothSubtraction(d1: number, d2: number, k: number): number {
    if (k <= 1e-6) return Math.max(-d1, d2);
    const h = Math.max(0.0, Math.min(1.0, 0.5 - 0.5 * (d2 + d1) / k));
    return (d2 * (1.0 - h) + (-d1) * h) + k * h * (1.0 - h);
  }

  public static calcTetrahedronNormal(
    mapFn: (x: number, y: number, z: number) => number,
    x: number, y: number, z: number,
    eps: number = 0.001
  ): [number, number, number] {
    const k0 = [ 1.0, -1.0, -1.0];
    const k1 = [-1.0, -1.0,  1.0];
    const k2 = [-1.0,  1.0, -1.0];
    const k3 = [ 1.0,  1.0,  1.0];

    const d0 = mapFn(x + k0[0] * eps, y + k0[1] * eps, z + k0[2] * eps);
    const d1 = mapFn(x + k1[0] * eps, y + k1[1] * eps, z + k1[2] * eps);
    const d2 = mapFn(x + k2[0] * eps, y + k2[1] * eps, z + k2[2] * eps);
    const d3 = mapFn(x + k3[0] * eps, y + k3[1] * eps, z + k3[2] * eps);

    const nx = k0[0] * d0 + k1[0] * d1 + k2[0] * d2 + k3[0] * d3;
    const ny = k0[1] * d0 + k1[1] * d1 + k2[1] * d2 + k3[1] * d3;
    const nz = k0[2] * d0 + k1[2] * d1 + k2[2] * d2 + k3[2] * d3;

    const len = Math.hypot(nx, ny, nz);
    if (len < 1e-7) return [0, 1, 0];
    return [nx / len, ny / len, nz / len];
  }
}
