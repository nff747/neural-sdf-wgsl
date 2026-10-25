/**
 * ThreeSDFMaterial.ts
 * High-performance adapter for Three.js rendering scenes.
 * Allows binding WebGPU storage textures or WebGL2 raymarching shaders
 * seamlessly to Three.js Meshes and post-processing passes.
 */

export interface ThreeShaderUniforms {
  [uniform: string]: { value: any };
}

export interface SDFMaterialParams {
  time?: number;
  resolution?: [number, number];
  omega?: number;
  blendRadius?: number;
  gyroidMix?: number;
  shadowSoftness?: number;
  ambientOcclusionSamples?: number;
}

export class ThreeSDFMaterial {
  /**
   * Generates a Three.js-compatible ShaderMaterial configuration object
   * with custom uniforms bound to camera position and lighting.
   */
  public static createShaderDefinition(initialParams: SDFMaterialParams = {}) {
    return {
      uniforms: {
        uTime: { value: initialParams.time ?? 0.0 },
        uResolution: { value: initialParams.resolution ?? [800, 600] },
        uOmega: { value: initialParams.omega ?? 1.4 },
        uBlendRadius: { value: initialParams.blendRadius ?? 0.35 },
        uGyroidMix: { value: initialParams.gyroidMix ?? 0.45 },
        uShadowSoftness: { value: initialParams.shadowSoftness ?? 32.0 },
        uAoSamples: { value: initialParams.ambientOcclusionSamples ?? 5 },
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

  /**
   * Packs procedural SDF uniform parameters into a 16-byte aligned Float32Array
   * suitable for direct copy into a WebGPU uniform buffer.
   */
  public static packUniformBuffer(params: SDFMaterialParams): Float32Array {
    // 8 float values (32 bytes = multiple of 16)
    const buffer = new Float32Array(8);
    buffer[0] = params.time ?? 0.0;
    buffer[1] = params.omega ?? 1.4;
    buffer[2] = params.blendRadius ?? 0.35;
    buffer[3] = params.gyroidMix ?? 0.45;
    buffer[4] = params.resolution ? params.resolution[0] : 800;
    buffer[5] = params.resolution ? params.resolution[1] : 600;
    buffer[6] = params.shadowSoftness ?? 32.0;
    buffer[7] = params.ambientOcclusionSamples ?? 5.0;
    return buffer;
  }
}
