import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { AuditQueueService } from './audit.queue.service';

@Module({
    imports: [
        BullModule.registerQueue({
            name: 'audit', // Name of the queue
        }),
    ],
    providers: [AuditQueueService],
    exports: [AuditQueueService],
})
export class AuditQueueModule {}
