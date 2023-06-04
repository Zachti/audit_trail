import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { JobStatus, Queue } from 'bull';
import { Event } from '../Event/event.entity';
import { Interval } from '@nestjs/schedule';
import {Event_Repository, EventRepository} from '../Event/event.repository';
import { AUDIT_OPTIONS, AuditOptions } from '../Audit/audit.interfaces';

const jobTypes: JobStatus[] = ['waiting', 'active', 'delayed', 'paused', 'failed', 'completed'];


@Injectable()
export class AuditStorageService {
    private readonly logger: Logger;
    private buffer: Event[] = []; // Buffer to store events

    constructor(
        @Inject(AUDIT_OPTIONS) private options: AuditOptions,
        @Inject(Event_Repository) private eventRepository: EventRepository,
        @InjectQueue('audit') private readonly auditQueue: Queue,
        private readonly bufferSize: number,
    ) {
        this.bufferSize = options.bufferSize || 1000;
        this.logger = options.logger || new Logger(AuditStorageService.name);
    }

    async addToBuffer(event: Event): Promise<void> {
        this.buffer.push(event);

        // If buffer size exceeds the specified size, save the buffered events
        if (this.buffer.length >= this.bufferSize) {
            await this.toQueue(this.buffer);
            this.buffer = []; // Clear the buffer after saving
        }
    }

    async handleModuleDestroy() {
        if (this.buffer.length > 0) {
            this.logger.debug(`Module destroyed. saving all the ${this.buffer.length} remaining events in the buffer.`)
            await this.toQueue(this.buffer);
        }
    }

    private async toQueue(events: Event[]): Promise<void> {
        await this.auditQueue.addBulk(events.map((event) => ({ name: 'saveEvent', data: event })));
    }

    private async saveEvent(event: Event): Promise<void> {
        try {
            await this.eventRepository.save(event);
        } catch (error) {
            this.logger.error(`Failed to save audit event: ${error.message}`);
            await this.addToBuffer(event); // Add the event to the queue for later retransmission processing
        }
    }

    private async getAllEvents(): Promise<Event[]> {
        const jobs = await this.auditQueue.getJobs(jobTypes);
        return jobs.map((job) => job.data as Event);
    }

    @Interval(5000) // Interval in milliseconds
    private async saveQueuedEvents(): Promise<void> {
        const events = await this.getAllEvents(); // Create a copy of the buffer to avoid mutation issues
        await this.auditQueue.empty(); // Clear the queue after extracting all the jobs

        await Promise.all(events.map((event) => this.saveEvent(event)));
    }
}
