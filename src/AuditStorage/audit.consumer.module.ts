import { Module } from '@nestjs/common';
import { BullModule, BullModuleAsyncOptions, SharedBullAsyncConfiguration } from '@nestjs/bull';
import { AuditConsumer } from './audit.consumer';
import { ConfigService } from '@nestjs/config';
import { AUDIT_OPTIONS , AUDIT_QUEUE } from '../Types/constants';
import {AuditOptions } from '../Audit/audit.interfaces';

@Module({
  imports: [
    BullModule.registerQueueAsync({
      name: AUDIT_QUEUE,
      useFactory: async (options: AuditOptions) => ({
        defaultJobOptions: {
          backoff: {
            type: 'fixed',
            delay: options.interval ?? 5000,
          } ,
          removeOnComplete: true,
          removeOnFail: false
        }
      }) ,
    } as BullModuleAsyncOptions),
    BullModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        redis: configService.get('REDIS_CONNECTION'),
      }),
      inject: [AUDIT_OPTIONS , ConfigService]
    } as SharedBullAsyncConfiguration),
  ],

  providers: [
    {
      provide: AuditConsumer,
      useClass: AuditConsumer,
    },
  ],
  exports: [AuditConsumer],
})
export class AuditConsumerModule{}

