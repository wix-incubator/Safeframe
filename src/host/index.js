import $ from 'balalaika';
import Host from './host.js';
import SafeFrame from './safeframe.js';
import Messages from '../lib/messages';
import logger from '../lib/logger.js';
import Config from './config.js';
import PosMeta from '../lib/posmeta.js';
import Geom from './geom.js';
import * as dom from '../lib/dom.js';
import errors from '../lib/errors.js';

import {throttle} from '../lib/utils.js';

class DeviantArtSafeFramesHost {
    constructor (conf) {
        this.config = new Config(conf);
        this.host = new Host(this.config);
        this.messages = new Messages();
        this.messages.on('register', this.register.bind(this));

        this.triggerAdEvents = (e) => {
            this.host.registry.each((ad) => {
                if (ad[e.type]) {
                    ad[e.type].call(ad, e);
                }
            });
        }

        // When outside updates from host are received
        // - Upon receiving a message from the host side where the container geometry has been
        //   updated by the host itself, such as forcing the content to collapse. See the registration
        //   callback messages.
        // - Upon a scroll of the over all viewable area but only one update per second is allowed
        // - Upon resize of the over all viewable area, but only one update per second is allowed
        this.triggerAdEventsThrottled = throttle(this.triggerAdEvents, 1000);

        $(window)
            .on('mouseup.safeframe', this.triggerAdEventsThrottled)
            .on('touchend.safeframe', this.triggerAdEventsThrottled)
            .on('scroll.safeframe', this.triggerAdEventsThrottled)
            .on('resize.safeframe', this.triggerAdEventsThrottled)
            .on('blur.safeframe', this.triggerAdEvents)
            .on('focus.safeframe', this.triggerAdEvents)
            .on('unload.safeframe', this.triggerAdEvents); 

        logger.log('DeviantArtSafeFramesHost initialized');

        window.$sf = this.api();
    }

    /**
     * Handles "register" events sent from the SafeFrames
     *
     * @param {object} e - Post-message event object
     */
    register(e) {
        if (e && e.originalEvent) {
            // Find the iframe from which we received the message
            const iframes = document.getElementsByTagName('iframe');
            for (let i = 0; i < iframes.length; i++) {
                let iframe = iframes[i];
                if (iframe.contentWindow === e.originalEvent.source) {
                    const ad = new SafeFrame(iframe, e.data.w, e.data.h, this.config);
                    logger.log("Creating new SafeFrame", ad);
                    this.host.registry.register(ad);
                    return;
                }
            }
        }
        errors.push(new Error("Could not find the iframe who sent the 'register' message"));
    }

    api() {
        const api = {
            info: {
                errs: this.host.registry.errors,
                list: this.host.registry.ads
            },
            host: {
                Config: Config,
                PosMeta: PosMeta,
                PosConfig: null, // DeviantArt does not support client-side rendering
                Position: null, // DeviantArt does not support client-side rendering
                conf: this.config,
                nuke: (id) => this.host.registry.nuke(id),
                get: (id) => this.host.registry.get(id)
            },
        };
        Object.freeze(api);
        return api;
    }
}

window.DeviantArtSafeFramesHost = DeviantArtSafeFramesHost;
