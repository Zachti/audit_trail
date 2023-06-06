import { Module, DynamicModule, Provider } from '@nestjs/common';
import { AuditService } from './audit.service';
import {
  AuditOptions,
  AuditModuleAsyncOptions,
} from './audit.interfaces';
import { AuditConsumer } from '../AuditStorage/audit.consumer';
import { AUDIT_OPTIONS } from '../Types/constants';

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
        AuditConsumer,
      ],
      exports: [AuditService , AuditConsumer],
    };
  }

  static forRootAsync(options: AuditModuleAsyncOptions): DynamicModule {
    const asyncProviders = this.createAsyncProviders(options);

    return {
      module: AuditModule,
      imports: options.imports,
      providers: [...asyncProviders, AuditService , AuditConsumer],
      exports: [AuditService , AuditConsumer],
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
