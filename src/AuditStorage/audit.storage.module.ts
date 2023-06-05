import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { AuditStorageService } from './audit.storage.service';

const connection = {
  host: 'localhost',
  port: 6379,
}

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'audit',
    }),
    BullModule.forRoot({
      redis: connection,
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