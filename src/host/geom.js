import * as dom from '../lib/dom.js'
import {max,min} from '../lib/utils.js'

const ELEMENT_NODE = 1;

/**
 * Class that calculates the expand rectangle as specified in 
 * [IAB SafeFrames v1.1 Draft](https://www.iab.com/wp-content/uploads/2014/08/SafeFrames_v1.1_final.pdf)
 * 5.4 Function $sf.ext.geom
 *
 * The algorithm to determine the visible portion of the base element can be
 * split into several steps:
 *
 * -  Finding the first ancestor element that has either the overflow or
 *    clip-path configured. This will be our reference element.
 *
 * -  Get the client bounding rectangle for the reference and base nodes
 *
 * -  Calculate the intersection to get the visible portion of the base element.
 * 
 * -  We then find any elements that might overlap the base element and update
 *    base elements visibility info accordingly.
 *
 * @class GeomCalculator
 */
class GeomCalculator {

    constructor(node) {
        this.node = node;
        this.document = dom.getDocument(node);
        this.window = dom.getWindow(node);
        this.root = dom.getRootNode(node);
        this.ref = this.getRefNode(node.parentNode);
    }

    // Go up the DOM tree and try to find a node that is obscurring the view of the base element either through overflow, clipping, or scroll.
    getRefNode(node) {
        // Loop through parent nodes to check if any of them have clip / overflow setting which would obscure the node
        while (node && node.nodeType == ELEMENT_NODE) {
            const style = dom.getNodeStyle(node);
            if (dom.hasLayout(node) || style.display == 'block' || style.clear != 'none') {
                // This parent node might obscure the base element because
                // of the overflow setting
                const scroll = dom.getNodeOverflow(node);
                if (scroll.xscroll || scroll.yscroll || scroll.xhidden || scroll.yhidden) {
                    return node;
                }

                // This parent node might obscure the base element because
                // of the clip-path setting
                if (dom.isNodeClipped(node)) {
                    return node;
                }
            }
            node = node.parentNode;
        }
    
        return this.root; 
    }

    getNodesOver(node, limit) {
        limit = limit || 1;
        const overlap_nodes = [];
        const node_rect = dom.getRect(this.node);
        const ref_rect = dom.getRect(this.ref);
        const view_rect = dom.getViewportRect(this.node);

        if (!document.elementFromPoint) {
            return overlap_nodes;
        }

        // Find the nodes overlapping the base node.
        // To do this, we place an imaginary grid of points over the base node and
        // see if any of the belong to any other elements using the
        // document.elementFromPoint method.
        const grid = {
            top: max(node_rect.top, ref_rect.top) - view_rect.top,
            right: min(node_rect.right, ref_rect.right) - view_rect.left,
            bottom: min(node_rect.bottom, ref_rect.bottom) - view_rect.top,
            left: max(node_rect.left, ref_rect.left) - view_rect.left
        };
        const x_increment = (grid.right - grid.left) / 10;
        const y_increment = (grid.bottom - grid.top) / 10;
        for (let x = grid.left; x < grid.right; x += x_increment) {
            for (let y = grid.top; y < grid.bottom; y += y_increment) {
                let elem = document.elementFromPoint(x, y);
                // Find the owner of this element that is also obscurring the base element
                while (elem && elem.nodeType == ELEMENT_NODE) {
                    const style = dom.getNodeStyle(elem);
                    if (dom.hasLayout(elem) || style.display == 'block' || style.clear != 'none') {
                        break;
                    }
                    elem = elem.parentNode;
                }

                if (elem && elem.nodeType == ELEMENT_NODE   // if we found the elem
                        && elem != this.node                // and it's different than this.node (our base node)
                        && elem != this.root                // and it's not the page's root
                        && !dom.isParentOf(elem, this.node) // and elem is not this.node's ancestor
                        ) {
                    // that means it is an element that is probably obscurring this.node's view
                    overlap_nodes.push(elem);
                    if (overlap_nodes.length >= limit) {
                        // break
                        x = grid.right;
                        y = grid.bottom;
                    }
                }
            }
        }

        return overlap_nodes;
    }

    /**
     *
     * getWindowGeom()
     *
     * Identifies the location, width, and height (in pixels) of the browser or application window
     * boundaries relative to the device screen.
     *
     * @returns {
     *     t: The y coordinate (in pixels) of the top boundary of the browser or application window relative to the screen
     *     b: The y coordinate (in pixels) of the bottom boundary of the browser or application window relative to the screen
     *     l: The x coordinate (in pixels) of the left boundary of the browser or application window relative to the screen
     *     r: The x coordinate (in pixels) of the right boundary of the browser or application window relative to the screen
     *     w: The width (in pixels) of the browser or application window (win.r – win.l)
     *     h: The height (in pixels) of the browser or application window (win.b – win.t)
     * }
     **/
    getWindowGeom() {
        const height = this.window.innerHeight || 0;
        const width = this.window.innerWidth || 0;
        const top = this.window.screenY || this.window.screenTop || 0;
        const bottom = top + height;
        const left = this.window.screenX || this.window.screenLeft || 0;
        const right = left + width;
        return {
            t: top,
            r: right,
            b: bottom,
            l: left,
            w: width,
            h: height
        };
    }

