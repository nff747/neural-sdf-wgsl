/**
 * Headless CPU Reference Raymarcher.
 * Provides verifiable over-relaxed sphere tracing, soft shadow calculation,
 * and normal calculation for test environments without a physical GPU.
 */

import { SDFMath } from '../utils/math';
import { RaymarchConfig, RaymarchHit } from '../types';

export class CPUReferenceRaymarcher {
  public static raymarch(
    mapFn: (x: number, y: number, z: number) => { distance: number; materialId: number },
    ro: [number, number, number],
    rd: [number, number, number],
    config: RaymarchConfig = {}
  ): RaymarchHit {
    const maxSteps = config.maxSteps ?? 128;
    const maxDistance = config.maxDistance ?? 20.0;
    const epsilon = config.epsilon ?? 0.001;
    const omega = config.omega ?? 1.4;

    let t = 0.01;
    let steps = 0;
    let lastMat = 0;

    for (let i = 0; i < maxSteps; i++) {
      steps++;
      const px = ro[0] + rd[0] * t;
      const py = ro[1] + rd[1] * t;
      const pz = ro[2] + rd[2] * t;

      const res = mapFn(px, py, pz);
      const d = res.distance;
      lastMat = res.materialId;

      if (d < epsilon) {
        const normal = SDFMath.calcTetrahedronNormal((x, y, z) => mapFn(x, y, z).distance, px, py, pz, epsilon);
        return {
          hit: true,
          distance: t,
          point: [px, py, pz],
          normal,
          steps,
          materialId: lastMat,
        };
      }

      if (t > maxDistance) break;

      t += d * omega;
    }

    return {
      hit: false,
      distance: t,
      point: [ro[0] + rd[0] * t, ro[1] + rd[1] * t, ro[2] + rd[2] * t],
      normal: [0, 1, 0],
      steps,
      materialId: 0,
    };
  }

  public static calcSoftShadow(
    mapFn: (x: number, y: number, z: number) => number,
    ro: [number, number, number],
    lightDir: [number, number, number],
    mint: number = 0.02,
    maxt: number = 8.0,
    k: number = 32.0
  ): number {
    let res = 1.0;
    let t = mint;

    for (let i = 0; i < 32; i++) {
      const px = ro[0] + lightDir[0] * t;
      const py = ro[1] + lightDir[1] * t;
      const pz = ro[2] + lightDir[2] * t;

      const h = mapFn(px, py, pz);
      if (h < 0.001) return 0.0;

      res = Math.min(res, (k * h) / t);
      t += Math.max(0.02, Math.min(0.2, h));
      if (t > maxt) break;
    }

    return Math.max(0.0, Math.min(1.0, res));
  }
}
