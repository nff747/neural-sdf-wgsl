/**
 * Micro-benchmark measuring raw SDF evaluation throughput on CPU.
 */

import { SDFMath } from '../src/utils/math';
import { CPUReferenceRaymarcher } from '../src/core/CPUReferenceRaymarcher';

console.log('--- Neural SDF WGSL Raymarching & CSG Throughput Benchmark ---');

const testCases = [
  {
    name: 'Analytic Sphere Evaluation',
    fn: (i: number) => SDFMath.sdSphere(i * 0.001, Math.sin(i), Math.cos(i), 0, 0, 0, 1.0),
  },
  {
    name: 'Rounded Box Evaluation',
    fn: (i: number) => SDFMath.sdBox(i * 0.001, Math.sin(i), Math.cos(i), 1, 1, 1),
  },
  {
    name: 'TPMS Gyroid Lattice Evaluation',
    fn: (i: number) => SDFMath.sdGyroid(i * 0.001, Math.sin(i), Math.cos(i), 2.5, 0.1),
  },
  {
    name: 'Smooth CSG Union (Polynomial smin)',
    fn: (i: number) => {
      const d1 = SDFMath.sdSphere(i * 0.001, Math.sin(i), Math.cos(i), 0, 0, 0, 1.0);
      const d2 = SDFMath.sdBox(i * 0.001, Math.sin(i), Math.cos(i), 0.8, 0.8, 0.8);
      return SDFMath.opSmoothUnion(d1, d2, 0.3);
    },
  },
];

const N = 500_000;

for (const tc of testCases) {
  // Warmup
  for (let i = 0; i < 1000; i++) tc.fn(i);

  const t0 = performance.now();
  for (let i = 0; i < N; i++) {
    tc.fn(i);
  }
  const t1 = performance.now();
  const totalMs = t1 - t0;
  const opsPerSec = (N / (totalMs / 1000));

  console.log(`[${tc.name}]`);
  console.log(`  Evaluations:  ${N.toLocaleString()}`);
  console.log(`  Latency:      ${(totalMs / N * 1000).toFixed(3)} µs/eval`);
  console.log(`  Throughput:   ${(opsPerSec / 1e6).toFixed(2)}M ops/sec`);
  console.log('--------------------------------------------------------------');
}
