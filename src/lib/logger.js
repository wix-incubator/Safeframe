/**
 * Simple proxy to window.console
 */

// @ifdef DEBUG 
window.DA_DEBUG = true;
// @endif

const _log = (type, args = []) => {
    if (window.DA_DEBUG && window.console) {
        console[type].apply(console, args);
    }
}

class Logger {
    log(...args) {
        return _log('log', args);
    }
    warn(...args) {
        return _log('warn', args);
    }
    error(...args) {
        return _log('error', args);
    }
    info(...args) {
        return _log('info', args);
    }
}

// Singleton
const logger = new Logger();
window.logger = logger;

export {logger as default}
