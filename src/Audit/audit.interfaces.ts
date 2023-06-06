import { Logger, ModuleMetadata, Type } from '@nestjs/common';
import { RedisOpts } from '../Types/objects';
import { EventRepository } from '../Event/event.repository';

export interface APM {
  captureError(error: unknown): Promise<void>;
}

export interface AuditModuleOptions {
  debug?: boolean;
  logger?: Logger;
  apm?: APM;
  environment: string;
  database: EventRepository;
  credentials: Record<string, string | number>;
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
  database: EventRepository;
}

export interface AuditOptions extends AuditModuleOptions {
  bufferSize?: number;
  interval?: number;
  redis?: RedisOpts;
}

