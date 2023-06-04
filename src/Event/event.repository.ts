import {Event} from './event.entity';

export interface EventRepository {
    save(event: Event): Promise<Event>;
    getById(id: string): Promise<Event | undefined>;
    getAll(): Promise<Event[]>;
    remove(event: Event): Promise<void>;
    connect(credentials: Record<string, string | number>): Promise<void>;
    validateConnection(): Promise<void>;
    closeConnection(): Promise<void>;
}

export const Event_Repository = 'EventRepository'