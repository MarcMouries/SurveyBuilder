
// EventEmitter class allows objects to subscribe to and emit events.

export class EventEmitter {
    private static listeners = new Map<string, Function[]>();

    // Registers a listener for a specific event.
    public static on(event: string, listener: Function) {
        if (!EventEmitter.listeners.has(event)) {
            EventEmitter.listeners.set(event, []);
        }
        EventEmitter.listeners.get(event)?.push(listener);
    }

    // Removes a specific listener for a given event.
    public static off(event: string, listener: Function) {
        const listeners = EventEmitter.listeners.get(event);
        if (listeners) {
            const index = listeners.indexOf(listener);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    // Emits an event, calling all registered listeners with provided arguments.
    public static emit(event: string, ...args: any[]) {
        const listeners = EventEmitter.listeners.get(event);
        if (listeners) {
            listeners.forEach(listener => {
                listener(...args);
            });
        }
    }
}
