import Ext from './ext.js';
import PosMeta from '../lib/posmeta.js';

export default class Guest {
    constructor() {
        this.ver = "1-1-0";
        this.specVersion = "1.1";
        // We send the metadata through window.name parameter
        const meta = PosMeta.fromString(decodeURIComponent(String(window.name || '').split('#').slice(1).join('#')), '/* @echo SECRET_KEY */');
        this.ext = new Ext(meta);
    }
}
