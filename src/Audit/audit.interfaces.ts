import { Logger, ModuleMetadata, Type } from '@nestjs/common';

export interface APM {
  captureError(error: unknown): Promise<void>;
}

export interface AuditModuleOptions {
  debug?: boolean;
  logger?: Logger;
  environment: string;
}

export interface AuditModuleOptionsFactory {
  createAuditOptions(): Promise<AuditModuleOptions> | AuditModuleOptions;
}

export interface AuditModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useClass: Type<AuditModuleOptionsFactory>;
  useExisting?: Type<AuditModuleOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<AuditModuleOptions> | AuditModuleOptions;
  inject?: any[];
}

export interface AuditOptions extends AuditModuleOptions {
  database: string;
  credentials: Record<string, string | number>;
  bufferSize?: number;
  apm?: APM;
  interval?: number;
}

