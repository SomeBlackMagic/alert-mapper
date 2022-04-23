import { EventBusInterface } from '@elementary-lab/standards/src/EventBusInterface';

export class TraceableEventBus<T> implements EventBusInterface<T> {

    private bus: EventBusInterface<T>;

    private emittedEvents: EventDescription[] = [];
    private listeners: ListenersDescription[] = [];

    public constructor(bus: EventBusInterface<T>) {
        this.bus = bus;
    }

    public emit(eventName: string, ...args: any[]): boolean {
        this.emittedEvents.push({
            eventName: eventName,
            args: args
        });
        return this.bus.emit(eventName, args);
    }

    public on(action: string, handler: (...args: any[]) => void): T {
        this.listeners.push({
            action: action,
            method: 'on'

        });
        return this.bus.on(action, handler);
    }

    public once(action: string, handler: (...args: any[]) => void): T {
        this.listeners.push({
            action: action,
            method: 'once'

        });
        return this.bus.once(action, handler);
    }

    public removeListener(action: string): Promise<T> {
        return this.bus.removeListener(action);
    }

    public getAllEvents(): EventDescription[] {
        return this.emittedEvents;
    }

    public getAllListeners(): ListenersDescription[] {
        return this.listeners;
    }

    listenerCount(action: string): number {
        return -1;
    }

}

export interface EventDescription {
    eventName: string;
    args: any[];
}

export interface ListenersDescription {
    action: string;
    method: string;
}
