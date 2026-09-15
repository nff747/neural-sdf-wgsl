import { describe, it, expect } from 'vitest';
import { SDFPrimitives } from '../src/utils/sdfPrimitives';

describe('SDFPrimitives Analytical Distance Functions', () => {
  it('should evaluate zero on boundary of sphere, box, and torus', () => {
    expect(SDFPrimitives.sdSphere(1.0, 0.0, 0.0, 1.0)).toBeCloseTo(0.0, 5);
    expect(SDFPrimitives.sdBox(1.0, 1.0, 1.0, 1.0, 1.0, 1.0)).toBeCloseTo(0.0, 5);
    expect(SDFPrimitives.sdTorus(1.5, 0.0, 0.0, 1.0, 0.5)).toBeCloseTo(0.0, 5);
    expect(SDFPrimitives.sdCylinder(0.5, 1.0, 0.0, 0.5, 1.0)).toBeCloseTo(0.0, 5);
  });

  it('should return negative values strictly inside geometries', () => {
    expect(SDFPrimitives.sdSphere(0.0, 0.0, 0.0, 1.0)).toBeLessThan(0.0);
    expect(SDFPrimitives.sdBox(0.2, 0.2, 0.2, 1.0, 1.0, 1.0)).toBeLessThan(0.0);
    expect(SDFPrimitives.sdCylinder(0.1, 0.5, 0.1, 0.5, 1.0)).toBeLessThan(0.0);
  });
});
