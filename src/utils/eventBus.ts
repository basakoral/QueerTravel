type EventCallback = (data?: any) => void;

const EventBus = {
    events: {} as Record<string, EventCallback[]>,

    subscribe(event: string, callback: EventCallback) {
        if (!this.events[event]) this.events[event] = [];
        this.events[event].push(callback);
    },

    publish(event: string, data?: any) {
        if (this.events[event]) {
            this.events[event].forEach(callback => callback(data));
        }
    }
};

export default EventBus;
