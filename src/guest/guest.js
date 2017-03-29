import Ext from './ext.js';
import PosMeta from '../lib/posmeta.js';
import errors from '../lib/errors.js';

export default class Guest {
    constructor() {
        this.ver = "1-1-0";
        this.specVersion = "1.1";

        // $sf.info.errs is not required by the spec, but it helps with the debugging
        this.info = {
            errs: errors
        };
        Object.freeze(this.info);

        // We send the metadata through window.name parameter
        let meta_string;
        try {
            meta_string = decodeURIComponent(String(window.name || '').split('#').slice(1).join('#'));
        } catch(e) {
            errors.push(e);
        }
        const meta = PosMeta.fromString(meta_string, '/* @echo SECRET_KEY */');
        this.ext = new Ext(meta);
    }
}
