import { Injectable } from '@nestjs/common';
import { InjectQueue} from '@nestjs/bull';
import {JobStatus, Queue} from 'bull';
import { Event } from '../Event/event.entity';

const jobTypes: JobStatus[] = ['waiting', 'active', 'delayed' , 'paused' , 'failed' , 'completed'];

@Injectable()
export class AuditQueueService {

    constructor(
        @InjectQueue('audit') private readonly auditQueue: Queue,
    ) {}

    async enqueue(event: Event): Promise<void> {
        await this.auditQueue.add('saveEvent', event);
    }

    async getAllEvents(): Promise<Event[]> {
        const jobs = await this.auditQueue.getJobs(jobTypes);
        return jobs.map((job) => job.data as Event);
    }

    async removeEvent(event: Event): Promise<void> {
        const jobs = await this.auditQueue.getJobs(jobTypes);
        const jobToRemove = jobs.find((job) => (job.data as Event).id === event.id);

        if (jobToRemove)
            await jobToRemove.remove();
    }

     async clearQueue(): Promise<void> {
        await this.auditQueue.empty();
    }
}
