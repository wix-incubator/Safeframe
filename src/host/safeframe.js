import $ from 'balalaika';
import * as dom from '../lib/dom.js'
import Status from '../lib/status.js';
import logger from '../lib/logger.js'
import Messages from '../lib/messages';
import NodeRect from '../lib/noderect.js';
import PosMeta from '../lib/posmeta.js'
import {throttle} from '../lib/utils.js';
import Geom from './geom.js';
import Cookie from './cookie.js';

let instances = 1;
const shared_listeners = {};

export default class SafeFrame {

    /**
     * @constructor
     *
     * @param {iframe} iframe - The iframe element that we want to attach SafeFrame API to
     * @param {number} width - The width of the SafeFrame
     * @param {number} height - The height of the SafeFrame
     * @param {object} hostConfig - safeframe host config object
     **/
    constructor(iframe, width, height, hostConfig) {
        this.id = instances++;
        this.node = iframe;
        this.status = Status.COLLAPSED;
        this.node.style.width = width + 'px';
        this.node.style.height = height + 'px';
        this.rect = dom.getRectRelativeTo(this.node, this.node.offsetParent);
        this.collapse_rect = this.rect;

        hostConfig = hostConfig || {};
        this.onBeforePosMsg = hostConfig.onBeforePosMsg || function() {};
        this.onPosMsg = hostConfig.onPosMsg || function() {};

        // All the parameters sent to the iframe are passed through the window.name
        // attribute. Instantiating an AdObject on that iframe, means that the ad
        // has been initialized, so we can store the params and replace the name 
        // attribute with something easier to read.
        const meta = PosMeta.fromString(String(iframe.getAttribute('name') || ''), '/* @echo SECRET_KEY */');
        const conf = meta.value('conf') || {};
        this.features = {
            "exp-ovr": conf["exp-ovr"],
            "exp-push": conf["exp-push"],
            "read-cookie": hostConfig.allowCookieReads && conf["read-cookie"],
            "write-cookie": hostConfig.allowCookieWrites && conf["write-cookie"]
        }
        // This is for debugging only, but it should be safe to expose this on the host
        this.params = {
            public: meta.data,
            private: meta.privateData
        };

        this.messages = new Messages(iframe);
        this.messages
            .on('cookie', this.cookie.bind(this))
            .on('expand', this.expand.bind(this))
            .on('collapse', this.collapse.bind(this))
            .send('registered', {g: this.getGeomInfo(), status: this.status});


        // NOTE: offsetParent is not available for elements that have display style set to none
        if (iframe && iframe.offsetParent && !shared_listeners[iframe]) {
            // From the IAB SafeFrames v1.1 Draft:
            // For scroll or resize events, the Safe Frames host implementation should only listen for
            // these events for the first parent HTML element above the SafeFrame container that is
            // either clipped or scrollable.
            const scroll = dom.getNodeOverflow(iframe.offsetParent);
            if (scroll.xscroll || scroll.yscroll) {
                const fn = throttle(this.scroll.bind(this), 1000);
                $(iframe.offsetParent)
                    .on('scroll', fn)
                    .on('mousedown', fn);
                shared_listeners[iframe] = fn;
            }
        }

        iframe.setAttribute('name', ['da', 'safeframe', this.id].join('-'));
    }

    /**
     * Destroy the SafeFrame
     **/
    nuke() {
        this.messages.send('unload').nuke();

        const fn = shared_listeners[this.node];
        if (fn) {
            $(this.node.offsetParent)
                .off('scroll', fn)
                .off('mousedown', fn);
            delete shared_listeners[this.node];
        }
        this.node.parentNode.removeChild(this.node);
    }

    /**
     * Recalculate win, self, and exp rectangles
     **/
    getGeomInfo() {
        return Geom.get(this.node);
    }

    /**
     * Resize/reposition the ad element
     **/
    setNodeRect(node, rect) {
        if (arguments.length === 1) {
            rect = node;
            node = this.node;
        }
        const px = 'px';
        node.style.top = rect.top + px;
        node.style.left = rect.left + px;
        node.style.width = rect.width + px;
        node.style.height = rect.height + px;
    }

    getNodeStyles(node, attrs) {
        let styles = {};
        attrs.forEach(function(s) {
            styles[s] = node.style[s];
        });
        return styles;
    }

    setNodeStyles(node, styles) {
        for (let s in styles) {
            if (styles.hasOwnProperty(s)) {
                node.style[s] = styles[s];
            }
        }
    }

    /**
     * Returns an object with keys representing what features have been turned on or off for this particular
     * container.
     *
     * @param {string} feature - 
     * @returns {object | boolean}
     **/
    supports(feature) {
        if (feature) {
            return this.features[feature] || false;
        }
        return this.features;
    }

    /**
     * Handles "cookie" read/write message sent from the SafeFrames
     *
     * @param {object} e - Post-message event object
     */
    cookie(e) {
        if (!this.supports('write-cookie') && !this.supports('read-cookie')) {
            return;
        }
        if (this.onBeforePosMsg(e) === true) {
            return;
        }
        this.onPosMsg(e);
        if (e.data.name) {
            if (e.data.value === undefined && this.supports('read-cookie')) {
                return this.messages.send('cookie', {name: e.data.name, value: Cookie.get(e.data.name)});
            } else if (this.supports('write-cookie')) {
                Cookie.set(e.data.name, e.data.value);
                return this.messages.send('cookie', {name: e.data.name, value: Cookie.get(e.data.name)});
            }
        }
    }

