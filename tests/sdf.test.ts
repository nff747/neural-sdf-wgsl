import { describe, it, expect } from 'vitest';
import {
  SDFMath,
  CPUReferenceRaymarcher,
  SDFScene,
  sdfPrimitivesShader,
  sdfOperatorsShader,
  sdfNormalsShader,
  sdfRaymarchShader,
} from '../src/index';

describe('SDF Analytical Primitives', () => {
  it('should compute exact Euclidean distance for a sphere', () => {
    const r = 1.0;
    // On surface
    expect(SDFMath.sdSphere(1.0, 0.0, 0.0, 0, 0, 0, r)).toBeCloseTo(0.0);
    // Outside
    expect(SDFMath.sdSphere(3.0, 0.0, 0.0, 0, 0, 0, r)).toBeCloseTo(2.0);
    // Inside
    expect(SDFMath.sdSphere(0.0, 0.0, 0.0, 0, 0, 0, r)).toBeCloseTo(-1.0);
  });

  it('should compute correct distances for an axis-aligned box', () => {
    const halfExtents = [1.0, 1.0, 1.0];
    // Center is inside
    expect(SDFMath.sdBox(0, 0, 0, 1, 1, 1)).toBeLessThan(0.0);
    // Exact face point
    expect(SDFMath.sdBox(1.0, 0.0, 0.0, 1, 1, 1)).toBeCloseTo(0.0);
    // 2 units outside along X axis
    expect(SDFMath.sdBox(3.0, 0.0, 0.0, 1, 1, 1)).toBeCloseTo(2.0);
  });

  it('should evaluate TPMS Gyroid periodic lattice distances', () => {
    // Gyroid distance should be finite and bounded
    const d1 = SDFMath.sdGyroid(0.5, 0.5, 0.5, 2.0, 0.1);
    const d2 = SDFMath.sdGyroid(1.5, 1.5, 1.5, 2.0, 0.1);
    expect(Number.isFinite(d1)).toBe(true);
    expect(Number.isFinite(d2)).toBe(true);
  });
});

describe('SDF Smooth CSG Operators', () => {
  it('should provide smooth polynomial blend within k/4 deviation', () => {
    const k = 0.4;
    // When d1 = d2 = 0, standard min is 0.0, smooth min is -k/4 = -0.1
    const smin = SDFMath.opSmoothUnion(0.0, 0.0, k);
    expect(smin).toBeCloseTo(-k * 0.25);

    // Far from intersection, should match standard min
    const sminFar = SDFMath.opSmoothUnion(10.0, 0.0, k);
    expect(sminFar).toBeCloseTo(0.0);
  });

  it('should compute smooth intersection and subtraction', () => {
    const k = 0.2;
    const sInter = SDFMath.opSmoothIntersection(1.0, 1.0, k);
    expect(sInter).toBeCloseTo(1.0 + k * 0.25);

    const sSub = SDFMath.opSmoothSubtraction(0.0, 1.0, k);
    expect(Number.isFinite(sSub)).toBe(true);
  });
});

describe('Tetrahedron Gradient Normal Estimation', () => {
  it('should match analytical normal on a sphere within 1% error', () => {
    const r = 2.0;
    const sphereMap = (x: number, y: number, z: number) => Math.hypot(x, y, z) - r;

    // Test point on surface at [r, 0, 0] -> expected normal [1, 0, 0]
    const n1 = SDFMath.calcTetrahedronNormal(sphereMap, r, 0, 0, 0.001);
    expect(n1[0]).toBeCloseTo(1.0, 2);
    expect(n1[1]).toBeCloseTo(0.0, 2);
    expect(n1[2]).toBeCloseTo(0.0, 2);

    // Test point on diagonal [r/sqrt(3), r/sqrt(3), r/sqrt(3)]
    const diag = r / Math.sqrt(3);
    const n2 = SDFMath.calcTetrahedronNormal(sphereMap, diag, diag, diag, 0.001);
    const expectedDiag = 1.0 / Math.sqrt(3);
    expect(n2[0]).toBeCloseTo(expectedDiag, 2);
    expect(n2[1]).toBeCloseTo(expectedDiag, 2);
    expect(n2[2]).toBeCloseTo(expectedDiag, 2);
  });
});

describe('CPUReferenceRaymarcher Sphere Tracing', () => {
  it('should accurately intersect a sphere and report correct normal and distance', () => {
    const sphereRadius = 1.5;
    const mapFn = (x: number, y: number, z: number) => ({
      distance: Math.hypot(x, y, z) - sphereRadius,
      materialId: 1,
    });

    // Ray starting at [0, 0, 5] pointing towards origin [0, 0, -1]
    const ro: [number, number, number] = [0, 0, 5];
    const rd: [number, number, number] = [0, 0, -1];

    const hit = CPUReferenceRaymarcher.raymarch(mapFn, ro, rd, {
      omega: 1.4, // Over-relaxation
      epsilon: 0.001,
    });

    expect(hit.hit).toBe(true);
    expect(hit.distance).toBeCloseTo(3.5, 2); // 5.0 - 1.5 = 3.5
    expect(hit.point[0]).toBeCloseTo(0.0, 2);
    expect(hit.point[1]).toBeCloseTo(0.0, 2);
    expect(hit.point[2]).toBeCloseTo(1.5, 2);
    expect(hit.normal[2]).toBeCloseTo(1.0, 2); // Normal pointing back towards +Z
  });

  it('should calculate penumbra soft shadows', () => {
    const sphereRadius = 1.0;
    const mapFn = (x: number, y: number, z: number) => Math.hypot(x, y, z) - sphereRadius;

    // Occluded point behind sphere
    const roOccluded: [number, number, number] = [0, 0, -3];
    const lightDir: [number, number, number] = [0, 0, 1];
    const shadowOccluded = CPUReferenceRaymarcher.calcSoftShadow(mapFn, roOccluded, lightDir);
    expect(shadowOccluded).toBe(0.0);

    // Completely clear point
    const roClear: [number, number, number] = [0, 5, 0];
    const shadowClear = CPUReferenceRaymarcher.calcSoftShadow(mapFn, roClear, lightDir);
    expect(shadowClear).toBe(1.0);
  });
});

describe('WGSL Shaders Integrity', () => {
  it('should contain valid WGSL compute entrypoints and shader symbols', () => {
    expect(sdfPrimitivesShader).toContain('sdSphere');
    expect(sdfPrimitivesShader).toContain('sdBox');
    expect(sdfPrimitivesShader).toContain('sdGyroid');

    expect(sdfOperatorsShader).toContain('opSmoothUnion');
    expect(sdfOperatorsShader).toContain('opTwist');

    expect(sdfNormalsShader).toContain('calcNormalTetrahedron');

    expect(sdfRaymarchShader).toContain('@compute');
    expect(sdfRaymarchShader).toContain('fn main');
    expect(sdfRaymarchShader).toContain('CameraParams');
  });
});
