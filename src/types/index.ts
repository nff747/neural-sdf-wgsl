/**
 * Core TypeScript definitions for the Neural SDF WebGPU engine.
 */

export type CSGOperationType =
  | 'union'
  | 'intersection'
  | 'subtraction'
  | 'smooth-union'
  | 'smooth-intersection'
  | 'smooth-subtraction';

export interface SDFSphere {
  type: 'sphere';
  radius: number;
  center: [number, number, number];
}

export interface SDFBox {
  type: 'box';
  halfExtents: [number, number, number];
  cornerRadius?: number;
}

export interface SDFTorus {
  type: 'torus';
  majorRadius: number;
  minorRadius: number;
}

export interface SDFGyroid {
  type: 'gyroid';
  scale: number;
  thickness: number;
  bias: number;
}

export type SDFPrimitive = SDFSphere | SDFBox | SDFTorus | SDFGyroid;

export interface RaymarchConfig {
  maxSteps?: number;
  maxDistance?: number;
  epsilon?: number;
  omega?: number; // Over-relaxation factor (1.0 to 1.6)
  shadowSoftness?: number; // Penumbra sharpness k (e.g. 32.0)
  ambientOcclusion?: boolean;
}

export interface CameraUniforms {
  cameraPos: [number, number, number];
  lightPos: [number, number, number];
  resolution: [number, number];
  time: number;
  maxSteps: number;
  maxDistance: number;
  epsilon: number;
  omega: number;
  shadowSoftness: number;
}

export interface RaymarchHit {
  hit: boolean;
  distance: number;
  point: [number, number, number];
  normal: [number, number, number];
  steps: number;
  materialId: number;
}
