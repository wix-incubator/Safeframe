/**
 * Host page IAB SafeFrames implementation
 * 
 */

import Registry from './registry.js'
import SafeFrame from './safeframe'
import logger from '../lib/logger.js'

class Host {
    constructor() {
        this.registry = new Registry()
        this.errors = [];
    }

    /**
     * Registers the SafeFrame object.
     * @param {SafeFrame} safeframe - An instance of SafeFrame class
     */
    register (safeframe) {
        return this.registry.register(safeframe);
    }

    /**
     * Destroy a SafeFrame object
     */
    nuke (id) {
        this.registry.nuke(id);
    }

    /**
     * The status function is used to determine the status of positions. It returns a Boolean response that
     * indicates whether any positions in the page are currently in the process of being rendered or if some
     * other operation, such as expansion, is occurring.
     *
     * @returns {object}
     */
    status (id) {
        const statuses = {};
        this.registry.each(ad => {
            statuses[ad.id] = ad.status;
        });
        return statuses;
    }

}

export { Host as default }
