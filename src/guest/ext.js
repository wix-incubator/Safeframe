import Messages from '../lib/messages';
import geom from './geom.js';

// Private properties
const props = new WeakMap();

export default class Ext {
    constructor(meta) {
        const messages = new Messages();
        const conf = meta.value('conf') || {};

        // Init private properties
        props.set(this, {
            registered_callbacks : [],
            messages : messages,
            meta : meta,
            hasFocus : false,
            status : 'collapsed',
            geom : Object.assign({}, geom),
            features : {
                "exp-ovr": conf["exp-ovr"],
                "exp-push": conf["exp-push"],
                "read-cookie": conf["read-cookie"],
                "write-cookie": conf["write-cookie"]
            }
        });

        // Wire up the events
        messages
            .on('registered geom.update status.update resize focus blur cookie', (e) => {
                if (e.data.g) {
                    props.get(this).geom = e.data.g;
                }
                if (e.data.status) {
                    props.get(this).status = e.data.status;
                }
                props.get(this).messages.trigger('*', e);
            })
            .on('focus', (e) => {
                props.get(this).hasFocus = true;
            })
            .on('blur', (e) => {
                props.get(this).hasFocus = false;
            })
            .on('*', (e) => {
                props.get(this).registered_callbacks.filter(function(callback) {
                    callback(e);
                });
            });
    }

    /**
     * Use to retrieve metadata about the SafeFrame position that was specified by the host. The host may
     * specify additional metadata about this 3rd party content. The host specifies this metadata using the
     * $sf.host.PosMeta class.
     *
     * @sync  - it can be requested at anytime
     * @return {object | string | number}
     **/
    meta(dict, key) {
        return props.get(this).meta.value(dict, key);
    }

    /**
     * The geom function enables an exchange of geometric dimensions and location of the SafeFrame
     * container and its content in relation to the browser or application window and the screen boundaries of
     * the device in which the host content is being viewed. 
     *
     * @sync  - it can be requested at anytime
     * @returns {object}
     **/
    geom() {
        return props.get(this).geom;
    }

    /**
     * Returns the percentage of area that a container is in view on the screen as a whole number between 0
     * and 100. 
     *
     * @sync  - it can be requested at anytime
     * @returns {number}
     **/
    inViewPercentage() {
        return Math.round(props.get(this).geom.self.iv * 100);
    }

    /**
     * Returns the percentage of area that a container is in view on the screen as a whole number between 0
     * and 100. 
     * Returns whether or not the browser window or tab that contains the SafeFrame has focus, or is currently
     * active.
     *
     * @sync  - it can be requested at anytime
     * @returns {boolean}
     **/
    winHasFocus() {
        return props.get(this).hasFocus;
    }

    /**
     * This method expands the SafeFrame container to the specified geometric position, allowing
     * intermediary expansions. The pixel per direction is the absolute position in respect to the original offset
     * declared by the init register method. If this method is called without the initialization method, an error
     * may be thrown and it will be ignored. The expand method can only be called from initial size in order
     * to maintain performance.
     *
     * Tweening or animation is not supported in the SafeFrame so any animation must be processed by the
     * external party within the container and call this method whenever it needs to expand to its maximum
     * size.
     *
     * At least one of the offset parameters is mandatory. If all of the parameters are missing, the call is
     * ignored and an error may be thrown. At the end of this method the external party registers the status of
     * execution. If the SafeFrame iframe is already at the maximum size, the call is ignored.
     *
     * @example expand({l:400,t:200,push:true});
     *
     * @async
     * @param {object} opts
     **/
    expand(opts) {
        if ((opts.push && this.supports('exp-push')) || (!opts.push && this.supports('exp-ovr'))) {
            props.get(this).messages.send('expand', opts);
        }
    }

    /**
     * This method collapses the SafeFrame container to the original geometric position. This initial size should
     * have been declared in the initialization register method prior to calling this method. If this method is
     * called without the initialization register method, it may throw an error, and will be ignored. If already at
     * the initial size, the call will be ignored. 
     *
     * @async
     **/
    collapse() {
        if (props.get(this).status != "collapsed") {
            props.get(this).messages.send('collapse');
        }
    }

    /**
     * The external party register function registers the SafeFrame platform to accept SafeFrame external
     * party API calls. External party creative declares the initial (collapsed) width and height. Besides width
     * and height, this function can also define a callback function, which informs the external content about
     * various status details.
     * The initial width and height parameters are required in order for SafeFrame to notify the host of the
     * display space needed to render the external content. The callback is a method that returns a success or
     * error code for every command processed, notifying the external party of execution status for every
     * command sent. The external party can then react accordingly. Commands should only be called once
     * while waiting for success or failure notification. Any subsequent calls made before success or failure
     * notification will be ignored. 
     *
     * @param {number} width - The width of the SafeFrame
     * @param {number} height - The height of the SafeFrame
     * @param {function} [callback] - An optional callback function that will be called as a notification of event status
     **/
    register(width, height, callback) {
        if (callback) {
            props.get(this).registered_callbacks.push(callback);
        }
        const data = {w: width, h:height};
        /* @if DEBUG */
        data.params = {
            public: props.get(this).meta.data,
            private: props.get(this).meta.privateData
        };
        /* @endif */
        props.get(this).messages.send('register', data);
    }

    /**
     * Returns an object with keys representing what features have been turned on or off for this particular
     * container.
     *
     * @param {string} feature - 
     * @returns {object | boolean}
     **/
    supports(feature) {
        const features = props.get(this).features;
        if (feature) {
            return features[feature] || false;
        }
        return features;
    }

    /**
     * Returns information about the current state of the container, such as whether or not an expansion
     * command is pending, etc. The following are a list of status code strings that can be returned (more may
     * be added in subsequent versions). Some strings are analogous to status updates received in the
     * function that you provide upon calling $sf.ext.register.
     **/
    status() {
        return props.get(this).status;
    }

    /**
     * Sends a message to the host to read or write a cookie in the host domain. Note that if host supports
     * this functionality, cookie data is not returned directly from this function as it is asynchronous. You must
     * pass a function to $sf.ext.register, which will be then called when the cookie data is set or
     * retrieved.
     *
     * @async reading/writing require passing a function to $sf.ext.register
     *
     * @param {string} name - the name of the cookie 
     * @param {object} [data] - optional data to be stored with the specified cookie
     *
     * @returns {object}
     **/
    cookie(name, data) {
        if (data === undefined) {
            if (this.supports('read-cookie')) {
                props.get(this).messages.send('cookie', {name: name});
            }
        } else {
            if (this.supports('write-cookie')) {
                props.get(this).messages.send('cookie', {name: name, value: data});
            }
        }
    }
}
