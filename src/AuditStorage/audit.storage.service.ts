import { Injectable, Logger , Inject} from '@nestjs/common';
import { Event } from '../Event/event.entity';
import { Interval} from '@nestjs/schedule';
import {Event_Repository, EventRepository} from '../Event/event.repository';
import {AuditQueueService} from "../AuditQueue/audit.queue.service";
import {AUDIT_OPTIONS, AuditOptions} from "../Audit/audit.interfaces";

@Injectable()
export class AuditStorageService {
    private AuditQueueService: AuditQueueService;

    constructor(
        @Inject(AUDIT_OPTIONS) private options: AuditOptions,
        @Inject(Event_Repository) private eventRepository: EventRepository,
        private buffer: Event[] = [], // Buffer to store events
        private bufferSize: number, // Size of the buffer
        private readonly logger: Logger,
    ) {
        this.bufferSize = options.bufferSize || 100; // Set the buffer size from options or use a default value
        this.logger = options.logger || new Logger(AuditStorageService.name);
    }

    async toQueue(event: Event) {
        await this.AuditQueueService.enqueue(event);
    }

    private async saveEvent(event: Event): Promise<void> {
        try {
            await this.eventRepository.save(event);
            await this.AuditQueueService.removeEvent(event);
        } catch (error) {
            this.logger.error(`Failed to save audit event: ${error.message}`);
            await this.AuditQueueService.enqueue(event); // Add the event to the queue for later retransmission processing
        }
    }

    @Interval( 5000) // Interval in milliseconds
    private async saveQueuedEvents(): Promise<void> {
        const events = await this.AuditQueueService.getAllEvents(); // Create a copy of the buffer to avoid mutation issues
        await this.AuditQueueService.clearQueue(); // Clear the queue after extracting all the jobs

        await Promise.all(events.map((event) =>
            this.saveEvent(event)));
    }
}
