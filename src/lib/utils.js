export function noop(n) {
}

export function isNumeric(n) {
    return n !== null && !isNaN(+n) && isFinite(n);
}

export function max() {
    return Array.prototype.reduce.call(arguments, function(acc, n) {
        if (!isNumeric(n)) {
            n = Number.MIN_SAFE_INTEGER;
        }
        return acc < n ? n : acc;
    }, Number.MIN_SAFE_INTEGER);
}

export function min() {
    return Array.prototype.reduce.call(arguments, function(acc, n) {
        if (!isNumeric(n)) {
            n = Number.MAX_SAFE_INTEGER;
        }
        return acc > n ? n : acc;
    }, Number.MAX_SAFE_INTEGER);
}

export function throttle(callback, limit) {
    let must_wait = false;
    return function () {
        if (!must_wait) {
            must_wait = true;
            setTimeout(() => {
                must_wait = false;
                callback.apply(this, arguments);
            }, limit || 1);
        }
    }
}

