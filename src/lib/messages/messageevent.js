// We only listen to events with the namespace == 'dasf'
const NAMESPACE = 'dasf';

let instances = 1;

export default class MessageEvent {
    constructor(e) {
        this.id = instances++;
        this.ts = +new Date();
        this.type = e.type;
        this.data = e.data;
        this.originalEvent = e.originalEvent;
    }

    stringify() {
        return JSON.stringify({
            id: this.id,
            ts: this.ts,
            type: this.type,
            namespace: NAMESPACE,
            data: this.data,
        });
    }

    static fromEvent(e) {
        let msg;
        try {
            msg = JSON.parse(e && e.data);
        } catch(e) {
        };
        if (!msg || !msg.type || !msg.data || msg.namespace !== NAMESPACE) {
            return null;
        }

        msg.originalEvent = e;
        return new MessageEvent(msg);
    }
}
