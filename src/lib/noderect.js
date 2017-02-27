import {min, max, isNumeric} from './utils.js'

export default class NodeRect {
    constructor(top, right, bottom, left, width, height) {
        if (arguments.length == 1 && !isNumeric(arguments[0])) {
            if (Array.isArray(arguments[0])) {
                return this.fromArray(arguments[0]);
            }
            return this.fromObject(arguments[0]);
        }
        this.fromArray(arguments);
    }

    fromArray(arr) {
        this.reset();
        if (arr.length >= 6) {
            this.top    = arr[0];
            this.right  = arr[1];
            this.bottom = arr[2];
            this.left   = arr[3];
            this.width  = arr[4];
            this.height = arr[5];
        } else if (arr.length >= 4) {
            this.top    = arr[0];
            this.right  = arr[1];
            this.bottom = arr[2];
            this.left   = arr[3];
        } else if (arr.length == 3) {
            this.top    = arr[0];
            this.right  = arr[1];
            this.bottom = arr[2];
            this.left   = 0;
        } else if (arr.length == 2) {
            this.top    = arr[0];
            this.right  = arr[1];
            this.bottom = arr[0];
            this.left   = arr[1];
        } else {
            this.top    = arr[0];
            this.right  = arr[0];
            this.bottom = arr[0];
            this.left   = arr[0];
        }
        this.update();
    }

    fromObject(obj) {
        return this.fromArray([obj.top, obj.right, obj.bottom, obj.left, obj.width, obj.height]);
    }

    update() {
        if (!this.width) {
            this.width = this.right - this.left;
        }
        if (!this.height) {
            this.height = this.bottom - this.top;
        }
    }

    reset(value) {
        value = value || 0;
        this.top    = value;
        this.right  = value;
        this.bottom = value;
        this.left   = value;
        this.width  = value;
        this.height = value;
    }

    getArea() {
        return (this.right - this.left) * (this.bottom - this.top);
    }

    static getOverlapRect(r1, r2) {
        const l = max(r1.left, r2.left);
        const r = min(r1.left + r1.width, r2.left + r2.width);
        const t = max(r1.top, r2.top);
        const b = min(r1.top + r1.height, r2.top + r2.height);
        if (r >= l && b >= t) {
            return new NodeRect(t, r, b, l, r - l, b - t);
        }
        return false;
    }

    static getOverlapArea(r1, r2) {
        const xoverlap = max(0, min(r1.right, r2.right) - max(r1.left, r2.left));
        const yoverlap = max(0, min(r1.bottom, r2.bottom) - max(r1.top, r2.top));
        
        return xoverlap * yoverlap;
    }
}
