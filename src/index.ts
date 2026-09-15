/**
 * Neural SDF WGSL
 * Real-Time Neural Signed Distance Field (SDF) Raymarcher & Dynamic CSG Boolean Engine in WebGPU / WGSL
 * @packageDocumentation
 */

export * from './types';
export * from './utils/math';
export * from './core/SDFScene';
export * from './core/SDFRenderer';
export * from './core/CPUReferenceRaymarcher';
export * from './core/ThreeSDFMaterial';


export { sdfPrimitivesShader } from './shaders/sdfPrimitives.wgsl';
export { sdfOperatorsShader } from './shaders/sdfOperators.wgsl';
export { sdfNormalsShader } from './shaders/sdfNormals.wgsl';
export { sdfRaymarchShader } from './shaders/sdfRaymarch.wgsl';
