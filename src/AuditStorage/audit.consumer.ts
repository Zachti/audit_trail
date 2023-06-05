import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectQueue, OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Job, Queue } from 'bullmq';
import { Event } from '../Event/event.entity';
import { EventRepository } from '../Event/event.repository';
import { AuditOptions } from '../Audit/audit.interfaces';
import { AUDIT_OPTIONS, AUDIT_QUEUE , EVENT_REPOSITORY  } from '../Types/constants';

@Processor(AUDIT_QUEUE)
@Injectable()
export class AuditConsumer {
  private readonly logger: Logger;
  private buffer: Event[] = []; // Buffer to store events
  private readonly bufferSize: number;

  constructor(
    @Inject(AUDIT_OPTIONS) private options: AuditOptions,
    @Inject(EVENT_REPOSITORY) private eventRepository: EventRepository,
    @InjectQueue(AUDIT_QUEUE) private readonly auditQueue: Queue,
  ) {
    this.bufferSize = options.bufferSize ?? 1000;
    this.logger = options.logger ?? new Logger(AuditConsumer.name);
  }


  @Process('*')
  private async saveJob(job: Job) {
    await this.eventRepository.save(job.data);
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
      events.map((event) => ({ name: 'saveEvent', data: event, attempts: -1, })),
    );
  }

  @OnQueueFailed()
  private async handleError(error: any) {
    this.logger.error(`Failed to save audit event: ${error.message}`);
    if (this.options.apm) {
      await this.options.apm.captureError(error);
    }
  }
}
