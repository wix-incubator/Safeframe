/**
 * Registry manages ad objects
 */

import logger from '../lib/logger.js'
import errors from '../lib/errors.js'
import SafeFrame from './safeframe'

class Registry {
    constructor () {
        this.ads = [];
        this.errors = errors;
    }

    /**
     * Register a SafeFrame ad
     **/
    register (ad) {
        if (!(ad instanceof SafeFrame)) {
            logger.error('Ad must be an instance of ads.safeframe.iab.Ad', ad);
        }

        if (this.ads.findIndex(id => id == ad.id) > -1) {
            logger.warn('Ad with the specified id already exists.', ad.id);
        }

        this.ads.push(ad);
    }

    /**
     * Destroy the SafeFrame and remove it from the registry
     **/
    nuke (id) {
        if (id !== undefined) {
            const idx = this.ads.findIndex(ad => id == ad.id);
            if (idx > -1) {
                this.ads[idx].nuke();
                this.ads.splice(idx, 1);
            } else {
                this.errors.push(new Error("Could not nuke a safeframe. The safeframe with the supplied id could not be found.", {id: id}));
            }
            return;
        }
        // Nuke all ads
        while (this.ads.length) {
            const ad = this.ads.pop();
            ad.nuke();
        }
    }

    /**
     * Get a SafeFrame with the specific id
     **/
    get (id) {
        const safeframe = this.ads.find(ad => ad.id == id);
        if (!safeframe) {
            this.errors.push(new Error("Could not get a safeframe that has the supplied id.", {id: id}));
        }
        return safeframe;
    }

    /**
     * Process each registered SafeFrame with a callback
     **/
    each (callback) {
        this.ads.forEach(callback);
    }
}

export { Registry as default }
