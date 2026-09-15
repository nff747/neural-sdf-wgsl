/**
 * Analytical Exact Distance Fields for Geometric CSG Primitives.
 */

export class SDFPrimitives {
  public static sdSphere(px: number, py: number, pz: number, radius: number): number {
    return Math.hypot(px, py, pz) - radius;
  }

  public static sdBox(px: number, py: number, pz: number, bx: number, by: number, bz: number): number {
    const qx = Math.abs(px) - bx;
    const qy = Math.abs(py) - by;
    const qz = Math.abs(pz) - bz;
    const ox = Math.max(qx, 0.0);
    const oy = Math.max(qy, 0.0);
    const oz = Math.max(qz, 0.0);
    const outside = Math.hypot(ox, oy, oz);
    const inside = Math.min(Math.max(qx, Math.max(qy, qz)), 0.0);
    return outside + inside;
  }

  public static sdTorus(px: number, py: number, pz: number, rMajor: number, rMinor: number): number {
    const qx = Math.hypot(px, pz) - rMajor;
    return Math.hypot(qx, py) - rMinor;
  }

  public static sdCylinder(px: number, py: number, pz: number, radius: number, halfHeight: number): number {
    const dRadial = Math.hypot(px, pz) - radius;
    const dAxial = Math.abs(py) - halfHeight;
    const outside = Math.hypot(Math.max(dRadial, 0.0), Math.max(dAxial, 0.0));
    const inside = Math.min(Math.max(dRadial, dAxial), 0.0);
    return outside + inside;
  }
}
