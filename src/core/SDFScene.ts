/**
 * Declarative SDF Scene Graph Builder.
 * Supports chaining smooth boolean operations and emitting custom WGSL scene shaders.
 */

import { SDFPrimitive, CSGOperationType } from '../types';

export interface SceneNode {
  id: string;
  primitive: SDFPrimitive;
  operation?: CSGOperationType;
  blendRadius?: number;
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
}
