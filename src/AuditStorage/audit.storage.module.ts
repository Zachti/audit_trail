import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AuditStorageService } from './audit.storage.service';
import { AuditQueueModule } from '../AuditQueue/audit.queue.module';

@Module({
    imports: [
        ScheduleModule.forRoot(), // Import the ScheduleModule for scheduling tasks
        AuditQueueModule, // Import the AuditQueueModule
    ],
    providers: [AuditStorageService],
})
export class AuditStorageModule {}
