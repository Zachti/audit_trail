import {Event} from './event.entity';

export interface EventRepository {
    save(event: Event): Promise<Event>;
    getById(id: string): Promise<Event | undefined>;
    getAll(): Promise<Event[]>;
    remove(event: Event): Promise<void>;
}

export const Event_Repository = 'EventRepository'