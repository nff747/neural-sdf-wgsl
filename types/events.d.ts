/**
 * Event and telemetry types for Neural Sdf WGSL
 */

export type TelemetrySeverity = 'info' | 'warn' | 'error' | 'fatal';

export interface TelemetryEvent {
  readonly timestamp: number;
  readonly severity: TelemetrySeverity;
  readonly message: string;
  readonly cycleCount?: number;
}

export type TelemetryListener = (event: TelemetryEvent) => void;
