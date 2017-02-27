const geom = {
    // geom should be updated on:
    //  - render
    //  - expand
    //  - collapse
    //  - geom.update
    //  - status.update
    //  - resize
    win: {
        // Identifies the location, width, and height (in pixels) of the
        // browser or application window boundaries relative to the device
        // screen
        t:0, l:0, b:0, r:0, w:0, h:0
    },
    self: {
        // Identifies the z-index and location, width, and height 
        // (in pixels) of the SafeFrame container relative to the
        // browser or application window (win). 
        t:0, l:0, b:0, r:0, w:0, h:0,
        xiv: 0, /* % x in view */
        yiv: 0, /* % y in view */
        iv: 0,  /* % area in view */
        z: 0   /* z-index */
    },
    exp: {
        // Identifies the expected distance available for expansion
        // within the host content along with information about whether
        // controls allow the end user to scroll the page. If
        // “scrollable,” the SafeFrame content can expand to
        // dimensions greater than those provided.
        t:0, l:0, b:0, r:0,
        xs: 0, // Is the host content is scrollable along the x-axis (1 = scrollable; 0 = not scrollable) 
        yx: 0 // Is the host content is scrollable along the y-axis (1 = scrollable; 0 = not scrollable) 
    }
};

export {geom as default}
