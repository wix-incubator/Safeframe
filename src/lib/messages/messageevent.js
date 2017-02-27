// We only listen to events with the namespace == 'dasf'
const NAMESPACE = 'dasf';

let instances = 1;

class MessageEvent {
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
}

MessageEvent.fromEvent = function(e) {
    let msg;
    try {
        msg = JSON.parse(e && e.data);
    } catch(err) {
    }
    if (!msg || !msg.type || !msg.data || msg.namespace !== NAMESPACE) {
        return null;
    }

    msg.originalEvent = e;
    return new MessageEvent(msg);
}

export default MessageEvent;
