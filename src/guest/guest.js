import 'core-js/fn/object/freeze';

import Ext from './ext.js';
import PosMeta from '../lib/posmeta.js';
import errors from '../lib/errors.js';

class Guest {
    constructor() {
        this.ver = "1-1-0";
        this.specVersion = "1.1";

        // $sf.info.errs is not required by the spec, but it helps with the debugging
        this.info = {
            errs: errors
        };
        Object.freeze(this.info);

        // We send the metadata through window.name parameter
        let meta_string = String(window.name || '');
        const meta = PosMeta.fromString(meta_string, '/* @echo SECRET_KEY */');
        window.name = '';
        this.ext = new Ext(meta);
    }
}

export { Guest as default }
