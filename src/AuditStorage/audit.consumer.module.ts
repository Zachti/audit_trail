import { Module } from '@nestjs/common';
import { BullModule, BullModuleAsyncOptions } from '@nestjs/bull';
import { AuditConsumer } from './audit.consumer';
import { AUDIT_OPTIONS, redisConnection , AUDIT_QUEUE } from '../Types/constants';
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
      inject: [AUDIT_OPTIONS],
    } as BullModuleAsyncOptions),
    BullModule.forRoot({
      redis: redisConnection,
    }),
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

