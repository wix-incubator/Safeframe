export default class Config {
    constructor(conf) {
        conf = conf || {};
        this.ver = "1-1-0";
        this.specVersion = "1.1";
        // @ifdef DEBUG
        conf.debug = true;
        // @endif
        this.debug = !!conf.debug;
        this.auto = true;

        // Whether the host allows reading/writing of cookies from the SafeFrame
        this.allowCookieReads = conf['read-cookie'] || false;
        this.allowCookieWrites = conf['write-cookie'] || false;

        // onBeforePosMsg(id, msgName, data)
        // A function that gets called each time a position sends a request for some functionality. Returning
        // true cancels the command request.
        this.onBeforePosMsg = conf.onBeforePosMsg || false;

        // onPosMsg(id, msgName, data)
        // A callback function which gets called each time a position sends a message up to your web page
        this.onPosMsg = conf.onPosMsg || false;

        // DeviantArt uses server-side rendering of the iframes, and these properties and callbacks
        // are not used
        this.renderFile = conf.renderFile || '';
        this.hostFile = conf.hostFile || '';

        // onEndPosRender(id)
        // A function which gets called each time a position has finished rendering
        this.onEndPosRender = conf.onEndPosRender || false;

        // onFailure(id)
        // A function which gets called anytime a render call has failed or timed out
        this.onFailure = conf.onFailure || false;

        // onStartPosRender(id)
        // A callback function which gets called each time a position is about to be rendered
        this.onStartPosRender = conf.onStartPosRender || false;
        
        // onSuccess(id)
        // A callback function which gets called anytime a render call has successfully completed.
        this.onSuccess = conf.onSuccess || false;
    }
}
