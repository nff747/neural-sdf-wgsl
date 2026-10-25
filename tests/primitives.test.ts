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

  it('should correctly evaluate capsule distances along segment and beyond caps', () => {
    // Segment from (0, -1, 0) to (0, 1, 0) with radius 0.5
    // Surface point at (0.5, 0, 0)
    expect(SDFPrimitives.sdCapsule(0.5, 0.0, 0.0, 0, -1, 0, 0, 1, 0, 0.5)).toBeCloseTo(0.0, 5);
    // Interior point at origin (0, 0, 0) -> distance is -0.5
    expect(SDFPrimitives.sdCapsule(0.0, 0.0, 0.0, 0, -1, 0, 0, 1, 0, 0.5)).toBeCloseTo(-0.5, 5);
    // Top spherical cap apex at (0, 1.5, 0)
    expect(SDFPrimitives.sdCapsule(0.0, 1.5, 0.0, 0, -1, 0, 0, 1, 0, 0.5)).toBeCloseTo(0.0, 5);
    // Outside point above top cap at (0, 2.5, 0) -> distance is 1.0
    expect(SDFPrimitives.sdCapsule(0.0, 2.5, 0.0, 0, -1, 0, 0, 1, 0, 0.5)).toBeCloseTo(1.0, 5);
  });

  it('should evaluate infinite plane distances and signed half-spaces', () => {
    // Plane with normal (0, 1, 0) and offset -2 (y = 2)
    expect(SDFPrimitives.sdPlane(0, 2, 0, 0, 1, 0, -2)).toBeCloseTo(0.0, 5);
    expect(SDFPrimitives.sdPlane(10, 5, -3, 0, 1, 0, -2)).toBeCloseTo(3.0, 5);
    expect(SDFPrimitives.sdPlane(0, 0, 0, 0, 1, 0, -2)).toBeCloseTo(-2.0, 5);
  });

  it('should evaluate ellipsoid boundary and interior distances', () => {
    // Ellipsoid radii (2, 1, 0.5)
    // Points on boundary
    expect(SDFPrimitives.sdEllipsoid(2.0, 0.0, 0.0, 2.0, 1.0, 0.5)).toBeCloseTo(0.0, 5);
    expect(SDFPrimitives.sdEllipsoid(0.0, 1.0, 0.0, 2.0, 1.0, 0.5)).toBeCloseTo(0.0, 5);
    expect(SDFPrimitives.sdEllipsoid(0.0, 0.0, 0.5, 2.0, 1.0, 0.5)).toBeCloseTo(0.0, 5);
    // Inside point
    expect(SDFPrimitives.sdEllipsoid(0.5, 0.2, 0.1, 2.0, 1.0, 0.5)).toBeLessThan(0.0);
    // Outside point
    expect(SDFPrimitives.sdEllipsoid(4.0, 0.0, 0.0, 2.0, 1.0, 0.5)).toBeGreaterThan(0.0);
  });
});