    /**
     * Handles "expand" message sent from the SafeFrames
     *
     * @param {object} e - Post-message event object
     */
    expand(e) {
        if (this.onBeforePosMsg(e) === true) {
            return;
        }
        this.onPosMsg(e);

        if (this.status == Status.EXPANDED || this.status == Status.EXPANDING) {
            return;
        }
        this.status = Status.EXPANDING;
        this.messages.send('geom.update', {g: this.getGeomInfo(), status: this.status});


        this.offset_parent = this.node.offsetParent;
        this.rect = dom.getRectRelativeTo(this.node, this.offset_parent);
        this.collapse_rect = new NodeRect(this.rect);

        // TODO: check if opt rect can fit inside of the exp rect
        const opt = e.data || {};
        this.rect.top -= opt.t || 0;
        this.rect.left -= opt.l || 0;
        this.rect.right += opt.r || 0;
        this.rect.bottom += opt.b || 0;
        this.rect.width = this.rect.right - this.rect.left;
        this.rect.height = this.rect.bottom - this.rect.top;

        this.saved_zindex = this.node.style.zIndex;
        if (e.data.push) {
            // push expand
            // Save original size of the offsetParent node
            this.offset_parent_saved_styles = this.getNodeStyles(this.offset_parent, ['width', 'height']);
            this.setNodeStyles(this.offset_parent, {width: Math.max(parseInt(this.rect.width,10), this.offset_parent.offsetWidth)+'px', height: Math.max(parseInt(this.rect.height), this.offset_parent.offsetHeight)+'px'});
            this.setNodeRect(this.rect);
        } else {
            this.offset_parent_saved_styles = false;
            // overlay expand
            this.node.style.position = 'absolute';
            this.setNodeRect(this.rect);
        }
        this.node.style.zIndex = 1e6;
        this.status = Status.EXPANDED;
        this.messages.send('geom.update', {g: this.getGeomInfo(), status: this.status});
    }

    /**
     * Handles "collapse" message sent from the SafeFrames
     *
     * @param {object} e - Post-message event object
     */
    collapse(e) {
        if (this.onBeforePosMsg(e) === true) {
            return;
        }
        this.onPosMsg(e);

        if (this.status == Status.EXPANDED || this.status == Status.EXPANDING) {
            this.status = Status.COLLAPSING;
            this.messages.send('geom.update', {g: this.getGeomInfo(), status: this.status});

            // If we have saved parentOffset restore it
            if (this.offset_parent && this.offset_parent_saved_styles) {
                this.setNodeStyles(this.offset_parent, this.offset_parent_saved_styles);
                this.offset_parent_saved_styles = false;
            }

            this.rect = this.collapse_rect;
            this.node.style.position = 'initial';
            this.node.style.zIndex = this.saved_zindex;
            this.setNodeRect(this.rect);

            this.status = Status.COLLAPSED;
            this.messages.send('geom.update', {g: this.getGeomInfo(), status: this.status});
        }
    }

    /**
     * Handles "resize" events and sends a geom.update message to SafeFrame
     *
     * @param {object} e - Post-message event object
     */
    resize(e) {
        this.messages.send('geom.update', {g: this.getGeomInfo(), status: this.status});
    }

    /**
     * Handles "mouseup" events and sends a geom.update message to SafeFrame
     *
     * This is not defined in the spec, but we find this helpful with dragable 
     * elements on screen, or popup menus that might obstruct the view of the
     * SafeFrames.
     *
     * @param {object} e - Post-message event object
     */
    mouseup(e) {
        this.messages.send('geom.update', {g: this.getGeomInfo(), status: this.status});
    }

    /**
     * Handles "touchend" events and sends a geom.update message to SafeFrame
     *
     * This is not defined in the spec, but we find this helpful with dragable 
     * elements on screen, or popup menus that might obstruct the view of the
     * SafeFrames.
     *
     * @param {object} e - Post-message event object
     */
    touchend(e) {
        this.messages.send('geom.update', {g: this.getGeomInfo(), status: this.status});
    }

    /**
     * Handles "scroll" events and sends a geom.update message to SafeFrame
     *
     * @param {object} e - Post-message event object
     */
    scroll(e) {
        this.messages.send('geom.update', {g: this.getGeomInfo(), status: this.status});
    }

    /**
     * Handles page "blur" events and relays them to SafeFrame
     *
     * @param {object} e - Post-message event object
     */
    blur(e) {
        this.messages.send('blur', {g: this.getGeomInfo(), status: this.status});
    }

    /**
     * Handles page "focus" events and relays them to SafeFrame
     *
     * @param {object} e - Post-message event object
     */
    focus(e) {
        this.messages.send('focus', {g: this.getGeomInfo(), status: this.status});
    }

    /**
     * Handles page "unload" events and relays them to SafeFrame
     *
     * @param {object} e - Post-message event object
     */
    unload(e) {
        this.messages.send('unload', e);
    }
}
