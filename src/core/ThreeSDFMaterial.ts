/**
 * ThreeSDFMaterial.ts
 * High-performance adapter for Three.js rendering scenes.
 * Allows binding WebGPU storage textures or WebGL2 raymarching shaders
 * seamlessly to Three.js Meshes and post-processing passes.
 */

export interface ThreeShaderUniforms {
  [uniform: string]: { value: any };
}

export class ThreeSDFMaterial {
  /**
   * Generates a Three.js-compatible ShaderMaterial configuration object
   * with custom uniforms bound to camera position and lighting.
   */
  public static createShaderDefinition() {
    return {
      uniforms: {
        uTime: { value: 0.0 },
        uResolution: { value: [800, 600] },
        uOmega: { value: 1.4 },
        uBlendRadius: { value: 0.35 },
        uGyroidMix: { value: 0.45 },
        uShadowSoftness: { value: 32.0 },
      },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
      update: (material: any, time: number, resX: number, resY: number) => {
        if (material.uniforms.uTime) material.uniforms.uTime.value = time;
        if (material.uniforms.uResolution) material.uniforms.uResolution.value = [resX, resY];
      },
    };
  }
}
