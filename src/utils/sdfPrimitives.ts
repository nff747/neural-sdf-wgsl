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

  /**
   * Exact Signed Distance to a 3D Capsule between segment endpoints a and b with radius r.
   */
  public static sdCapsule(
    px: number, py: number, pz: number,
    ax: number, ay: number, az: number,
    bx: number, by: number, bz: number,
    radius: number
  ): number {
    const pax = px - ax, pay = py - ay, paz = pz - az;
    const bax = bx - ax, bay = by - ay, baz = bz - az;
    const baLenSq = bax * bax + bay * bay + baz * baz;
    const h = baLenSq <= 1e-12 ? 0.0 : Math.max(0.0, Math.min(1.0, (pax * bax + pay * bay + paz * baz) / baLenSq));
    const dx = pax - bax * h;
    const dy = pay - bay * h;
    const dz = paz - baz * h;
    return Math.hypot(dx, dy, dz) - radius;
  }

  /**
   * Distance to an infinite oriented 3D plane with unit normal (nx, ny, nz) and offset d: dot(p, n) + d.
   */
  public static sdPlane(px: number, py: number, pz: number, nx: number, ny: number, nz: number, d: number): number {
    const nLen = Math.hypot(nx, ny, nz) || 1.0;
    return (px * nx + py * ny + pz * nz) / nLen + d;
  }

  /**
   * Approximate signed distance field for an axis-aligned ellipsoid with radii (rx, ry, rz).
   */
  public static sdEllipsoid(px: number, py: number, pz: number, rx: number, ry: number, rz: number): number {
    const k0 = Math.hypot(px / rx, py / ry, pz / rz);
    const k1 = Math.hypot(px / (rx * rx), py / (ry * ry), pz / (rz * rz));
    return k1 <= 1e-12 ? 0.0 : (k0 * (k0 - 1.0)) / k1;
  }
}

