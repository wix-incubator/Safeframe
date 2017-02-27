import NodeRect from './noderect.js'

export function getParentNode(node) {
    return node && node.parentNode;
}

export function getNodeStyle(node, attr) {
    if (!node) {
        return null;
    }

    const style = window.document.defaultView.getComputedStyle(node);
    if (attr && style.hasOwnProperty(attr)) {
        return style[attr];
    }

    return style;
}

// The Element.getBoundingClientRect() method returns the size of an element and its position relative to the viewport.
export function getRect(node) {
    let rect;
    if (node && node.style) {
        // If the node has display:none then getBoundingClientRect will return 0,0,0,0
        const old_display = node.style.display;
        node.style.display = 'block'; // must be visible
        rect = node.getBoundingClientRect();
        node.style.display = old_display;
        rect = new NodeRect(rect);
        const scroll = getScroll();
        // Convert it to absolute position
        rect.left += scroll.x;
        rect.right += scroll.x;
        rect.top += scroll.y;
        rect.bottom += scroll.y;
    } else {
        rect = new NodeRect(0);
    }
    return rect;
}

export function getRectRelativeTo(node, ref) {
    const rect = getRect(node);

    // ref is usually node.offsetParent, which is null if the node is display:none
    if (ref) {
        const ref_rect = getRect(ref);
        rect.top =  rect.top - ref_rect.top + ref.scrollTop;
        rect.bottom = rect.top + rect.height + ref.scrollTop;
        rect.left = rect.left - ref_rect.left + ref.scrollLeft;
        rect.right = rect.left + rect.width + ref.scrollLeft;
    }
    return rect;
}

export function getScroll() {
    return {
        x: pageXOffset,
        y: pageYOffset
    };
}

export function getViewportRect() {
    return new NodeRect(
            window.pageYOffset,
            (window.pageXOffset + window.innerWidth),
            (window.pageYOffset + window.innerHeight),
            window.pageXOffset,
            window.innerWidth,
            window.innerHeight
            );
}

export function getDocument(node) {
    try {
        if (node.nodeType == 9) {
            return node;
        } else {
            return node.ownerDocument;
        }
    } catch (e) {
        // errorblind
    }
}

export function getWindow(node) {
    const doc = getDocument(node);
    let win;

    try {
        if (doc) {
            win = doc.parentWindow || doc.defaultView || window;
        }
    } catch (e) {
        win = window;
    }
    return win;
}

export function getWindowRect(node) {
    const win = getWindow(node);
    const rect = new NodeRect(0, window.innerWidth, window.innerHeight, 0, window.innerWidth, window.innerHeight);
    // Convert it to absolute position
    const scroll = getScroll();
    rect.left += scroll.x;
    rect.right += scroll.x;
    rect.top += scroll.y;
    rect.bottom += scroll.y;
    return rect;
}

export function getRootNode(node) {
    const doc = getDocument(node);
    if (doc) {
        return doc.documentElement || doc.body; // body for opera
    }
}

export function getRootRect(node) {
    const root = getRootNode(node) || {};
    const rect = new NodeRect();
    rect.right =
    rect.width = root.scrollWidth || 0;
    rect.bottom =
    rect.height = root.scrollHeight || 0;
    return rect;
}

export function isParentOf(parent, node) {
    while (node) {
        if (node == parent) {
            return true;
        }
        node = node.parentNode;
    }
    return false;
}

export function hasLayout(node) {
    const style = getNodeStyle(node);
    return (style.display == 'inline-block'
        || style.float != 'none'
        || style.position == 'absolute' 
        || style.position == 'fixed'
        || style.width != 'auto' 
        || style.height !='auto');
}

export function getNodeOverflow(node) {
    const style = getNodeStyle(node);
    const overflow = {};

    // The scrollbar size is calculated as a difference between
    // the offsetWidth and clientWidth.
    //
    // The HTMLElement.offsetWidth read-only property returns the
    // layout width of an element. Typically, an element's
    // offsetWidth is a measurement which includes the element
    // borders, the element horizontal padding, the element
    // vertical scrollbar (if present, if rendered) and the element
    // CSS width.
    //
    // The Element.clientWidth property is zero for elements with
    // no CSS or inline layout boxes, otherwise it's the inner
    // width of an element in pixels. It includes padding but not
    // the vertical scrollbar (if present, if rendered), border or
    // margin.
    //
    if (style.overflowX == 'scroll' || style.overflowX == 'auto') {
        overflow.xscroll = node.offsetWidth - node.clientWidth;
    } else {
        overflow.xscroll = 0;
    }
    if (style.overflowY == 'scroll' || style.overflowY == 'auto') {
        overflow.yscroll = node.offsetHeight - node.clientHeight;
    } else {
        overflow.yscroll = 0;
    }
    overflow.xhidden = (style.overflowX == 'hidden');
    overflow.yhidden = (style.overflowY == 'hidden');
    return overflow;
}

export function isNodeClipped(node) {
    const style = getNodeStyle(node);
    if ((style.clip && style.clip != "auto") ||
        (style.clipPath && style.clipPath != "none")) {
        return true;
    }
    return false;
}
