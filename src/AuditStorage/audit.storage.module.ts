import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';
import { AuditStorageService } from './audit.storage.service';

const connection = {
  host: 'localhost',
  port: 6379,
}

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'audit',
      redis: connection,
    }),
    ScheduleModule.forRoot(),
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