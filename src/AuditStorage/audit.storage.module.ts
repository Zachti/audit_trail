import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { AuditStorageService } from './audit.storage.service';
import { redisConnection } from '../Types/objects';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'audit',
    }),
    BullModule.forRoot({
      redis: redisConnection,
    })
  ],
  providers: [
    {
      provide: AuditStorageService,
      useClass: AuditStorageService,
    },
  ],
  exports: [AuditStorageService],
})
export class AuditStorageModule{}