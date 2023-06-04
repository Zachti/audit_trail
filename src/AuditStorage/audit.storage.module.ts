import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';
import { AuditStorageService } from './audit.storage.service';


@Module({
    imports: [
        BullModule.registerQueue({
            name: 'audit',
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
export class AuditStorageModule {}