    /**
     *
     * getSelfGeom()
     *
     * Identifies the z-index and location, width, and height (in pixels) of the SafeFrame container relative
     * to the browser or application window. In addition, width, height, and area percentage of
     * SafeFrame content in view is provided, based on how much of the container is located within the
     * boundaries of the browser or application window.
     *
     * @returns {
     *     t: The y coordinate (in pixels) of the top boundary of the SafeFrame container
     *     l: The x coordinate (in pixels) of the left side boundary of the SafeFrame container
     *     r: The x coordinate (in pixels) of the right side boundary of the SafeFrame container (self.l + width of container)
     *     b: The y coordinate (in pixels) of the bottom boundary of the SafeFrame container (self.t + height of container)
     *     z: The Z-index of the SafeFrame container
     *     w: The width (in pixels) of the SafeFrame container
     *     h: The height (in pixels) of the SafeFrame container
     *     xiv: The percentage (%) of width for the SafeFrame container that is in view (formatted as "0.14" or "1")
     *     yiv: The percentage (%) of height for the SafeFrame container that is in view (formatted as "0.14" or "1")
     *     iv: The percentage (%) of area for the SafeFrame container that is in view (formatted as "0.14" or "1")
     * }
     **/
    getSelfGeom() {
        const node_rect = dom.getRect(this.node);
        const ref_rect = dom.getRect(this.ref);
        const node_style = dom.getNodeStyle(this.node);
        const win_rect = dom.getWindowRect(this.node);

        let xoverlap_ref = node_rect.width;
        let yoverlap_ref = node_rect.height;
        if (this.ref != this.root) {
            // find the horizontal and vertical overlap between the base and the reference node
            xoverlap_ref = max(0, min(node_rect.right, ref_rect.right) - max(node_rect.left, ref_rect.left));
            yoverlap_ref = max(0, min(node_rect.bottom, ref_rect.bottom) - max(node_rect.top, ref_rect.top));
        }
        // find the horizontal and vertical overlap between the base node and the window
        const xoverlap_win = max(0, min(node_rect.right, win_rect.right) - max(node_rect.left, win_rect.left));
        const yoverlap_win = max(0, min(node_rect.bottom, win_rect.bottom) - max(node_rect.top, win_rect.top));
        // The smaller of the two represent the visible area of the base node
        const xoverlap = min(xoverlap_ref, xoverlap_win);
        const yoverlap = min(yoverlap_ref, yoverlap_win);
        const xiv = node_rect.width ? xoverlap/node_rect.width : 0;
        const yiv = node_rect.height ? yoverlap/node_rect.height : 0;
        let iv = (xoverlap * yoverlap) / (node_rect.width * node_rect.height);

        // Deduct the areas of any absolutely positioned elements that might appear over the SafeFrame.
        const maxElementsToFind = 1;
        const stack = this.getNodesOver(this.node, maxElementsToFind);
        if (stack.length) {
            const obstructive_rect = dom.getRect(stack[0]);
            const xobstruct = max(0, min(obstructive_rect.right, node_rect.right) - max(obstructive_rect.left, node_rect.left));
            const yobstruct = max(0, min(obstructive_rect.bottom, node_rect.bottom) - max(obstructive_rect.top, node_rect.top));
            iv = max(0, (xoverlap * yoverlap - xobstruct * yobstruct) / (node_rect.width * node_rect.height));
        }

        return {
            t: node_rect.top,
            r: node_rect.right,
            b: node_rect.bottom,
            l: node_rect.left,
            z: node_style.zIndex,
            w: node_rect.width,
            h: node_rect.height,
            xiv: xiv == 1 ? "1" : Number(xiv).toFixed(2),
            yiv: yiv == 1 ? "1" : Number(yiv).toFixed(2),
            iv: iv == 1 ? "1" : Number(iv).toFixed(2)
        }

    }

    /**
     *
     * geExpandRect()
     *
     * Identifies the expected distance available for expansion within the host
     * content but still retaining visibility, along with information about
     * whether controls allow the end user  to scroll the page. If
     * “scrollable,” the SafeFrame content can expand to  dimensions greater
     * than those provided.
     *
     * @returns {
     *     t:The number of pixels that can be expanded upwards
     *     l: The number of pixels that can be expanded left
     *     r: The number of pixels that can be expanded right
     *     b: The number of pixels that can be expanded down
     *     xs: A response that indicates whether the host content is scrollable along the x-axis (1 = scrollable; 0 = not scrollable)
     *     yx: A response that indicates whether the host content is scrollable along the y-axis (1 = scrollable; 0 = not scrollable)
     * }
     **/
    getExpandGeom() {

        const ref = dom.getRect(this.ref);
        const node = dom.getRect(this.node);
        const win = dom.getWindowRect(this.node);

        const rect = {
            top: max(ref.top, win.top),
            right: min(ref.right, win.right),
            bottom: min(ref.bottom, win.bottom),
            left: max(ref.left, win.left)
        };

        const scroll = dom.getNodeOverflow(this.ref);
        return {
            t: max(0, node.top - rect.top),
            r: max(0, rect.right - node.right),
            b: max(0, rect.bottom - node.bottom),
            l: max(0, node.left - rect.left),
            xs: !!scroll.yscroll,
            ys: !!scroll.xscroll
        };
    }

    getGeom() {
        return {
            win: this.getWindowGeom(),
            self: this.getSelfGeom(),
            exp: this.getExpandGeom()
        }
    }
}

const Geom = {
    get: function(node) {
        const calc = new GeomCalculator(node);
        return calc.getGeom();
    }
}

export default Geom;
