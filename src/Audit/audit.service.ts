import {
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { EventRepository } from '../Event/event.repository';
import { validate } from 'class-validator';
import { Event } from '../Event/event.entity';
import { AuditConsumer } from '../AuditConsumer/audit.consumer';
import { TransactionData } from '../Types/transactionData.interface';
import { v4 as uuidv4 } from 'uuid';
import {AuditOptions } from './audit.interfaces';
import { EVENT_REPOSITORY, AUDIT_OPTIONS, AUDIT_CONSUMER } from '../Types/constants';

@Injectable()
export class AuditService implements OnModuleInit, OnModuleDestroy {
  private readonly logger: Logger;
  constructor(
    @Inject(AUDIT_OPTIONS) private options: AuditOptions,
    @Inject(EVENT_REPOSITORY) private eventRepository: EventRepository,
    private readonly auditConsumer: AuditConsumer,
) {
    this.logger = options.logger ?? new Logger(AuditService.name);
  }

  async createNewAudit(transactionData: TransactionData): Promise<void> {
    const event = await this.toEvent(transactionData);
    event.timestamp = new Date().toString();
    await this.validateEvent(event);
    try {
      await this.auditConsumer.addToBuffer(event);
    } catch (error) {
      await this.handleError(error, event);
    }
  }

  async onModuleInit(): Promise<void> {
    if (!this.areShutdownHooksEnabled) {
      throw new Error(
        'Shutdown hooks are not enabled. Please call app.enableShutdownHooks() in your application.',
      );
    }
    this.logger.log('AuditService module initialized');
    await this.eventRepository.connect(this.options.credentials);
    await this.eventRepository.validateConnection();
  }

  async onModuleDestroy(): Promise<void> {
    await this.auditConsumer.handleModuleDestroy();
    await this.eventRepository.closeConnection();
  }

  private toEvent(transactionData: TransactionData): Event {
    return {
      id: uuidv4(),
      ...transactionData,
      timestamp: transactionData.timestamp
        ? transactionData.timestamp
        : new Date().toString(),
    };
  }

  private async validateEvent(event: Event): Promise<void> {
    const errors = await validate(event);

    if (errors.length > 0) {
      await this.handleError(errors, event);
    }
  }

  private async handleError(errors: any[], event: Event) {
    const errorMessages = errors
      .map((error) => Object.values(error.constraints)).flat();
    errorMessages.forEach((error, index) => {
      this.logger.error(`Audit Error ${index + 1}: ${error.toString()}`);
    });
    if (this.options.apm) {
      await this.options.apm.captureError(errors);
    }
    await this.auditConsumer.addToBuffer(event);
  }

  private areShutdownHooksEnabled(): boolean {
    return Boolean(
      process.listeners('SIGINT').length || process.listeners('SIGTERM').length,
    );
  }
}
