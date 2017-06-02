import WeakMap from 'core-js/es6/weak-map';

import $ from 'balalaika';
import MessageEvent from './messageevent.js';
import logger from '../logger.js'

// Private properties
const props = new WeakMap();

// Instance count
let instances = 1;

/**
 * Messages handles events that are being sent between the Host and the SafeFrames.
 *
 * The instance of the Messages object is bound to either window or the iframe,
 * and only handles events comming from and going to that object.
 **/
export default class Messages {

    constructor(iframe) {
        this.id = instances++;

        // Init private properties
        props.set(this, {
            listeners: {}
        });
        this.mount(iframe);
    }

    trigger(event, params) {
        const listeners = props.get(this).listeners;
        (listeners[event] || []).filter(function(listener) {
            listener(params);
        });
        return this;
    }

    on(event, callback, useCapture) {
        const listeners = props.get(this).listeners;
        const events = String(event || '').split(' ');
        while (events.length) {
            const event = events.pop();
            listeners[event] = listeners[event] || [];
            listeners[event][useCapture ? 'unshift' : 'push'](callback);
        }
        return this;
    }

    off(event, callback) {
        const listeners = props.get(this).listeners;
        const events = String(event || '').split(' ');

        const filterCallback = (listener) => {
            return listener != callback;
        };

        while (events.length) {
            const event = events.pop();
            listeners[event] = (listeners[event] || []).filter(filterCallbacks);
        }
        return this;
    }

    handle(e) {
        if (this.win && (this.win !== e.source)) {
            //logger.log("This handler is not listening to this iframe", this.id, e);
            return;
        }
        const msg = MessageEvent.fromEvent(e);
        if (!msg) {
            //logger.log("These aren't the events you're looking for", this.id, msg);
            return;
        }
        this.trigger(msg.type, msg);
        return this;
    }

    send(type, data) {
        const msg = new MessageEvent({type: type, data: data || {}, originalEvent: { source: window}});
        (this.win || window.top).postMessage(msg.stringify(), '*');
        return this;
    }

    mount(iframe) {
        this.nuke();
        this.win = iframe && iframe.contentWindow;
        $(window).on('message', this.handle.bind(this));
        return this;
    }

    nuke() {
        $(window).off('message', this.handle.bind(this));
        props.get(this).listeners = {};
        return this;
    }
}
