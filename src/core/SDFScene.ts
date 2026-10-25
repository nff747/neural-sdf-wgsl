/**
 * Declarative SDF Scene Graph Builder.
 * Supports chaining smooth boolean operations, bounding sphere acceleration,
 * and emitting custom WGSL scene shaders.
 */

import { SDFPrimitive, CSGOperationType } from '../types';

export interface SceneNode {
  id: string;
  primitive: SDFPrimitive;
  operation?: CSGOperationType;
  blendRadius?: number;
}

export interface BoundingSphere {
  center: [number, number, number];
  radius: number;
}

export class SDFScene {
  private nodes: SceneNode[] = [];

  public add(id: string, primitive: SDFPrimitive, operation: CSGOperationType = 'union', blendRadius: number = 0.2): this {
    this.nodes.push({ id, primitive, operation, blendRadius });
    return this;
  }

  public getNodes(): readonly SceneNode[] {
    return this.nodes;
  }

  public clear(): void {
    this.nodes = [];
  }

  /**
   * Computes a conservative bounding sphere enclosing all primitives in the scene graph.
   */
  public computeBoundingSphere(): BoundingSphere {
    if (this.nodes.length === 0) {
      return { center: [0, 0, 0], radius: 0 };
    }

    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

    for (const node of this.nodes) {
      const p = node.primitive;
      let r = 1.0;
      if (p.type === 'sphere') {
        r = p.radius ?? 1.0;
      } else if (p.type === 'box') {
        const [bx, by, bz] = p.halfExtents ?? [1, 1, 1];
        r = Math.hypot(bx, by, bz);
      } else if (p.type === 'torus') {
        r = (p.majorRadius ?? 1.0) + (p.minorRadius ?? 0.25);
      }

      const [px, py, pz] = p.position ?? [0, 0, 0];
      minX = Math.min(minX, px - r);
      minY = Math.min(minY, py - r);
      minZ = Math.min(minZ, pz - r);
      maxX = Math.max(maxX, px + r);
      maxY = Math.max(maxY, py + r);
      maxZ = Math.max(maxZ, pz + r);
    }

    const cx = (minX + maxX) * 0.5;
    const cy = (minY + maxY) * 0.5;
    const cz = (minZ + maxZ) * 0.5;
    const radius = Math.hypot(maxX - cx, maxY - cy, maxZ - cz);

    return { center: [cx, cy, cz], radius };
  }

  /**
   * Tests whether a ray intersects the bounding sphere of the scene.
   * Enables early raymarch rejection for off-target rays.
   */
  public intersectsRay(
    ro: [number, number, number],
    rd: [number, number, number],
    bs: BoundingSphere
  ): boolean {
    const oc = [ro[0] - bs.center[0], ro[1] - bs.center[1], ro[2] - bs.center[2]];
    const b = oc[0] * rd[0] + oc[1] * rd[1] + oc[2] * rd[2];
    const c = oc[0] * oc[0] + oc[1] * oc[1] + oc[2] * oc[2] - bs.radius * bs.radius;
    if (c <= 0.0) return true; // Origin inside sphere
    if (b > 0.0) return false; // Ray pointing away
    const disc = b * b - c;
    return disc >= 0.0;
  }
}
