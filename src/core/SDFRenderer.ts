/**
 * WebGPU SDF Raymarching Compute Pipeline Orchestrator.
 * Manages device initialization, camera uniform buffers, compute pipelines,
 * and zero-copy rendering to canvas or offscreen storage textures.
 */

import { CameraUniforms } from '../types';
import { sdfPrimitivesShader } from '../shaders/sdfPrimitives.wgsl';
import { sdfOperatorsShader } from '../shaders/sdfOperators.wgsl';
import { sdfNormalsShader } from '../shaders/sdfNormals.wgsl';
import { sdfRaymarchShader } from '../shaders/sdfRaymarch.wgsl';

export class SDFRenderer {
  private device: GPUDevice | null = null;
  private pipeline: GPUComputePipeline | null = null;
  private cameraUniformBuffer: GPUBuffer | null = null;
  private bindGroup: GPUBindGroup | null = null;
  private outputTexture: GPUTexture | null = null;
  private width: number = 800;
  private height: number = 600;

  /**
   * Initializes WebGPU device and compiles compute shader pipeline
   */
  public async init(device: GPUDevice, width: number = 800, height: number = 600): Promise<void> {
    this.device = device;
    this.width = width;
    this.height = height;

    // Concatenate WGSL shader modules
    const fullShaderSource = [
      sdfPrimitivesShader,
      sdfOperatorsShader,
      sdfNormalsShader,
      sdfRaymarchShader,
    ].join('\n');

    const shaderModule = device.createShaderModule({
      label: 'Neural SDF Raymarcher Module',
      code: fullShaderSource,
    });

    this.pipeline = device.createComputePipeline({
      label: 'Neural SDF Compute Pipeline',
      layout: 'auto',
      compute: {
        module: shaderModule,
        entryPoint: 'main',
      },
    });

    // Camera Uniform Buffer: 128 bytes (aligned to 16 bytes)
    this.cameraUniformBuffer = device.createBuffer({
      label: 'Camera Uniforms',
      size: 160,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    this.resize(width, height);
  }

  /**
   * Resizes output texture and recreates bind groups
   */
  public resize(width: number, height: number): void {
    if (!this.device || !this.pipeline || !this.cameraUniformBuffer) return;
    this.width = width;
    this.height = height;

    if (this.outputTexture) {
      this.outputTexture.destroy();
    }

    this.outputTexture = this.device.createTexture({
      label: 'Raymarch Output Storage Texture',
      size: [width, height, 1],
      format: 'rgba8unorm',
      usage: GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_SRC,
    });

    this.bindGroup = this.device.createBindGroup({
      label: 'SDF Raymarch BindGroup',
      layout: this.pipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: this.cameraUniformBuffer } },
        { binding: 1, resource: this.outputTexture.createView() },
      ],
    });
  }

  /**
   * Updates camera uniforms and dispatches 2D compute workgroups
   */
  public render(uniforms: Partial<CameraUniforms> = {}): void {
    if (!this.device || !this.pipeline || !this.bindGroup || !this.cameraUniformBuffer) return;

    const data = new ArrayBuffer(160);
    const floatView = new Float32Array(data);
    const uintView = new Uint32Array(data);

    // Camera pos (vec4)
    const cPos = uniforms.cameraPos ?? [0, 1.2, 3.5];
    floatView[0] = cPos[0];
    floatView[1] = cPos[1];
    floatView[2] = cPos[2];
    floatView[3] = 1.0;

    // Light pos (vec4)
    const lPos = uniforms.lightPos ?? [3.0, 5.0, 4.0];
    floatView[4] = lPos[0];
    floatView[5] = lPos[1];
    floatView[6] = lPos[2];
    floatView[7] = 1.0;

    // Resolution (vec2), Time, MaxSteps
    floatView[8] = this.width;
    floatView[9] = this.height;
    floatView[10] = uniforms.time ?? 0.0;
    uintView[11] = uniforms.maxSteps ?? 128;

    // MaxDistance, Epsilon, Omega, ShadowSoftness
    floatView[12] = uniforms.maxDistance ?? 20.0;
    floatView[13] = uniforms.epsilon ?? 0.001;
    floatView[14] = uniforms.omega ?? 1.4;
    floatView[15] = uniforms.shadowSoftness ?? 32.0;

    this.device.queue.writeBuffer(this.cameraUniformBuffer, 0, data);

    const commandEncoder = this.device.createCommandEncoder({ label: 'SDF Raymarch Command' });
    const computePass = commandEncoder.beginComputePass({ label: 'SDF Raymarch Pass' });

    computePass.setPipeline(this.pipeline);
    computePass.setBindGroup(0, this.bindGroup);

    const workgroupsX = Math.ceil(this.width / 16);
    const workgroupsY = Math.ceil(this.height / 16);
    computePass.dispatchWorkgroups(workgroupsX, workgroupsY, 1);

    computePass.end();
    this.device.queue.submit([commandEncoder.finish()]);
  }

  public getOutputTexture(): GPUTexture | null {
    return this.outputTexture;
  }
}
