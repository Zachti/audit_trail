import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue , Worker } from 'bullmq';
import { Event } from '../Event/event.entity';
import { Event_Repository, EventRepository } from '../Event/event.repository';
import { AUDIT_OPTIONS, AuditOptions } from '../Audit/audit.interfaces';

@Injectable()
export class AuditStorageService {
  private readonly logger: Logger;
  private buffer: Event[] = []; // Buffer to store events

  constructor(
    @Inject(AUDIT_OPTIONS) private options: AuditOptions,
    @Inject(Event_Repository) private eventRepository: EventRepository,
    @InjectQueue('audit') private readonly auditQueue: Queue,
    private readonly auditQueueWorker: Worker,
    private readonly bufferSize: number,
  ) {
    this.bufferSize = options.bufferSize ?? 1000;
    this.logger = options.logger ?? new Logger(AuditStorageService.name);
    this.auditQueue =  new Queue('auditQueue' ,  {defaultJobOptions: {
      backoff: {
        type: 'fixed',
        delay: options.interval ?? 5000, // Delay in milliseconds between each retry attempt
      }},
    });
    this.auditQueueWorker = new Worker('auditQueue', async job => {
      try {
        return await this.eventRepository.save(job.data);
      } catch (e) {
        await this.handleError(e)
      }
    })
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
      // if there is events in the buffer , save them into the queue before process shut down.
      this.logger.debug(
        `Module destroyed. saving all the ${this.buffer.length} remaining events in the buffer.`,
      );
      await this.toQueue(this.buffer);
    }
  }

  private async toQueue(events: Event[]): Promise<void> {
    // add all the buffer to the queue.
    await this.auditQueue.addBulk(
      events.map((event) => ({ name: 'saveEvent', data: event  , attempts: -1, })),
    );
  }

  private async handleError(error: any) {
    this.logger.error(`Failed to save audit event: ${error.message}`);
    if (this.options.apm) {
      await this.options.apm.captureError(error);
    }
  }
}
