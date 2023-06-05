import { Module, DynamicModule, Provider } from '@nestjs/common';
import { AuditService } from './audit.service';
import {
  AuditOptions,
  AUDIT_OPTIONS,
  AuditModuleAsyncOptions,
} from './audit.interfaces';
import { AuditStorageService } from '../AuditStorage/audit.storage.service';

@Module({})
export class AuditModule {
  static forRoot(options: AuditOptions): DynamicModule {
    return {
      module: AuditModule,
      providers: [
        {
          provide: AUDIT_OPTIONS,
          useValue: options,
        },
        AuditService,
        AuditStorageService,
      ],
      exports: [AuditService , AuditStorageService],
    };
  }

  static forRootAsync(options: AuditModuleAsyncOptions): DynamicModule {
    const asyncProviders = this.createAsyncProviders(options);

    return {
      module: AuditModule,
      imports: options.imports,
      providers: [...asyncProviders, AuditService , AuditStorageService],
      exports: [AuditService , AuditStorageService],
    };
  }

  private static createAsyncProviders(
    options: AuditModuleAsyncOptions,
  ): Provider[] {
    if (options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }

    // Use `useClass` or `useExisting` if provided
    if (options.useClass || options.useExisting) {
      return [
        this.createAsyncOptionsProvider(options),
        options.useClass || options.useExisting,
      ];
    }

    throw new Error(
      'Invalid configuration for AuditModule. Provide useFactory, useClass, or useExisting in the options.',
    );
  }

  private static createAsyncOptionsProvider(
    options: AuditModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: AUDIT_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    // Use `useClass` if provided
    if (options.useClass) {
      return {
        provide: AUDIT_OPTIONS,
        useClass: options.useClass,
      };
    }

    throw new Error(
      'Invalid configuration for AuditModule. Provide useFactory or useClass in the options.',
    );
  }
}
